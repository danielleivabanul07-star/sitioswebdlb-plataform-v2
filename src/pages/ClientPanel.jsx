import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Preview } from "../components/Preview.jsx";
import { defaultProject } from "../utils/defaultProject.js";
import { supabase } from "../configuracion/supabase";
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

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visiblePages = useMemo(
    () => (project?.pages || []).filter((page) => page.show),
    [project?.pages]
  );

  async function loadProject(showLoader = false) {
    if (!user?.id) return;

    try {
      if (showLoader) setRefreshing(true);

      const res = await api.get("/projects/me/project");
      const loadedProject = res.data || defaultProject;

      setProject({
        ...loadedProject,
        updatedAt: loadedProject.updatedAt || Date.now()
      });

      setBusinessData({
        phone: loadedProject.business?.phone || "",
        hours: loadedProject.business?.hours || "",
        facebook: loadedProject.business?.facebook || "",
        instagram: loadedProject.business?.instagram || "",
        tiktok: loadedProject.business?.tiktok || "",
        photos: []
      });

      setPhotos(
        (loadedProject.gallery || []).map((photo) => ({
          id: photo.id || crypto.randomUUID(),
          name: photo.title || "Imagen",
          url: photo.src
        }))
      );

      hasLoadedProject.current = true;
    } catch (error) {
      console.log("Error cargando proyecto:", error);
      alert("Error cargando proyecto");
    } finally {
      if (showLoader) setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProject();
  }, []);

  async function saveChanges() {
    if (!hasLoadedProject.current) return;
    if (!user?.id) return;

    try {
      setSaving(true);
      setSaveSuccess(false);

      const updatedProject = {
        ...project,
        updatedAt: Date.now(),

        business: {
          ...project.business,
          phone: businessData.phone,
          hours: businessData.hours,
          facebook: businessData.facebook,
          instagram: businessData.instagram,
          tiktok: businessData.tiktok
        },

        gallery: photos.map((photo) => ({
          id: photo.id || crypto.randomUUID(),
          src: photo.url,
          title: photo.name,
          description: ""
        }))
      };

      setProject(updatedProject);

      await api.patch("/projects/me/project", updatedProject);

      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 1800);
    } catch (error) {
      console.log("Error guardando cambios:", error);
      alert("Error guardando cambios");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    setBusinessData({
      ...businessData,
      [e.target.name]: e.target.value
    });
  }

