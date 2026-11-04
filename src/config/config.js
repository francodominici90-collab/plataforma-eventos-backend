import { config } from "dotenv";

config();

const requiredVariables = ["PORT", "NODE_ENV"];

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

export const env = {
  PORT: port,
  NODE_ENV: process.env.NODE_ENV.trim(),
  MONGO_URL: process.env.MONGO_URL?.trim() || "",
  JWT_SECRET: process.env.JWT_SECRET || ""
};