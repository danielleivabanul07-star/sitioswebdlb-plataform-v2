import express from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

const router = express.Router();

const upload = multer({
  dest: "uploads/zips"
});

router.post("/import-site", upload.single("zipFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "ZIP no encontrado"
      });
    }

    const clientId = req.body.clientId || `client-${Date.now()}`;

    const extractPath = path.join(
      process.cwd(),
      "uploads",
      "client-sites",
      clientId
    );

    fs.mkdirSync(extractPath, { recursive: true });

    const zip = new AdmZip(req.file.path);

    zip.extractAllTo(extractPath, true);

    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      message: "Sitio importado correctamente",
      path: extractPath
    });
  } catch (error) {
    console.error("IMPORT SITE ERROR:", error);

    return res.status(500).json({
      error: "Error importando sitio"
    });
  }
});

export default router;