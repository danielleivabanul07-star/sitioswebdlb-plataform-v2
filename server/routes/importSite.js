import express from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { supabase } from "../config/db.js";

const router = express.Router();

const BUCKET_NAME = "imported-sites";

const upload = multer({
  dest: "uploads/zips"
});

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  const types = {
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf"
  };

  return types[ext] || "application/octet-stream";
}

function walkFiles(dir) {
  let results = [];

  const list = fs.readdirSync(dir, {
    withFileTypes: true
  });

  for (const item of list) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      results = results.concat(walkFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

function normalizeStoragePath(value) {
  return value.replace(/\\/g, "/");
}

router.post("/import-site", upload.single("zipFile"), async (req, res) => {
  let tempZipPath = null;
  let extractPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: "ZIP no encontrado"
      });
    }

    tempZipPath = req.file.path;

    const clientId = String(req.body.clientId || `client-${Date.now()}`)
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, "-");

    extractPath = path.join(
      process.cwd(),
      "uploads",
      "client-sites-temp",
      clientId
    );

    fs.rmSync(extractPath, {
      recursive: true,
      force: true
    });

    fs.mkdirSync(extractPath, {
      recursive: true
    });

    const zip = new AdmZip(tempZipPath);

    zip.extractAllTo(extractPath, true);

    const files = walkFiles(extractPath);

    if (!files.length) {
      return res.status(400).json({
        error: "El ZIP está vacío"
      });
    }

    const hasIndex = files.some((file) => {
      return path.basename(file).toLowerCase() === "index.html";
    });

    if (!hasIndex) {
      return res.status(400).json({
        error: "El ZIP debe contener un index.html"
      });
    }

    const uploadedFiles = [];

    for (const filePath of files) {
      const relativePath = normalizeStoragePath(
        path.relative(extractPath, filePath)
      );

      const storagePath = `${clientId}/${relativePath}`;

      const fileBuffer = fs.readFileSync(filePath);

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType: getContentType(filePath),
          upsert: true
        });

      if (error) {
        console.error("SUPABASE UPLOAD ERROR:", error);

        return res.status(500).json({
          error: "Error subiendo archivos a Supabase Storage",
          detail: error.message
        });
      }

      uploadedFiles.push(storagePath);
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${clientId}/index.html`);

    return res.json({
      success: true,
      message: "Sitio importado correctamente a Supabase Storage",
      clientId,
      indexUrl: data.publicUrl,
      files: uploadedFiles
    });
  } catch (error) {
    console.error("IMPORT SITE ERROR:", error);

    return res.status(500).json({
      error: "Error importando sitio",
      detail: error.message
    });
  } finally {
    if (tempZipPath) {
      fs.rmSync(tempZipPath, {
        force: true
      });
    }

    if (extractPath) {
      fs.rmSync(extractPath, {
        recursive: true,
        force: true
      });
    }
  }
});

export default router;