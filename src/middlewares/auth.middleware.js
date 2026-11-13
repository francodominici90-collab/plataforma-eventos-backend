import { verifyToken } from "../utils/jwt.js";

export function auth(req, res, next) {
  const token = req.cookies?.currentUser;

  if (typeof token !== "string" || !token) {
    return res.status(401).json({
      status: "error",
      message: "No autenticado"
    });
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({
      status: "error",
      message: "No autenticado"
    });
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.id !== "string" ||
    !payload.id ||
    typeof payload.email !== "string" ||
    !payload.email ||
    !["user", "organizer", "admin"].includes(payload.role) ||
    !Number.isInteger(payload.exp)
  ) {
    return res.status(401).json({
      status: "error",
      message: "No autenticado"
    });
  }

  req.user = {
    id: payload.id,
    email: payload.email,
    role: payload.role
  };

  return next();
}