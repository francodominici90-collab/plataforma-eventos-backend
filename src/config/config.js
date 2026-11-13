import { config } from "dotenv";

config();

const requiredVariables = [
  "PORT",
  "NODE_ENV",
  "MONGO_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN"
];

for (const variable of requiredVariables) {
  if (!process.env[variable]?.trim()) {
    throw new Error(
      `Falta la variable de entorno requerida: ${variable}`
    );
  }
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(
    "PORT debe ser un número entero entre 1 y 65535"
  );
}

const nodeEnv = process.env.NODE_ENV.trim();

if (!["development", "test", "production"].includes(nodeEnv)) {
  throw new Error(
    "NODE_ENV debe ser development, test o production"
  );
}

const jwtSecret = process.env.JWT_SECRET.trim();

if (Buffer.byteLength(jwtSecret, "utf8") < 32) {
  throw new Error(
    "JWT_SECRET debe tener al menos 32 bytes"
  );
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN.trim();

if (!/^[1-9]\d*(s|m|h|d)$/.test(jwtExpiresIn)) {
  throw new Error(
    "JWT_EXPIRES_IN debe indicar una duración positiva, como 30s, 15m, 1h o 1d"
  );
}

export const env = {
  PORT: port,
  NODE_ENV: nodeEnv,
  MONGO_URL: process.env.MONGO_URL.trim(),
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: jwtExpiresIn
};