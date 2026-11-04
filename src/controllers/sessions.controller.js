import * as sessionsService from "../services/sessions.service.js";

export function getSessionStatus(req, res) {
  return res.status(200).json({
    status: "success",
    message: "Recurso de sesiones disponible. Autenticación pendiente."
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
    if (error.statusCode === 400 || error.statusCode === 409) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message
      });
    }

    console.error("No se pudo registrar el usuario:", error.message);

    return res.status(500).json({
      status: "error",
      message: "No se pudo registrar el usuario"
    });
  }
}