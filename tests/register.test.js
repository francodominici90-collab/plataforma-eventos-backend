import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { before, after, test } from "node:test";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import request from "supertest";

const TEST_DATABASE = "plataforma_eventos_test";
const runId = randomUUID();
const testEmails = new Set();

let app;
let User;

function getDatabaseName(uri) {
  try {
    return decodeURIComponent(new URL(uri).pathname.slice(1));
  } catch {
    throw new Error(
      "La URI de MongoDB no tiene un formato válido. Revisá tu .env."
    );
  }
}

function createUserData(label) {
  const email = `${runId}-${label}@example.com`;
  testEmails.add(email);

  return {
    first_name: "Ana",
    last_name: "Pérez",
    email,
    password: "Secreta123"
  };
}

function register(data) {
  return request(app)
    .post("/api/sessions/register")
    .send(data)
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

  // Estos valores cambian únicamente dentro del proceso de pruebas.
  process.env.NODE_ENV = "test";
  process.env.PORT = "3000";
  process.env.MONGO_URL = testUri;

  // Importamos la aplicación después de configurar el entorno.
  ({ default: app } = await import("../src/app.js"));
  ({ default: User } = await import("../src/models/User.js"));

  await mongoose.connect(testUri, {
    dbName: TEST_DATABASE,
    serverSelectionTimeoutMS: 10000
  });

  await User.init();

  assert.equal(mongoose.connection.name, TEST_DATABASE);
});

after(async () => {
  try {
    if (
      User &&
      mongoose.connection.readyState === 1 &&
      mongoose.connection.name === TEST_DATABASE &&
      testEmails.size > 0
    ) {
      // Elimina únicamente los usuarios de esta ejecución.
      await User.deleteMany({
        email: { $in: [...testEmails] }
      });
    }
  } finally {
    await mongoose.disconnect();
  }
});

test("201: registra, normaliza email y protege rol y contraseña", async () => {
  const data = createUserData("registro");
  const normalizedEmail = data.email;

  const response = await register({
    ...data,
    email: `  ${normalizedEmail.toUpperCase()}  `,
    role: "admin"
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.status, "success");

  const user = response.body.payload;

  assert.deepEqual(
    Object.keys(user).sort(),
    ["id", "first_name", "last_name", "email", "role"].sort()
  );

  assert.ok(mongoose.isValidObjectId(user.id));
  assert.equal(user.first_name, data.first_name);
  assert.equal(user.last_name, data.last_name);
  assert.equal(user.email, normalizedEmail);
  assert.equal(user.role, "user");

  const storedUser = await User.findById(user.id)
    .select("+password")
    .lean();

  assert.ok(storedUser);
  assert.equal(storedUser.email, normalizedEmail);
  assert.equal(storedUser.role, "user");
  assert.notEqual(storedUser.password, data.password);
  assert.equal(bcrypt.getRounds(storedUser.password), 12);

  assert.equal(
    await bcrypt.compare(data.password, storedUser.password),
    true
  );
});

test("409: rechaza un email duplicado aunque cambien mayúsculas y espacios", async () => {
  const data = createUserData("duplicado");

  const firstResponse = await register(data);
  assert.equal(firstResponse.status, 201);

  const secondResponse = await register({
    ...data,
    email: `  ${data.email.toUpperCase()}  `
  });

  assert.equal(secondResponse.status, 409);
  assert.deepEqual(secondResponse.body, {
    status: "error",
    message: "El email ya está registrado"
  });

  const count = await User.countDocuments({ email: data.email });
  assert.equal(count, 1);
});

const invalidCases = [
  {
    label: "faltantes",
    description: "campos obligatorios faltantes",
    modify: (data) => ({ email: data.email })
  },
  {
    label: "email",
    description: "email inválido",
    modify: (data) => ({
      ...data,
      email: `${runId}-correo-invalido`
    })
  },
  {
    label: "corta",
    description: "contraseña demasiado corta",
    modify: (data) => ({ ...data, password: "123" })
  },
  {
    label: "bytes",
    description: "contraseña de 73 bytes",
    modify: (data) => ({ ...data, password: "a".repeat(73) })
  },
  {
    label: "unicode",
    description: "contraseña con emojis que supera 72 bytes",
    modify: (data) => ({ ...data, password: "😀".repeat(19) })
  },
  {
    label: "tipo",
    description: "contraseña con tipo incorrecto",
    modify: (data) => ({ ...data, password: 12345678 })
  }
];

for (const example of invalidCases) {
  test(`400: rechaza ${example.description} sin guardar usuarios`, async () => {
    const originalData = createUserData(example.label);
    const invalidData = example.modify(originalData);

    if (typeof invalidData.email === "string") {
      testEmails.add(invalidData.email.trim().toLowerCase());
    }

    const emails = [...testEmails];

    const countBefore = await User.countDocuments({
      email: { $in: emails }
    });

    const response = await register(invalidData);

    assert.equal(response.status, 400);
    assert.equal(response.body.status, "error");
    assert.equal(typeof response.body.message, "string");
    assert.ok(response.body.message.length > 0);
    assert.equal(Object.hasOwn(response.body, "password"), false);
    assert.equal(Object.hasOwn(response.body, "payload"), false);

    const countAfter = await User.countDocuments({
      email: { $in: emails }
    });

    assert.equal(countAfter, countBefore);
  });
}