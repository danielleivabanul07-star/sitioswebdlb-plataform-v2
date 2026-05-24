import { useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";

import api from "../services/api";

import { Preview } from "../components/Preview.jsx";

import { defaultProject } from "../utils/defaultProject.js";

export default function PublicSite() {

  const { clientId } =
    useParams();

  const [project, setProject] =
    useState(defaultProject);

  const [loading, setLoading] =
    useState(true);

  async function loadSite() {

    try {

      const res = await api.get(
        `/projects/${clientId}`
      );

      setProject(res.data);

    } catch (error) {

      console.log(
        "Error cargando sitio:",
        error
      );

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {

    loadSite();

  }, [clientId]);

  const visiblePages =
    useMemo(
      () =>
        project.pages.filter(
          (page) => page.show
        ),
      [project.pages]
    );

  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
          background: "#020617",
          color: "white",
          fontSize: "22px"
        }}
      >
        Cargando sitio...
      </div>
    );
  }

  return (
    <Preview
      project={project}
      visiblePages={visiblePages}
    />
  );
}