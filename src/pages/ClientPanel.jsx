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

  const firstAutoSave = useRef(true);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visiblePages = useMemo(() => {
    return (project?.pages || []).filter((page) => page.show);
  }, [project?.pages]);

  async function loadClientData() {
    if (!user?.email) return;

    try {
      const res = await api.get(`/client/${user.email}`);

      setBusinessData({
        phone: res.data.phone || "",
        hours: res.data.hours || "",
        facebook: res.data.facebook || "",
        instagram: res.data.instagram || "",
        tiktok: res.data.tiktok || "",
        photos: res.data.photos || []
      });

      setPhotos(res.data.photos || []);
    } catch (error) {
      console.log("Error cargando datos del cliente:", error);
    }
  }

  async function loadProject(showLoader = false) {
    if (!user?.id) return;

    try {
      if (showLoader) {
        setRefreshing(true);
      }

      const res = await api.get(`/projects/${user.id}`);
      const loadedProject = res.data || defaultProject;

      setProject(loadedProject);

      setBusinessData((prev) => ({
        ...prev,
        phone: loadedProject.business?.phone || "",
        hours: loadedProject.business?.hours || "",
        facebook: loadedProject.business?.facebook || "",
        instagram: loadedProject.business?.instagram || "",
        tiktok: loadedProject.business?.tiktok || ""
      }));

      if (loadedProject.gallery) {
        setPhotos(
          loadedProject.gallery.map((photo) => ({
            id: crypto.randomUUID(),
            name: photo.title || "Imagen",
            url: photo.src
          }))
        );
      }
    } catch (error) {
      console.log("Error cargando proyecto:", error);
    } finally {
      if (showLoader) {
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    loadClientData();
    loadProject();
  }, []);

  useEffect(() => {
    if (firstAutoSave.current) {
      firstAutoSave.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      if (!user?.id || !user?.email) return;
      autoSave();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [businessData, photos]);

  async function autoSave() {
    try {
      setSaving(true);

      const updatedProject = {
        ...project,

        business: {
          ...project.business,
          phone: businessData.phone,
          hours: businessData.hours,
          facebook: businessData.facebook,
          instagram: businessData.instagram,
          tiktok: businessData.tiktok
        },

        gallery: photos.map((photo) => ({
          src: photo.url,
          title: photo.name,
          description: ""
        }))
      };

      setProject(updatedProject);

      await api.post(`/client/${user.email}`, {
        ...businessData,
        photos
      });

      await api.post(`/projects/${user.id}`, updatedProject);

      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      console.log("AutoSave Error:", error);
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

    const newPhotos = await Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();

          reader.onload = () => {
            resolve({
              id: crypto.randomUUID(),
              name: file.name,
              url: reader.result
            });
          };

          reader.readAsDataURL(file);
        });
      })
    );

    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = "";
  }

  function deletePhoto(id) {
    setPhotos(photos.filter((photo) => photo.id !== id));
  }

  async function handleSave() {
    await autoSave();
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#0f172a",
      color: "#e5e7eb",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      fontFamily: "Arial, sans-serif",
      overflowX: "hidden",
      width: "100%"
    },

    sidebar: {
      width: isMobile ? "100%" : "260px",
      background: "#020617",
      padding: isMobile ? "20px" : "28px 22px",
      borderRight: isMobile ? "none" : "1px solid #1e293b",
      borderBottom: isMobile ? "1px solid #1e293b" : "none",
      flexShrink: 0
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

    menuWrapper: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr",
      gap: "10px"
    },

    menuItem: {
      width: "100%",
      textAlign: "left",
      padding: "12px 14px",
      borderRadius: "12px",
      background: "#1e293b",
      color: "#e5e7eb",
      fontWeight: "700",
      border: "1px solid #263449",
      cursor: "pointer"
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
      overflowX: "hidden"
    },

    header: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "center",
      gap: isMobile ? "16px" : "20px",
      marginBottom: "28px"
    },

    title: {
      fontSize: isMobile ? "28px" : "32px",
      margin: 0,
      lineHeight: 1.15
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

    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "18px",
      marginBottom: "28px"
    },

    statCard: {
      background: "#111827",
      border: "1px solid #1f2937",
      borderRadius: "18px",
      padding: isMobile ? "18px" : "22px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      overflow: "hidden"
    },

    statLabel: {
      color: "#94a3b8",
      fontSize: "14px",
      marginBottom: "8px"
    },

    statNumber: {
      fontSize: isMobile ? "26px" : "32px",
      fontWeight: "800",
      color: "#facc15",
      wordBreak: "break-word"
    },

    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) minmax(0, 1.3fr)",
      gap: "25px",
      alignItems: "start",
      width: "100%"
    },

    section: {
      background: "#111827",
      border: "1px solid #1f2937",
      borderRadius: "20px",
      padding: isMobile ? "18px" : "24px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      overflow: "hidden",
      width: "100%",
      maxWidth: "100%"
    },

    sectionTitle: {
      fontSize: isMobile ? "22px" : "24px",
      margin: "0 0 8px"
    },

    sectionDescription: {
      color: "#94a3b8",
      marginTop: 0,
      marginBottom: "22px",
      lineHeight: 1.5
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "16px"
    },

    field: {
      minWidth: 0
    },

    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "700",
      color: "#e5e7eb"
    },

    input: {
      width: "100%",
      maxWidth: "100%",
      padding: "12px",
      borderRadius: "12px",
      border: "1px solid #334155",
      background: "#020617",
      color: "#e5e7eb",
      outline: "none",
      boxSizing: "border-box",
      overflow: "hidden",
      textOverflow: "ellipsis"
    },

    saveButton: {
      width: isMobile ? "100%" : "auto",
      padding: "12px 18px",
      cursor: "pointer",
      border: "none",
      borderRadius: "12px",
      background: "#facc15",
      color: "#111827",
      fontWeight: "800"
    },

    secondaryButton: {
      width: isMobile ? "100%" : "auto",
      padding: "12px 18px",
      cursor: "pointer",
      borderRadius: "12px",
      background: "#334155",
      color: "white",
      fontWeight: "800",
      border: "1px solid #475569"
    },

    uploadBox: {
      display: "block",
      border: "1px dashed #475569",
      background: "#020617",
      borderRadius: "16px",
      padding: "18px",
      cursor: "pointer",
      color: "#e5e7eb",
      marginBottom: "18px",
      textAlign: "center"
    },

    fileInput: {
      display: "none"
    },

    photoGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "15px",
      marginTop: "15px",
      width: "100%"
    },

    photoCard: {
      background: "#020617",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "10px",
      overflow: "hidden",
      minWidth: 0
    },

    photoImage: {
      width: "100%",
      height: isMobile ? "180px" : "140px",
      objectFit: "cover",
      borderRadius: "12px",
      border: "2px solid #facc15",
      display: "block"
    },

    photoName: {
      marginTop: "8px",
      fontSize: "12px",
      wordBreak: "break-word",
      color: "#cbd5e1"
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

    emptyState: {
      background: "#020617",
      border: "1px solid #334155",
      borderRadius: "16px",
      padding: "22px",
      color: "#94a3b8",
      textAlign: "center"
    },

    previewScrollBox: {
      marginTop: "20px",
      height: isMobile ? "620px" : "720px",
      overflowY: "auto",
      overflowX: "hidden",
      borderRadius: "16px",
      border: "1px solid #334155",
      background: "#020617",
      width: "100%",
      maxWidth: "100%"
    },

    accountGrid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "14px",
      marginTop: "20px"
    },

    accountCard: {
      background: "#020617",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "14px",
      overflow: "hidden"
    },

    accountLabel: {
      display: "block",
      color: "#94a3b8",
      fontSize: "13px",
      marginBottom: "6px"
    },

    accountValue: {
      display: "block",
      color: "#e5e7eb",
      fontWeight: "800",
      wordBreak: "break-word"
    }
  };

  const stats = [
    {
      label: "Páginas visibles",
      value: visiblePages.length
    },
    {
      label: "Fotos cargadas",
      value: photos.length
    },
    {
      label: "Estado",
      value: saving ? "Guardando" : "Activo"
    }
  ];

  function menuStyle(section) {
    return {
      ...styles.menuItem,
      ...(activeSection === section ? styles.activeMenuItem : {})
    };
  }

  function renderStats() {
    return (
      <div style={styles.statsGrid}>
        {stats.map((item) => (
          <div key={item.label} style={styles.statCard}>
            <div style={styles.statLabel}>{item.label}</div>
            <div style={styles.statNumber}>{item.value}</div>
          </div>
        ))}
      </div>
    );
  }

  function renderBusiness() {
    return (
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Información del negocio</h2>

        <p style={styles.sectionDescription}>
          Actualiza los datos principales que aparecerán en el sitio web del negocio.
        </p>

        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Teléfono</label>
            <input
              name="phone"
              value={businessData.phone}
              onChange={handleChange}
              placeholder="Ej: 502-000-0000"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Horarios</label>
            <input
              name="hours"
              value={businessData.hours}
              onChange={handleChange}
              placeholder="Ej: Lunes a Viernes 8:00 AM - 5:00 PM"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Facebook</label>
            <input
              name="facebook"
              value={businessData.facebook}
              onChange={handleChange}
              placeholder="Link de Facebook"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Instagram</label>
            <input
              name="instagram"
              value={businessData.instagram}
              onChange={handleChange}
              placeholder="Link de Instagram"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>TikTok</label>
            <input
              name="tiktok"
              value={businessData.tiktok}
              onChange={handleChange}
              placeholder="Link de TikTok"
              style={styles.input}
            />
          </div>
        </div>
      </section>
    );
  }

  function renderGallery() {
    return (
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Galería</h2>

        <p style={styles.sectionDescription}>
          Sube fotos del negocio para mostrarlas en la galería del sitio.
        </p>

        <label style={styles.uploadBox}>
          📤 Subir fotos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            style={styles.fileInput}
          />
        </label>

        <div style={styles.photoGrid}>
          {photos.length ? (
            photos.map((photo) => (
              <div key={photo.id} style={styles.photoCard}>
                <img
                  src={photo.url}
                  alt={photo.name}
                  style={styles.photoImage}
                />

                <p style={styles.photoName}>{photo.name}</p>

                <button
                  onClick={() => deletePhoto(photo.id)}
                  style={styles.deleteButton}
                >
                  Eliminar
                </button>
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>
              No hay fotos agregadas.
            </div>
          )}
        </div>
      </section>
    );
  }

  function renderSettings() {
    return (
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Configuración</h2>

        <p style={styles.sectionDescription}>
          Información de la cuenta del cliente.
        </p>

        <div style={styles.accountGrid}>
          <div style={styles.accountCard}>
            <span style={styles.accountLabel}>Negocio</span>
            <strong style={styles.accountValue}>
              {user?.businessName || "No disponible"}
            </strong>
          </div>

          <div style={styles.accountCard}>
            <span style={styles.accountLabel}>Email</span>
            <strong style={styles.accountValue}>
              {user?.email || "No disponible"}
            </strong>
          </div>

          <div style={styles.accountCard}>
            <span style={styles.accountLabel}>Rol</span>
            <strong style={styles.accountValue}>
              {user?.role || "Cliente"}
            </strong>
          </div>
        </div>
      </section>
    );
  }

  function renderRealPreview() {
    return (
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Vista real del sitio</h2>

        <p style={styles.sectionDescription}>
          Revisa cómo se verán los cambios en la página.
        </p>

        <div style={styles.previewScrollBox}>
          <Preview project={project} visiblePages={visiblePages} />
        </div>
      </section>
    );
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>SitiosWebDLB</div>

        <p style={styles.sidebarText}>Panel del cliente</p>

        <div style={styles.menuWrapper}>
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
        </div>

        <button onClick={logout} style={styles.logoutButton}>
          Cerrar sesión
        </button>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Panel Cliente</h1>

            <p style={styles.subtitle}>
              {user?.businessName || "Administra la información de tu sitio web."}
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              onClick={() => loadProject(true)}
              style={styles.secondaryButton}
              disabled={refreshing}
            >
              {refreshing ? "Actualizando..." : "🔄 Recargar Vista"}
            </button>

            <button
              onClick={handleSave}
              style={styles.saveButton}
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

        {renderStats()}

        <div style={styles.grid}>
          {activeSection === "business" && renderBusiness()}
          {activeSection === "gallery" && renderGallery()}
          {activeSection === "settings" && renderSettings()}
          {renderRealPreview()}
        </div>
      </main>
    </div>
  );
}
