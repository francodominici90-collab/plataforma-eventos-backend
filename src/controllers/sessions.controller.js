export function getSessionStatus(req, res) {
  return res.status(200).json({
    status: "success",
    message: "Recurso de sesiones preparado. Autenticación pendiente."
  });
}