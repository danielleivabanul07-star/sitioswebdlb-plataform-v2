import express from "express";
import { randomUUID } from "crypto";
import { defaultProject } from "../../src/utils/defaultProject.js";
import { supabase } from "../config/db.js";

import {
  requireAuth,
  requireAdmin
} from "../middleware/auth.js";

const router = express.Router();

async function findClientByIdOrSlug(value) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .or(`id.eq.${value},slug.eq.${value}`)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getProjectKey(value) {
  const user = await findClientByIdOrSlug(value);
  return user ? String(user.id) : String(value);
}

async function createProjectForClient(clientId) {
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", clientId)
    .maybeSingle();

  const baseProject = {
    ...defaultProject,
    clientId: String(clientId)
  };

  if (user) {
    baseProject.business = {
      ...baseProject.business,
      name: user.businessName || baseProject.business?.name,
      email: user.email || baseProject.business?.email,
      phone: user.phone || baseProject.business?.phone
    };
  }

  return baseProject;
}

async function getOrCreateProject(clientId) {
  const { data: existing, error: getError } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();

  if (getError) throw getError;

  if (existing?.data) {
    return existing.data;
  }

  const newProject = await createProjectForClient(clientId);

  const { error: insertError } = await supabase
    .from("projects")
    .insert([
      {
        client_id: clientId,
        data: newProject
      }
    ]);

  if (insertError) throw insertError;

  return newProject;
}

async function saveProject(clientId, projectData) {
  const cleanProject = {
    ...projectData,
    clientId: String(clientId),
    updatedAt: new Date().toISOString()
  };

  const { error } = await supabase
    .from("projects")
    .upsert(
      {
        client_id: clientId,
        data: cleanProject,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: "client_id"
      }
    );

  if (error) throw error;

  return cleanProject;
}

async function syncClientDataFromProject(clientId, project) {
  const business = project.business || {};

  await supabase
    .from("users")
    .update({
      phone: business.phone || "",
      businessName: business.name || undefined,
      siteUrl: `/site/${clientId}`
    })
    .eq("id", clientId);
}

// CLIENT GET OWN PROJECT
router.get("/me/project", requireAuth, async (req, res) => {
  try {
    const project = await getOrCreateProject(req.user.id);
    res.json(project);
  } catch (err) {
    console.error("ERROR GET CLIENT PROJECT:", err);

    res.status(500).json({
      error: "Error cargando proyecto del cliente",
      detail: err.message
    });
  }
});

// CLIENT UPDATE OWN PROJECT
router.patch("/me/project", requireAuth, async (req, res) => {
  try {
    const current = await getOrCreateProject(req.user.id);

    const updatedProject = {
      ...current,
      ...req.body,
      business: {
        ...current.business,
        ...(req.body.business || {})
      },
      gallery: Array.isArray(req.body.gallery)
        ? req.body.gallery.map((photo) => ({
            ...photo,
            id: photo.id || randomUUID()
          }))
        : current.gallery || [],
      updatedAt: new Date().toISOString()
    };

    const saved = await saveProject(req.user.id, updatedProject);
    await syncClientDataFromProject(req.user.id, saved);

    res.json({
      success: true,
      project: saved
    });
  } catch (err) {
    console.error("ERROR SAVE CLIENT PROJECT:", err);

    res.status(500).json({
      error: "Error guardando proyecto del cliente",
      detail: err.message
    });
  }
});

// ADMIN UPDATE ANY PROJECT
router.patch(
  "/admin/:clientId",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const clientId = String(req.params.clientId);
      const current = await getOrCreateProject(clientId);

      const updatedProject = {
        ...current,
        ...req.body,
        clientId,
        business: {
          ...current.business,
          ...(req.body.business || {})
        },
        updatedAt: new Date().toISOString()
      };

      const saved = await saveProject(clientId, updatedProject);
      await syncClientDataFromProject(clientId, saved);

      res.json({
        success: true,
        project: saved
      });
    } catch (err) {
      console.error("ERROR ADMIN SAVE PROJECT:", err);

      res.status(500).json({
        error: "Error guardando proyecto desde admin",
        detail: err.message
      });
    }
  }
);

// PUBLIC GET PROJECT BY ID OR SLUG
router.get("/:clientIdOrSlug", async (req, res) => {
  try {
    const projectKey = await getProjectKey(req.params.clientIdOrSlug);
    const project = await getOrCreateProject(projectKey);

    res.json(project);
  } catch (err) {
    console.error("ERROR GET PROJECT:", err);

    res.status(500).json({
      error: "Error cargando proyecto",
      detail: err.message
    });
  }
});

// LEGACY SAVE PROJECT
router.post("/:clientIdOrSlug", async (req, res) => {
  try {
    const projectKey = await getProjectKey(req.params.clientIdOrSlug);

    const current = await getOrCreateProject(projectKey);

    const updatedProject = {
      ...current,
      ...req.body,
      clientId: projectKey,
      updatedAt: new Date().toISOString()
    };

    const saved = await saveProject(projectKey, updatedProject);
    await syncClientDataFromProject(projectKey, saved);

    res.json({
      success: true,
      project: saved
    });
  } catch (err) {
    console.error("ERROR SAVE PROJECT:", err);

    res.status(500).json({
      error: "Error guardando proyecto",
      detail: err.message
    });
  }
});

export default router;