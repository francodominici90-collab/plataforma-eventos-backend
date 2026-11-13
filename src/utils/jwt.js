import jwt from "jsonwebtoken";
import { env } from "../config/config.js";

export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"]
  });
}