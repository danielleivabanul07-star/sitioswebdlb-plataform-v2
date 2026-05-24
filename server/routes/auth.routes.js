import express from "express";
import jwt from "jsonwebtoken";
import users from "../db.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "").trim();

  const user = users.find(
    (u) =>
      String(u.email).trim().toLowerCase() === email &&
      String(u.password).trim() === password
  );

  if (!user) {
    return res.status(401).json({
      error: "Email o contraseña incorrectos"
    });
  }

  const userStatus = String(user.status || "").trim().toLowerCase();

  if (user.role === "client" && userStatus === "suspendido") {
    return res.status(403).json({
      error: "Tu cuenta está suspendida. Contacta con SitiosWebDLB."
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET || "temporal_secret",
    {
      expiresIn: "7d"
    }
  );

  res.json({
    token,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      businessName: user.businessName,
      status: user.status,
      plan: user.plan,
      siteUrl: user.siteUrl
    }
  });
});

export default router;