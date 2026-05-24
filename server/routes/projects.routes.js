import express from "express";
import { randomUUID } from "crypto";
import { defaultProject } from "../../src/utils/defaultProject.js";
import users from "../db.js";

import {
  projects,
  clientData,
  saveProjects,
  saveClientData
} from "../store.js";

const router = express.Router();

function findClientByIdOrSlug(value) {
  return users.find(
    (user) =>
      String(user.id) === String(value) ||
      String(user.slug || "") === String(value)
  );
}

function getProjectKey(value) {
  const user = findClientByIdOrSlug(value);

  if (user) {
    return String(user.id);
  }

  return String(value);
}

function createProjectForClient(clientId) {
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
  const { clientIdOrSlug } = req.params;

  const projectKey = getProjectKey(clientIdOrSlug);

  if (!projects[projectKey]) {
    projects[projectKey] = createProjectForClient(projectKey);
    saveProjects();
  }

  res.json(projects[projectKey]);
});

router.post("/:clientIdOrSlug", (req, res) => {
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
});

export default router;