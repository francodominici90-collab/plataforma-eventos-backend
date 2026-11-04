import * as usersRepository from "../repositories/users.repository.js";
import { hashPassword } from "../utils/hash.js";

export async function registerUser(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw createError("El body debe ser un objeto JSON", 400);
  }

  const requiredFields = [
    "first_name",
    "last_name",
    "email",
    "password"
  ];

  const missingFields = requiredFields.filter((field) => {
    const value = data[field];

    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    );
  });

  if (missingFields.length > 0) {
    throw createError(
      `Faltan campos obligatorios: ${missingFields.join(", ")}`,
      400
    );
  }

  for (const field of requiredFields) {
    if (typeof data[field] !== "string") {
      throw createError(`El campo ${field} debe ser un texto`, 400);
    }
  }

  const first_name = data.first_name.trim();
  const last_name = data.last_name.trim();
  const email = data.email.trim().toLowerCase();
  const password = data.password;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw createError("El email tiene un formato inválido", 400);
  }

  if ([...password].length < 8) {
    throw createError(
      "La contraseña debe tener al menos 8 caracteres",
      400
    );
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw createError(
      "La contraseña no puede superar los 72 bytes en UTF-8",
      400
    );
  }

  const existingUser = await usersRepository.getByEmail(email);

  if (existingUser) {
    throw createError("El email ya está registrado", 409);
  }

  const hashedPassword = await hashPassword(password);

  let user;

  try {
    user = await usersRepository.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: "user"
    });
  } catch (error) {
    if (error.code === 11000) {
      throw createError("El email ya está registrado", 409);
    }

    throw error;
  }

  return {
    id: user._id.toString(),
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role
  };
}

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
}