async function handlePhotoUpload(e) {
  const files = Array.from(e.target.files || []);

  const uploadedPhotos = [];

  for (const file of files) {
    try {
      const safeName = file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "-"
      );

      const fileName =
        `${user.id}/${Date.now()}-${safeName}`;

      const { error } = await supabase.storage
        .from("site-backgrounds")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true
        });

      if (error) {
        console.error(error);
        continue;
      }

      const { data } = supabase.storage
        .from("site-backgrounds")
        .getPublicUrl(fileName);

      uploadedPhotos.push({
        id: crypto.randomUUID(),
        name: file.name,
        url: data.publicUrl
      });
    } catch (err) {
      console.error(err);
    }
  }

  setPhotos((prev) => [
    ...prev,
    ...uploadedPhotos
  ]);

  e.target.value = "";
}

  function deletePhoto(id) {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "transparent",
      color: "#e5e7eb",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      fontFamily: "Arial, sans-serif",
      overflowX: "hidden"
    },

    sidebar: {
      width: isMobile ? "100%" : "260px",
      background: "rgba(2,6,23,0.92)",
      padding: isMobile ? "20px" : "28px 22px",
      borderRight: isMobile ? "none" : "1px solid #1e293b",
      borderBottom: isMobile ? "1px solid #1e293b" : "none",
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
      marginBottom: isMobile ? "18px" : "30px"
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
      border: "1px solid #263449",
      cursor: "pointer",
      boxSizing: "border-box"
    },

    activeMenuItem: {
      background: "#facc15",
      color: "#111827",
      border: "1px solid #facc15"
    },

    logoutButton: {
      width: "100%",
      marginTop: isMobile ? "10px" : "25px",
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
      padding: isMobile ? "18px" : "35px",
      overflowX: "hidden",
      boxSizing: "border-box"
    },

    header: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "center",
      gap: isMobile ? "16px" : "0",
      marginBottom: "28px"
    },

    title: {
      fontSize: isMobile ? "28px" : "32px",
      margin: 0
    },

    subtitle: {
      color: "#94a3b8",
      marginTop: "8px",
      wordBreak: "break-word"
    },

    headerActions: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "auto auto",
      gap: "12px",
      width: isMobile ? "100%" : "auto"
    },

    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1.3fr",
      gap: "25px",
      width: "100%"
    },

    section: {
      background: "rgba(15,23,42,0.82)",
      border: "1px solid #1f2937",
      borderRadius: "20px",
      padding: isMobile ? "18px" : "24px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      overflow: "hidden",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      marginBottom: isMobile ? "28px" : "0",
      backdropFilter: "blur(10px)"
    },

    input: {
      width: "100%",
      maxWidth: "100%",
      padding: "14px",
      borderRadius: "12px",
      border: "1px solid #334155",
      background: "#020617",
      color: "#fff",
      marginTop: "10px",
      outline: "none",
      boxSizing: "border-box"
    },

    saveButton: {
      width: isMobile ? "100%" : "auto",
      marginTop: isMobile ? "0" : "25px",
      padding: "14px 22px",
      cursor: "pointer",
      border: "none",
      borderRadius: "12px",
      background: "#facc15",
      color: "#111827",
      fontWeight: "800",
      boxSizing: "border-box"
    },

    photoGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit,minmax(140px,1fr))",
      gap: "15px",
      marginTop: "15px"
    },

    photoCard: {
      background: "#020617",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "10px",
      overflow: "hidden"
    },

    deleteButton: {
      marginTop: "10px",
      width: "100%",
      background: "#dc2626",
      color: "#fff",
      border: "none",
      padding: "10px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "700"
    },

    previewScrollBox: {
      marginTop: "20px",
      height: isMobile ? "650px" : "720px",
      overflowY: "auto",
      overflowX: "hidden",
      borderRadius: "16px",
      border: "1px solid #334155",
      background: "rgba(2,6,23,0.92)",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      scrollBehavior: "smooth"
    }
  };

  function menuStyle(section) {
    return {
      ...styles.menuItem,
      ...(activeSection === section ? styles.activeMenuItem : {})
    };
  }

  function renderBusiness() {
    return (
      <section style={styles.section}>
        <h2>Información del negocio</h2>

        <label>Teléfono</label>
        <input
          name="phone"
          value={businessData.phone}
          onChange={handleChange}
          style={styles.input}
        />

        <br />
        <br />

        <label>Horarios</label>
        <input
          name="hours"
          value={businessData.hours}
          onChange={handleChange}
          style={styles.input}
        />

        <br />
        <br />

        <label>Facebook</label>
        <input
          name="facebook"
          value={businessData.facebook}
          onChange={handleChange}
          style={styles.input}
        />

        <br />
        <br />

        <label>Instagram</label>
        <input
          name="instagram"
          value={businessData.instagram}
          onChange={handleChange}
          style={styles.input}
        />

        <br />
        <br />

        <label>TikTok</label>
        <input
          name="tiktok"
          value={businessData.tiktok}
          onChange={handleChange}
          style={styles.input}
        />
      </section>
    );
  }

  function renderGallery() {
    return (
      <section style={styles.section}>
        <h2>Galería</h2>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          style={styles.input}
        />

        <div style={styles.photoGrid}>
          {photos.length ? (
            photos.map((photo) => (
              <div key={photo.id} style={styles.photoCard}>
                <img
                  src={photo.url}
                  alt={photo.name}
                  style={{
                    width: "100%",
                    height: isMobile ? "190px" : "140px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: "2px solid #facc15",
                    boxSizing: "border-box",
                    display: "block"
                  }}
                />

                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    wordBreak: "break-word"
                  }}
                >
                  {photo.name}
                </p>

                <button
                  onClick={() => deletePhoto(photo.id)}
                  style={styles.deleteButton}
                >
                  Eliminar
                </button>
              </div>
            ))
          ) : (
            <p>No hay fotos agregadas.</p>
          )}
        </div>
      </section>
    );
  }

  function renderSettings() {
    return (
      <section style={styles.section}>
        <h2>Configuración</h2>

        <p style={{ color: "#94a3b8" }}>
          Panel de configuración del cliente.
        </p>

        <div style={{ marginTop: "25px" }}>
          <p>
            <strong>Negocio:</strong> {user?.businessName}
          </p>

          <p style={{ wordBreak: "break-word" }}>
            <strong>Email:</strong> {user?.email}
          </p>

          <p>
            <strong>Rol:</strong> {user?.role}
          </p>
        </div>
      </section>
    );
  }

  function renderRealPreview() {
    return (
      <section style={styles.section}>
        <h2>Vista real del sitio</h2>

        <div style={styles.previewScrollBox}>
          <Preview
            key={project?.updatedAt || JSON.stringify(project?.design || {})}
            project={project}
            visiblePages={visiblePages}
          />
        </div>
      </section>
    );
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>SitiosWebDLB</div>

        <p style={styles.sidebarText}>Panel del cliente</p>

        <button
          style={menuStyle("business")}
          onClick={() => setActiveSection("business")}
        >
          👤 Mi negocio
        </button>

        <button
          style={menuStyle("gallery")}
          onClick={() => setActiveSection("gallery")}
        >
          🖼️ Galería
        </button>

        <button
          style={menuStyle("settings")}
          onClick={() => setActiveSection("settings")}
        >
          ⚙️ Configuración
        </button>

        <button onClick={logout} style={styles.logoutButton}>
          Cerrar sesión
        </button>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Bienvenido</h1>
            <p style={styles.subtitle}>{user?.businessName}</p>
          </div>

          <div style={styles.headerActions}>
            <button
              onClick={() => loadProject(true)}
              style={{
                ...styles.saveButton,
                background: "#334155",
                color: "white",
                marginRight: isMobile ? "0" : "12px"
              }}
              disabled={refreshing}
            >
              {refreshing ? "Actualizando..." : "🔄 Recargar Vista"}
            </button>

            <button
              onClick={saveChanges}
              style={styles.saveButton}
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : saveSuccess
                ? "Cambios guardados"
                : "Guardar cambios"}
            </button>
          </div>
        </div>

        <div style={styles.grid}>
          {activeSection === "business" && renderBusiness()}
          {activeSection === "business" && renderRealPreview()}

          {activeSection === "gallery" && renderGallery()}
          {activeSection === "gallery" && renderRealPreview()}

          {activeSection === "settings" && renderSettings()}
          {activeSection === "settings" && renderRealPreview()}
        </div>
      </main>
    </div>
  );
}