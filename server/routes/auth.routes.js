console.log("AUTH ROUTES CARGADAS");

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabase } from "../config/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({
        error: "Email y contraseña son requeridos"
      });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({
        error: "Email o contraseña incorrectos"
      });
    }

    if (user.status === "suspendido") {
      return res.status(403).json({
        error: "Usuario suspendido"
      });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      user.password_hash || ""
    );

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Email o contraseña incorrectos"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role || "client",
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
        role: user.role || "client",
        email: user.email,
        name: user.name,
        businessName: user.businessName,
        status: user.status,
        plan: user.plan,
        siteUrl: user.siteUrl,
        slug: user.slug
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
});

export default router;