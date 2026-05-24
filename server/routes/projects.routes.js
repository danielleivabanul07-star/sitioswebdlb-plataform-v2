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
    clientId
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

router.post("/:clientIdOrSlug", (req, res) => {
  try {
    const users = readUsers();

    const { clientIdOrSlug } = req.params;
    const projectKey = getProjectKey(clientIdOrSlug);

    projects[projectKey] = {
      ...req.body,
      clientId: projectKey
    };

    saveProjects();

    const user = users.find(
      (u) => String(u.id) === String(projectKey)
    );

    if (user) {
      clientData[user.email] = {
        ...(clientData[user.email] || {}),
        phone: projects[projectKey].business?.phone || "",
        hours: projects[projectKey].business?.hours || "",
        facebook: projects[projectKey].business?.facebook || "",
        instagram: projects[projectKey].business?.instagram || "",
        tiktok: projects[projectKey].business?.tiktok || "",
        photos: (projects[projectKey].gallery || []).map((photo) => ({
          id: photo.id || randomUUID(),
          name: photo.title || "Imagen",
          url: photo.src
        }))
      };

      saveClientData();
    }

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