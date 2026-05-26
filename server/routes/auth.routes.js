console.log("AUTH ROUTES CARGADAS");

import express from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../config/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();

    const { data, error } = await supabase.rpc("login_user", {
      p_email: email,
      p_password: password
    });

    if (error || !data || data.length === 0) {
      return res.status(401).json({
        error: "Email o contraseña incorrectos"
      });
    }

    const user = data[0];

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role || "admin",
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
        role: user.role || "admin",
        email: user.email,
        name: user.name,
        businessName: user.businessName,
        status: user.status,
        plan: user.plan,
        siteUrl: user.siteUrl
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