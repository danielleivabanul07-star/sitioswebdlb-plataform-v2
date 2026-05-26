import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";

  const token = header.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      error: "Token requerido"
    });
  }

  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET || "temporal_secret"
    );

    next();
  } catch {
    return res.status(401).json({
      error: "Token inválido"
    });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Acceso denegado"
    });
  }

  next();
}