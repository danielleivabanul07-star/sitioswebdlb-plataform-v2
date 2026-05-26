import express from "express";
import { randomUUID } from "crypto";
import { defaultProject } from "../../src/utils/defaultProject.js";
import { readUsers } from "../db.js";

import {
  projects,
  clientData,
  saveProjects,
  saveClientData
} from "../store.js";

import {
  requireAuth,
  requireAdmin
} from "../middleware/auth.js";

const router = express.Router();

function findClientByIdOrSlug(value) {
  const users = readUsers();

  return users.find(
    (user) =>
      String(user.id) === String(value) ||
      String(user.slug || "") === String(value)
  );
}

function getProjectKey(value) {
  const user = findClientByIdOrSlug(value);

  return user ? String(user.id) : String(value);
}

function createProjectForClient(clientId) {
  const users = readUsers();

  const user = users.find(
    (u) => String(u.id) === String(clientId)
  );

  const baseProject = {
    ...defaultProject,
    clientId: String(clientId)
  };

  if (user) {
    baseProject.business = {
      ...baseProject.business,
      name: user.businessName || baseProject.business.name,
      email: user.email || baseProject.business.email,
      phone: user.phone || baseProject.business.phone
    };
  }

  return baseProject;
}

function syncClientDataFromProject(projectKey) {
  const users = readUsers();

  const user = users.find(
    (u) => String(u.id) === String(projectKey)
  );

  if (!user) return;

  const project = projects[projectKey];

  clientData[user.email] = {
    ...(clientData[user.email] || {}),

    phone: project.business?.phone || "",
    hours: project.business?.hours || "",
    facebook: project.business?.facebook || "",
    instagram: project.business?.instagram || "",
    tiktok: project.business?.tiktok || "",

    photos: (project.gallery || []).map((photo) => ({
      id: photo.id || randomUUID(),
      name: photo.title || "Imagen",
      url: photo.src
    }))
  };

  saveClientData();
}

// =========================
// CLIENT GET OWN PROJECT
// =========================

router.get("/me/project", requireAuth, (req, res) => {
  try {
    const projectKey = String(req.user.id);

    if (!projects[projectKey]) {
      projects[projectKey] = createProjectForClient(projectKey);
      saveProjects();
    }

    res.json(projects[projectKey]);
  } catch (err) {
    console.error("ERROR GET CLIENT PROJECT:", err);

    res.status(500).json({
      error: "Error cargando proyecto del cliente",
      detail: err.message
    });
  }
});

// =========================
// CLIENT UPDATE OWN PROJECT
// =========================

router.patch("/me/project", requireAuth, (req, res) => {
  try {
    const projectKey = String(req.user.id);

    if (!projects[projectKey]) {
      projects[projectKey] = createProjectForClient(projectKey);
    }

    const current = projects[projectKey];

    projects[projectKey] = {
      ...current,

      business: {
        ...current.business,

        phone:
          req.body.business?.phone ??
          current.business?.phone ??
          "",

        hours:
          req.body.business?.hours ??
          current.business?.hours ??
          "",

        facebook:
          req.body.business?.facebook ??
          current.business?.facebook ??
          "",

        instagram:
          req.body.business?.instagram ??
          current.business?.instagram ??
          "",

        tiktok:
          req.body.business?.tiktok ??
          current.business?.tiktok ??
          "",

        description:
          req.body.business?.description ??
          current.business?.description ??
          ""
      },

      gallery:
        Array.isArray(req.body.gallery)
          ? req.body.gallery
          : current.gallery ?? [],

      updatedAt: new Date().toISOString()
    };

    saveProjects();
    syncClientDataFromProject(projectKey);

    res.json({
      success: true,
      project: projects[projectKey]
    });
  } catch (err) {
    console.error("ERROR SAVE CLIENT PROJECT:", err);

    res.status(500).json({
      error: "Error guardando proyecto del cliente",
      detail: err.message
    });
  }
});

// =========================
// ADMIN UPDATE ANY PROJECT
// =========================

router.patch(
  "/admin/:clientId",
  requireAuth,
  requireAdmin,
  (req, res) => {
    try {
      const projectKey = String(req.params.clientId);

      if (!projects[projectKey]) {
        projects[projectKey] = createProjectForClient(projectKey);
      }

      projects[projectKey] = {
        ...projects[projectKey],
        ...req.body,
        clientId: projectKey,
        updatedAt: new Date().toISOString()
      };

      saveProjects();
      syncClientDataFromProject(projectKey);

      res.json({
        success: true,
        project: projects[projectKey]
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

// =========================
// PUBLIC GET PROJECT BY ID OR SLUG
// =========================

router.get("/:clientIdOrSlug", (req, res) => {
  try {
    const { clientIdOrSlug } = req.params;
    const projectKey = getProjectKey(clientIdOrSlug);

    if (!projects[projectKey]) {
      projects[projectKey] = createProjectForClient(projectKey);
      saveProjects();
    }

    res.json(projects[projectKey]);
  } catch (err) {
    console.error("ERROR GET PROJECT:", err);

    res.status(500).json({
      error: "Error cargando proyecto",
      detail: err.message
    });
  }
});

// =========================
// LEGACY SAVE PROJECT
// =========================

router.post("/:clientIdOrSlug", (req, res) => {
  try {
    const { clientIdOrSlug } = req.params;
    const projectKey = getProjectKey(clientIdOrSlug);

    projects[projectKey] = {
      ...projects[projectKey],
      ...req.body,
      clientId: projectKey,
      updatedAt: new Date().toISOString()
    };

    saveProjects();
    syncClientDataFromProject(projectKey);

    res.json({
      success: true,
      project: projects[projectKey]
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