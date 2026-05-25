import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import jwt from "jsonwebtoken";

import { readUsers } from "./db.js";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import clientRoutes from "./routes/client.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import plansRoutes from "./routes/plans.routes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "50mb"
  })
);

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true
  })
);

// =========================
// TEST SERVER
// =========================

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente 🚀");
});

// =========================
// LOGIN DIRECTO
// =========================

app.post("/api/auth/login", (req, res) => {
  const users = readUsers();

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

// =========================
// RUTAS API
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/plans", plansRoutes);

// =========================
// IA COPY
// =========================

app.post("/api/ai-copy", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({
        error: "Falta OPENAI_API_KEY en .env. Puedes usar el builder sin IA."
      });
    }

    const { businessName, businessType, services } = req.body;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
Crea textos profesionales en español para una página web.

Negocio: ${businessName}
Tipo: ${businessType}
Servicios: ${services?.map((s) => s.title).join(", ")}

Devuelve JSON con:
hero, about, why, serviceDescriptions array.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    res.json({
      text: response.output_text
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// =========================
// SEARCH
// =========================

app.get("/api/search", async (req, res) => {
  try {
    if (!process.env.SERPAPI_KEY) {
      return res.status(400).json({
        error: "Falta SERPAPI_KEY en .env. Puedes usar el builder sin búsqueda real."
      });
    }

    const q = encodeURIComponent(req.query.q || "");
    const url = `https://serpapi.com/search.json?q=${q}&api_key=${process.env.SERPAPI_KEY}`;

    const r = await fetch(url);
    const data = await r.json();

    res.json({
      results: (data.organic_results || []).slice(0, 5).map((item) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet
      }))
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// =========================
// START SERVER
// =========================

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`SitiosWebDLB API corriendo en http://localhost:${port}`);
});