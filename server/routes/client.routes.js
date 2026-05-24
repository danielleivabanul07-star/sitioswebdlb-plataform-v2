import express from "express";

import {
  clientData,
  saveClientData,
  projects,
  saveProjects
} from "../store.js";

import { readUsers } from "../db.js";

const router = express.Router();

router.get("/:email", (req, res) => {
  const email = req.params.email;

  if (!clientData[email]) {
    clientData[email] = {
      phone: "",
      hours: "",
      facebook: "",
      instagram: "",
      tiktok: "",
      photos: []
    };

    saveClientData();
  }

  res.json(clientData[email]);
});

router.post("/:email", (req, res) => {
  const email = req.params.email;

  clientData[email] = {
    phone: req.body.phone || "",
    hours: req.body.hours || "",
    facebook: req.body.facebook || "",
    instagram: req.body.instagram || "",
    tiktok: req.body.tiktok || "",
    photos: req.body.photos || []
  };

  saveClientData();

  const users = readUsers();

  const user = users.find((u) => u.email === email);

  if (user && projects[user.id]) {
    projects[user.id] = {
      ...projects[user.id],

      business: {
        ...projects[user.id].business,

        phone: clientData[email].phone,
        hours: clientData[email].hours,
        facebook: clientData[email].facebook,
        instagram: clientData[email].instagram,
        tiktok: clientData[email].tiktok
      },

      gallery: clientData[email].photos.map((photo) => ({
        src: photo.url,
        title: photo.name,
        description: ""
      }))
    };

    saveProjects();
  }

  res.json({
    success: true,
    data: clientData[email]
  });
});

export default router;