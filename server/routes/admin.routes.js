import express from "express";
import users, { saveUsers } from "../db.js";

const router = express.Router();

function createSlug(value) {
  return String(value || "sitio")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// =========================
// GET CLIENTS
// =========================

router.get("/clients", (req, res) => {
  const clients = users.filter((user) => user.role === "client");
  res.json(clients);
});

// =========================
// CREATE CLIENT
// =========================

router.post("/clients", (req, res) => {
  const rawSlug =
    String(req.body.slug || "").trim() ||
    String(req.body.businessName || "sitio").trim();

  const slug = createSlug(rawSlug);

  const newClient = {
    id: Date.now(),
    businessName: req.body.businessName,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    role: "client",
    status: req.body.status || "activo",
    plan: req.body.plan || "Basic",
    slug,
    siteUrl: `/site/${slug}`
  };

  users.push(newClient);
  saveUsers(users);

  res.json(newClient);
});

// =========================
// UPDATE CLIENT
// =========================

router.patch("/clients/:id", (req, res) => {
  const id = Number(req.params.id);

  const client = users.find((user) => user.id === id);

  if (!client) {
    return res.status(404).json({
      message: "Cliente no encontrado"
    });
  }

  Object.assign(client, req.body);

  if (req.body.slug || req.body.businessName) {
    const rawSlug =
      String(req.body.slug || "").trim() ||
      String(req.body.businessName || "sitio").trim();

    const slug = createSlug(rawSlug);

    client.slug = slug;
    client.siteUrl = `/site/${slug}`;
  }

  saveUsers(users);

  res.json(client);
});

// =========================
// DELETE CLIENT
// =========================

router.delete("/clients/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    users.splice(index, 1);
    saveUsers(users);
  }

  res.json({
    message: "Cliente eliminado"
  });
});

export default router;