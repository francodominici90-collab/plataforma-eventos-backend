import * as sessionsService from "../services/sessions.service.js";
import { env } from "../config/config.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  path: "/"
};

export function getSessionStatus(req, res) {
  return res.status(200).json({
    status: "success",
    message: "Recurso de sesiones disponible."
  });
}

export async function register(req, res) {
  try {
    const user = await sessionsService.registerUser(req.body);

    return res.status(201).json({
      status: "success",
      payload: user
    });
  } catch (error) {
    return handleError(
      error,
      res,
      "No se pudo registrar el usuario"
    );
  }
}

export async function login(req, res) {
  try {
    const token = await sessionsService.loginUser(req.body);

    res.cookie("currentUser", token, {
      ...cookieOptions,
      maxAge: 3600000
    });

    return res.status(200).json({
      status: "success",
      message: "Login correcto"
    });
  } catch (error) {
    return handleError(
      error,
      res,
      "No se pudo iniciar sesión"
    );
  }
}

export function current(req, res) {
  const { id, email, role } = req.user;

  return res.status(200).json({
    status: "success",
    payload: {
      id,
      email,
      role
    }
  });
}

export function logout(req, res) {
  res.clearCookie("currentUser", cookieOptions);

  return res.status(200).json({
    status: "success",
    message: "Sesión cerrada"
  });
}

function handleError(error, res, fallbackMessage) {
  if ([400, 401, 409].includes(error.statusCode)) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message
    });
  }

  console.error(fallbackMessage, error.message);

  return res.status(500).json({
    status: "error",
    message: fallbackMessage
  });
}