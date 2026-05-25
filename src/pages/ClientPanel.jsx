import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Preview } from "../components/Preview.jsx";
import { defaultProject } from "../utils/defaultProject.js";

export default function ClientPanel() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [activeSection, setActiveSection] = useState("business");
  const [project, setProject] = useState(defaultProject);

  const [businessData, setBusinessData] = useState({
    phone: "",
    hours: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    photos: []
  });

  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const hasLoadedProject = useRef(false);
  const skipAutoSave = useRef(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  const visiblePages = useMemo(
    () =>
      (
        project?.pages || []
      ).filter((page) => page.show),
    [project?.pages]
  );

  async function loadProject(
    showLoader = false
  ) {
    if (!user?.id) return;

    try {
      if (showLoader)
        setRefreshing(true);

      const res = await api.get(
        `/projects/${user.id}`
      );

      const loadedProject =
        res.data || defaultProject;

      skipAutoSave.current = true;

      setProject({
        ...loadedProject,
        updatedAt:
          loadedProject.updatedAt ||
          Date.now()
      });

      setBusinessData({
        phone:
          loadedProject.business
            ?.phone || "",

        hours:
          loadedProject.business
            ?.hours || "",

        facebook:
          loadedProject.business
            ?.facebook || "",

        instagram:
          loadedProject.business
            ?.instagram || "",

        tiktok:
          loadedProject.business
            ?.tiktok || "",

        photos: []
      });

      setPhotos(
        (
          loadedProject.gallery ||
          []
        ).map((photo) => ({
          id: crypto.randomUUID(),
          name:
            photo.title ||
            "Imagen",
          url: photo.src
        }))
      );

      hasLoadedProject.current = true;

      setTimeout(() => {
        skipAutoSave.current = false;
      }, 500);
    } catch (error) {
      console.log(
        "Error cargando proyecto:",
        error
      );
    } finally {
      if (showLoader)
        setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProject();
  }, []);

  useEffect(() => {
    if (
      !hasLoadedProject.current
    )
      return;

    if (skipAutoSave.current)
      return;

    const timeout = setTimeout(
      () => {
        if (!user?.id) return;

        autoSave();
      },
      2000
    );

    return () =>
      clearTimeout(timeout);
  }, [businessData, photos]);

  async function autoSave() {
    if (
      !hasLoadedProject.current
    )
      return;

    if (!user?.id) return;

    try {
      setSaving(true);

      const updatedProject = {
        ...project,

        updatedAt: Date.now(),

        business: {
          ...project.business,

          phone:
            businessData.phone,

          hours:
            businessData.hours,

          facebook:
            businessData.facebook,

          instagram:
            businessData.instagram,

          tiktok:
            businessData.tiktok
        },

        gallery: photos.map(
          (photo) => ({
            src: photo.url,
            title: photo.name,
            description: ""
          })
        )
      };

      setProject(updatedProject);

      await api.post(
        `/projects/${user.id}`,
        updatedProject
      );

      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      console.log(
        "AutoSave Error:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    setBusinessData({
      ...businessData,
      [e.target.name]:
        e.target.value
    });
  }

  async function handlePhotoUpload(
    e
  ) {
    const files = Array.from(
      e.target.files || []
    );

    const newPhotos =
      await Promise.all(
        files.map((file) => {
          return new Promise(
            (resolve) => {
              const reader =
                new FileReader();

              reader.onload =
                () => {
                  resolve({
                    id: crypto.randomUUID(),
                    name: file.name,
                    url: reader.result
                  });
                };

              reader.readAsDataURL(
                file
              );
            }
          );
        })
      );

    setPhotos((prev) => [
      ...prev,
      ...newPhotos
    ]);

    e.target.value = "";
  }

  function deletePhoto(id) {
    setPhotos((prev) =>
      prev.filter(
        (photo) =>
          photo.id !== id
      )
    );
  }

  async function handleSave() {
    await autoSave();
  }

  function logout() {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login");
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#0f172a",
      color: "#e5e7eb",
      display: "flex",
      flexDirection: isMobile
        ? "column"
        : "row",
      fontFamily:
        "Arial, sans-serif",
      overflowX: "hidden"
    },

    sidebar: {
      width: isMobile
        ? "100%"
        : "260px",

      background: "#020617",

      padding: isMobile
        ? "20px"
        : "28px 22px",

      borderRight: isMobile
        ? "none"
        : "1px solid #1e293b",

      borderBottom: isMobile
        ? "1px solid #1e293b"
        : "none",

      boxSizing: "border-box"
    },

    brand: {
      fontSize: "24px",
      fontWeight: "800",
      color: "#facc15",
      marginBottom: "8px"
    },

    sidebarText: {
      color: "#94a3b8",
      fontSize: "14px",
      marginBottom: isMobile
        ? "18px"
        : "30px"
    },

    menuItem: {
      width: "100%",
      textAlign: "left",
      padding: "12px 14px",
      borderRadius: "12px",
      background: "#1e293b",
      color: "#e5e7eb",
      marginBottom: "10px",
      fontWeight: "700",
      border:
        "1px solid #263449",
      cursor: "pointer",
      boxSizing: "border-box"
    },

    activeMenuItem: {
      background: "#facc15",
      color: "#111827",
      border:
        "1px solid #facc15"
    },

    logoutButton: {
      width: "100%",
      marginTop: isMobile
        ? "10px"
        : "25px",
      padding: "12px",
      borderRadius: "12px",
      border: "none",
      background: "#dc2626",
      color: "white",
      fontWeight: "700",
      cursor: "pointer"
    },

    main: {
      flex: 1,
      width: "100%",
      padding: isMobile
        ? "18px"
        : "35px",
      overflowX: "hidden",
      boxSizing: "border-box"
    },

    header: {
      display: "flex",
      flexDirection: isMobile
        ? "column"
        : "row",
      justifyContent:
        "space-between",
      alignItems: isMobile
        ? "stretch"
        : "center",
      gap: isMobile
        ? "16px"
        : "0",
      marginBottom: "28px"
    },

    title: {
      fontSize: isMobile
        ? "28px"
        : "32px",
      margin: 0
    },

    subtitle: {
      color: "#94a3b8",
      marginTop: "8px",
      wordBreak: "break-word"
    },

    headerActions: {
      display: "grid",
      gridTemplateColumns:
        isMobile
          ? "1fr"
          : "auto auto",
      gap: "12px",
      width: isMobile
        ? "100%"
        : "auto"
    },

    grid: {
      display: "grid",
      gridTemplateColumns:
        isMobile
          ? "1fr"
          : "1fr 1.3fr",
      gap: "25px",
      width: "100%"
    },

    section: {
      background: "#111827",
      border:
        "1px solid #1f2937",
      borderRadius: "20px",
      padding: isMobile
        ? "18px"
        : "24px",
      boxShadow:
        "0 10px 30px rgba(0,0,0,0.25)",
      overflow: "hidden",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      marginBottom: isMobile
        ? "28px"
        : "0"
    },

    input: {
      width: "100%",
      maxWidth: "100%",
      padding: "14px",
      borderRadius: "12px",
      border:
        "1px solid #334155",
      background: "#020617",
      color: "#fff",
      marginTop: "10px",
      outline: "none",
      boxSizing: "border-box"
    },

    saveButton: {
      width: isMobile
        ? "100%"
        : "auto",
      marginTop: isMobile
        ? "0"
        : "25px",
      padding: "14px 22px",
      cursor: "pointer",
      border: "none",
      borderRadius: "12px",
      background: "#facc15",
      color: "#111827",
      fontWeight: "800",
      boxSizing: "border-box"
    },

    previewScrollBox: {
      marginTop: "20px",
      height: isMobile
        ? "650px"
        : "720px",
      overflowY: "auto",
      overflowX: "hidden",
      borderRadius: "16px",
      border:
        "1px solid #334155",
      background: "#020617",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box"
    }
  };

  function menuStyle(section) {
    return {
      ...styles.menuItem,
      ...(activeSection ===
      section
        ? styles.activeMenuItem
        : {})
    };
  }

  function renderBusiness() {
    return (
      <section style={styles.section}>
        <h2>
          Información del negocio
        </h2>

        <label>
          Teléfono
        </label>

        <input
          name="phone"
          value={
            businessData.phone
          }
          onChange={handleChange}
          style={styles.input}
        />

        <br />
        <br />

        <label>
          Horarios
        </label>

        <input
          name="hours"
          value={
            businessData.hours
          }
          onChange={handleChange}
          style={styles.input}
        />
      </section>
    );
  }

  function renderRealPreview() {
    return (
      <section style={styles.section}>
        <h2>
          Vista real del sitio
        </h2>

        <div
          style={
            styles.previewScrollBox
          }
        >
          <Preview
            key={
              project?.updatedAt ||
              JSON.stringify(
                project?.design ||
                  {}
              )
            }
            project={project}
            visiblePages={
              visiblePages
            }
          />
        </div>
      </section>
    );
  }

  return (
    <div style={styles.page}>
      <aside
        style={styles.sidebar}
      >
        <div style={styles.brand}>
          SitiosWebDLB
        </div>

        <p
          style={
            styles.sidebarText
          }
        >
          Panel del cliente
        </p>

        <button
          style={menuStyle(
            "business"
          )}
          onClick={() =>
            setActiveSection(
              "business"
            )
          }
        >
          👤 Mi negocio
        </button>

        <button
          onClick={logout}
          style={
            styles.logoutButton
          }
        >
          Cerrar sesión
        </button>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1
              style={styles.title}
            >
              Bienvenido
            </h1>

            <p
              style={
                styles.subtitle
              }
            >
              {
                user?.businessName
              }
            </p>
          </div>

          <div
            style={
              styles.headerActions
            }
          >
            <button
              onClick={() =>
                loadProject(true)
              }
              style={{
                ...styles.saveButton,
                background:
                  "#334155",
                color: "white"
              }}
              disabled={
                refreshing
              }
            >
              {refreshing
                ? "Actualizando..."
                : "🔄 Recargar Vista"}
            </button>

            <button
              onClick={
                handleSave
              }
              style={
                styles.saveButton
              }
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : saveSuccess
                ? "Guardado automático"
                : "Guardar cambios"}
            </button>
          </div>
        </div>

        <div style={styles.grid}>
          {renderBusiness()}
          {renderRealPreview()}
        </div>
      </main>
    </div>
  );
}