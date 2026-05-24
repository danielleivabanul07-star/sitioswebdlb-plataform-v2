import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

const projectsPath = path.join(dataDir, "projects.json");
const clientDataPath = path.join(dataDir, "clientData.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadJson(filePath) {
  try {
    ensureDataDir();

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
    }

    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("ERROR LOAD JSON:", err);
    return {};
  }
}

export const projects = loadJson(projectsPath);
export const clientData = loadJson(clientDataPath);

export function saveProjects() {
  ensureDataDir();

  fs.writeFileSync(
    projectsPath,
    JSON.stringify(projects, null, 2)
  );
}

export function saveClientData() {
  ensureDataDir();

  fs.writeFileSync(
    clientDataPath,
    JSON.stringify(clientData, null, 2)
  );
}