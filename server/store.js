import fs from "fs";
import path from "path";

const projectsPath = path.join(
  process.cwd(),
  "server",
  "data",
  "projects.json"
);

const clientDataPath = path.join(
  process.cwd(),
  "server",
  "data",
  "clientData.json"
);

// =========================
// LEER PROJECTS
// =========================

function loadProjects() {

  try {

    if (!fs.existsSync(projectsPath)) {

      fs.writeFileSync(
        projectsPath,
        JSON.stringify({}, null, 2)
      );
    }

    const data = fs.readFileSync(
      projectsPath,
      "utf-8"
    );

    return JSON.parse(data);

  } catch {

    return {};
  }
}

// =========================
// LEER CLIENT DATA
// =========================

function loadClientData() {

  try {

    if (
      !fs.existsSync(clientDataPath)
    ) {

      fs.writeFileSync(
        clientDataPath,
        JSON.stringify({}, null, 2)
      );
    }

    const data = fs.readFileSync(
      clientDataPath,
      "utf-8"
    );

    return JSON.parse(data);

  } catch {

    return {};
  }
}

// =========================

export const projects =
  loadProjects();

export const clientData =
  loadClientData();

// =========================
// SAVE FUNCTIONS
// =========================

export function saveProjects() {

  fs.writeFileSync(
    projectsPath,
    JSON.stringify(
      projects,
      null,
      2
    )
  );
}

export function saveClientData() {

  fs.writeFileSync(
    clientDataPath,
    JSON.stringify(
      clientData,
      null,
      2
    )
  );
}