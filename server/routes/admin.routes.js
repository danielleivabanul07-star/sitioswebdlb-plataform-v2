import express from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../config/db.js";

const router = express.Router();

function createSlug(value) {
  return String(value || "sitio")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

router.get("/clients", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "client")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Error cargando clientes" });
  }
});

router.post("/clients", async (req, res) => {
  try {
    const rawSlug =
      String(req.body.slug || "").trim() ||
      String(req.body.businessName || "sitio").trim();

    const slug = createSlug(rawSlug);

    const passwordHash = await bcrypt.hash(
      String(req.body.password || "").trim(),
      10
    );

    const newClient = {
      businessName: req.body.businessName,
      email: String(req.body.email || "").trim().toLowerCase(),
      phone: req.body.phone,
      password_hash: passwordHash,
      role: "client",
      status: req.body.status || "activo",
      plan: req.body.plan || "Basic",
      slug,
      siteUrl: `/site/${slug}`
    };

    const { data, error } = await supabase
      .from("users")
      .insert([newClient])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error creando cliente" });
  }
});

router.patch("/clients/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body };

    if (req.body.password) {
      updateData.password_hash = await bcrypt.hash(
        String(req.body.password).trim(),
        10
      );

      delete updateData.password;
    }

    if (req.body.slug || req.body.businessName) {
      const rawSlug =
        String(req.body.slug || "").trim() ||
        String(req.body.businessName || "sitio").trim();

      const slug = createSlug(rawSlug);

      updateData.slug = slug;
      updateData.siteUrl = `/site/${slug}`;
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .eq("role", "client")
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error actualizando cliente" });
  }
});

router.delete("/clients/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .eq("role", "client");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Cliente eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando cliente" });
  }
});

export default router;