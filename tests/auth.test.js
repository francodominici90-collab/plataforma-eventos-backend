import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { before, after, test } from "node:test";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";

const TEST_DATABASE = "plataforma_eventos_test";
const testSecret = randomBytes(32).toString("hex");

const userData = {
  first_name: "Prueba",
  last_name: "Autenticación",
  email: `auth-${randomUUID()}@example.com`,
  password: "Secreta123"
};

let app;
let User;
let registeredUser;

function getDatabaseName(uri) {
  try {
    return decodeURIComponent(new URL(uri).pathname.slice(1));
  } catch {
    throw new Error(
      "La URI de MongoDB no tiene un formato válido. Revisá tu .env."
    );
  }
}

function assertUnauthenticated(response) {
  assert.equal(response.status, 401);

  assert.deepEqual(response.body, {
    status: "error",
    message: "No autenticado"
  });
}

function assertInvalidCredentials(response) {
  assert.equal(response.status, 401);

  assert.deepEqual(response.body, {
    status: "error",
    message: "Credenciales inválidas"
  });

  const cookies = response.headers["set-cookie"] ?? [];

  assert.equal(
    cookies.some((cookie) => cookie.startsWith("currentUser=")),
    false
  );
}

function getAuthCookie(response) {
  const cookies = response.headers["set-cookie"] ?? [];
  const cookie = cookies.find((value) =>
    value.startsWith("currentUser=")
  );

  assert.ok(cookie, "La respuesta debe incluir la cookie currentUser");

  return cookie;
}

function getExpectedPayload() {
  return {
    id: registeredUser.id,
    email: userData.email,
    role: "user"
  };
}

function login(data) {
  return request(app)
    .post("/api/sessions/login")
    .send(data)
    .timeout(15000);
}

function currentWithToken(token) {
  return request(app)
    .get("/api/sessions/current")
    .set("Cookie", `currentUser=${token}`)
    .timeout(15000);
}

before(async () => {
  const testUri = process.env.MONGO_TEST_URL?.trim();

  if (!testUri) {
    throw new Error("Falta MONGO_TEST_URL en el archivo .env");
  }

  if (getDatabaseName(testUri) !== TEST_DATABASE) {
    throw new Error(
      `Las pruebas requieren la base ${TEST_DATABASE}`
    );
  }

  const applicationUri = process.env.MONGO_URL?.trim();

  if (
    applicationUri &&
    getDatabaseName(applicationUri) === TEST_DATABASE
  ) {
    throw new Error(
      "MONGO_URL y MONGO_TEST_URL deben utilizar bases diferentes"
    );
  }

  // Cambios exclusivos del proceso de pruebas.
  process.env.NODE_ENV = "test";
  process.env.PORT = "3000";
  process.env.MONGO_URL = testUri;
  process.env.JWT_SECRET = testSecret;
  process.env.JWT_EXPIRES_IN = "1h";

  ({ default: app } = await import("../src/app.js"));
  ({ default: User } = await import("../src/models/User.js"));

  await mongoose.connect(testUri, {
    dbName: TEST_DATABASE,
    serverSelectionTimeoutMS: 10000
  });

  await User.init();

  assert.equal(mongoose.connection.name, TEST_DATABASE);

  const response = await request(app)
    .post("/api/sessions/register")
    .send(userData)
    .timeout(15000);

  assert.equal(response.status, 201);

  registeredUser = response.body.payload;
});

after(async () => {
  try {
    if (
      User &&
      mongoose.connection.readyState === 1 &&
      mongoose.connection.name === TEST_DATABASE
    ) {
      // Elimina únicamente el usuario de esta ejecución.
      await User.deleteMany({ email: userData.email });
    }
  } finally {
    await mongoose.disconnect();
  }
});

