import { useEffect, useMemo, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams
} from "react-router-dom";

import api from "./services/api";

import { BuilderPanel } from "./components/BuilderPanel.jsx";
import { Preview } from "./components/Preview.jsx";

import { exportProjectZip } from "./utils/exportSite.js";
import { defaultProject } from "./utils/defaultProject.js";

import Login from "./pages/Login.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import ClientPanel from "./pages/ClientPanel.jsx";
import PublicSite from "./pages/PublicSite.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

function BuilderHome() {
  const { clientId } = useParams();

  const [project, setProject] = useState(defaultProject);

  const [saving, setSaving] = useState(false);

  const [saveSuccess, setSaveSuccess] =
    useState(false);

  const [loadingProject, setLoadingProject] =
    useState(false);

  const [lastUpdate, setLastUpdate] =
    useState(0);

  async function loadProject(
    showLoader = false
  ) {
    try {
      if (showLoader) {
        setLoadingProject(true);
      }

      const res = await api.get(
        `/projects/${clientId}`
      );

      const serverProject =
        res.data || defaultProject;

      setProject({
        ...serverProject,
        updatedAt:
          serverProject.updatedAt ||
          Date.now()
      });

      setLastUpdate(
        serverProject.updatedAt || 0
      );
    } catch (error) {
      console.log(
        "Error cargando proyecto:",
        error
      );

      alert("Error cargando proyecto");
    } finally {
      if (showLoader) {
        setLoadingProject(false);
      }
    }
  }

  useEffect(() => {
    if (clientId) {
      loadProject();
    }
  }, [clientId]);

  async function saveProject(
    customProject = null
  ) {
    try {
      setSaving(true);

      setSaveSuccess(false);

      const finalProject = {
        ...(customProject || project),

        updatedAt: Date.now()
      };

      setProject(finalProject);

      await api.post(
        `/projects/${clientId}`,
        finalProject
      );

      setLastUpdate(
        finalProject.updatedAt
      );

      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
    } catch (error) {
      console.log(
        "Error guardando proyecto:",
        error
      );

      alert(
        "Error guardando proyecto"
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // AUTOSAVE ADMIN
  // =========================

  useEffect(() => {
    if (!project) return;

    const timeout = setTimeout(() => {
      saveProject(project);
    }, 1500);

    return () =>
      clearTimeout(timeout);
  }, [project]);

  // =========================
  // AUTO SYNC ONLINE
  // =========================

  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          const res = await api.get(
            `/projects/${clientId}`
          );

          const serverProject =
            res.data;

          if (
            serverProject.updatedAt >
            lastUpdate
          ) {
            setProject(serverProject);

            setLastUpdate(
              serverProject.updatedAt
            );
          }
        } catch (err) {
          console.log(err);
        }
      },
      5000
    );

    return () =>
      clearInterval(interval);
  }, [clientId, lastUpdate]);

  const visiblePages = useMemo(
    () =>
      (
        project.pages || []
      ).filter((page) => page.show),
    [project.pages]
  );

  function updateProject(patch) {
    setProject((prev) => ({
      ...prev,

      ...patch,

      updatedAt: Date.now()
    }));
  }

  function updateBusiness(
    field,
    value
  ) {
    setProject((prev) => ({
      ...prev,

      updatedAt: Date.now(),

      business: {
        ...prev.business,

        [field]: value
      }
    }));
  }

  function updateDesign(
    field,
    value
  ) {
    setProject((prev) => ({
      ...prev,

      updatedAt: Date.now(),

      design: {
        ...prev.design,

        [field]: value
      }
    }));
  }

  async function handleExportZip() {
    await exportProjectZip(project);
  }

  return (
    <div className="app">
      <header className="appHeader">
        <div>
          <h1>
            SitiosWebDLB Builder Pro
          </h1>

          <p>
            Editando cliente #
            {clientId}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() =>
              loadProject(true)
            }
            disabled={
              loadingProject
            }
          >
            {loadingProject
              ? "Actualizando..."
              : "Recargar Proyecto"}
          </button>

          <button
            onClick={() =>
              saveProject()
            }
            disabled={saving}
          >
            {saving
              ? "Guardando..."
              : saveSuccess
              ? "Proyecto guardado"
              : "Guardar Proyecto"}
          </button>

          <Link
            className="brandLink"
            to={`/site/${clientId}`}
          >
            Ver sitio público
          </Link>

          <Link
            className="brandLink"
            to="/admin"
          >
            Volver Admin
          </Link>
        </div>
      </header>

      <main
        className="workspace"
        id="builder"
      >
        <BuilderPanel
          project={project}
          setProject={setProject}
          updateProject={
            updateProject
          }
          updateBusiness={
            updateBusiness
          }
          updateDesign={
            updateDesign
          }
          onExportZip={
            handleExportZip
          }
        />

        <Preview
          key={
            project?.updatedAt
          }
          project={project}
          visiblePages={
            visiblePages
          }
        />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/site/:clientId"
          element={<PublicSite />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin"
              ]}
            >
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
                "client"
              ]}
            >
              <ClientPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/builder/:clientId"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin"
              ]}
            >
              <BuilderHome />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}