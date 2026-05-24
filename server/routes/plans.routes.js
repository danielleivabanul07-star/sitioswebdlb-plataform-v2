import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const plansPath = path.join(process.cwd(), "server", "data", "plans.json");

router.get("/", (req, res) => {
  try {
    const data = fs.readFileSync(plansPath, "utf-8");
    const plans = JSON.parse(data);

    res.json(plans);
  } catch (error) {
    res.status(500).json({
      error: "Error cargando los planes"
    });
  }
});

export default router;