test("Login, cookie, current y logout funcionan en un mismo flujo", async () => {
  const agent = request.agent(app);

  const loginResponse = await agent
    .post("/api/sessions/login")
    .send({
      email: `  ${userData.email.toUpperCase()}  `,
      password: userData.password
    })
    .timeout(15000);

  assert.equal(loginResponse.status, 200);

  assert.deepEqual(loginResponse.body, {
    status: "success",
    message: "Login correcto"
  });

  const cookie = getAuthCookie(loginResponse);

  assert.match(cookie, /;\s*HttpOnly(?:;|$)/i);
  assert.match(cookie, /;\s*SameSite=Lax(?:;|$)/i);
  assert.match(cookie, /;\s*Max-Age=3600(?:;|$)/i);
  assert.match(cookie, /;\s*Path=\/(?:;|$)/i);

  // En entorno test usamos HTTP, por eso Secure debe estar desactivado.
  assert.doesNotMatch(cookie, /;\s*Secure(?:;|$)/i);

  const token = decodeURIComponent(
    cookie.split(";")[0].slice("currentUser=".length)
  );

  const payload = jwt.verify(token, testSecret, {
    algorithms: ["HS256"]
  });

  assert.deepEqual(
    Object.keys(payload).sort(),
    ["id", "email", "role", "iat", "exp"].sort()
  );

  assert.equal(payload.id, registeredUser.id);
  assert.equal(payload.email, userData.email);
  assert.equal(payload.role, "user");
  assert.equal(payload.exp - payload.iat, 3600);

  const currentResponse = await agent
    .get("/api/sessions/current")
    .timeout(15000);

  assert.equal(currentResponse.status, 200);

  assert.deepEqual(currentResponse.body, {
    status: "success",
    payload: getExpectedPayload()
  });

  const logoutResponse = await agent
    .post("/api/sessions/logout")
    .timeout(15000);

  assert.equal(logoutResponse.status, 200);

  assert.deepEqual(logoutResponse.body, {
    status: "success",
    message: "Sesión cerrada"
  });

  const clearedCookie = getAuthCookie(logoutResponse);
  assert.match(clearedCookie, /^currentUser=;/);

  const afterLogout = await agent
    .get("/api/sessions/current")
    .timeout(15000);

  assertUnauthenticated(afterLogout);
});

test("401: login rechaza un email inexistente con mensaje genérico", async () => {
  const response = await login({
    email: `inexistente-${randomUUID()}@example.com`,
    password: userData.password
  });

  assertInvalidCredentials(response);
});

test("401: login rechaza una contraseña incorrecta con el mismo mensaje", async () => {
  const response = await login({
    email: userData.email,
    password: "Incorrecta123"
  });

  assertInvalidCredentials(response);
});

test("401: login rechaza la ausencia de contraseña", async () => {
  const response = await login({
    email: userData.email
  });

  assertInvalidCredentials(response);
});

test("401: current rechaza una solicitud sin cookie", async () => {
  const response = await request(app)
    .get("/api/sessions/current")
    .timeout(15000);

  assertUnauthenticated(response);
});

test("401: current rechaza una cookie que no contiene un JWT", async () => {
  const response = await currentWithToken("token-invalido");

  assertUnauthenticated(response);
});

test("401: current rechaza un JWT cuyo rol fue manipulado", async () => {
  const validToken = jwt.sign(
    getExpectedPayload(),
    testSecret,
    {
      algorithm: "HS256",
      expiresIn: "1h"
    }
  );

  const [header, encodedPayload, signature] = validToken.split(".");

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8")
  );

  payload.role = "admin";

  const modifiedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  // Cambia el rol, pero conserva la firma original.
  const manipulatedToken =
    `${header}.${modifiedPayload}.${signature}`;

  const response = await currentWithToken(manipulatedToken);

  assertUnauthenticated(response);
});

test("401: current rechaza un JWT correctamente firmado pero vencido", async () => {
  const expiredToken = jwt.sign(
    getExpectedPayload(),
    testSecret,
    {
      algorithm: "HS256",
      expiresIn: -10
    }
  );

  // Verifica que el token falla específicamente por vencimiento.
  assert.throws(
    () =>
      jwt.verify(expiredToken, testSecret, {
        algorithms: ["HS256"]
      }),
    { name: "TokenExpiredError" }
  );

  const response = await currentWithToken(expiredToken);

  assertUnauthenticated(response);
});