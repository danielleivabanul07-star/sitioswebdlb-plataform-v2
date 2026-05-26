import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const SITE_URL = "https://sitioswebdlb-plataform-v2.vercel.app";

export default function AdminPanel() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [clients, setClients] = useState([]);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [newClient, setNewClient] = useState({
    businessName: "",
    email: "",
    phone: "",
    password: "",
    status: "activo",
    plan: "Basic",
    siteUrl: "",
    slug: ""
  });

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const stats = useMemo(() => {
    const basicCount = clients.filter((c) => c.plan === "Basic").length;

    const mediumCount = clients.filter(
      (c) => c.plan === "Medium" || c.plan === "Pro"
    ).length;

    const premiumCount = clients.filter((c) => c.plan === "Premium").length;

    const estimatedRevenue =
      basicCount * 500 + mediumCount * 900 + premiumCount * 1200;

    return {
      total: clients.length,
      active: clients.filter((c) => c.status === "activo").length,
      pending: clients.filter((c) => c.status === "pendiente").length,
      suspended: clients.filter((c) => c.status === "suspendido").length,
      basic: basicCount,
      medium: mediumCount,
      premium: premiumCount,
      revenue: estimatedRevenue
    };
  }, [clients]);

  async function loadClients(showLoader = false) {
    try {
      if (showLoader) {
        setLoadingRefresh(true);
        setRefreshSuccess(false);
      }

      const res = await api.get("/admin/clients");
      setClients(res.data);

      if (showLoader) {
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 2000);
      }
    } catch (error) {
      console.log("Error cargando clientes:", error);
      alert("Error cargando clientes");
    } finally {
      if (showLoader) setLoadingRefresh(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  function handleChange(e) {
    setNewClient({
      ...newClient,
      [e.target.name]: e.target.value
    });
  }

  async function addClient(e) {
    e.preventDefault();

    try {
      await api.post("/admin/clients", newClient);

      setNewClient({
        businessName: "",
        email: "",
        phone: "",
        password: "",
        status: "activo",
        plan: "Basic",
        siteUrl: "",
        slug: ""
      });

      loadClients();
      setActiveSection("clients");
    } catch (error) {
      console.log("Error creando cliente:", error);
      alert("Error creando cliente");
    }
  }

  async function updateClient(id, updatedData) {
    try {
      await api.patch(`/admin/clients/${id}`, updatedData);
      loadClients();
    } catch (error) {
      console.log("Error actualizando cliente:", error);
      alert("Error actualizando cliente");
    }
  }

  async function deleteClient(id) {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este cliente?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/clients/${id}`);
      loadClients();
    } catch (error) {
      console.log("Error eliminando cliente:", error);
      alert("Error eliminando cliente");
    }
  }

  function editClientSite(clientId) {
    navigate(`/builder/${clientId}`);
  }

  function getPublicSiteUrl(client) {
    if (client.slug) {
      return `/site/${client.slug}`;
    }

    return `/site/${client.id}`;
  }

  function getFullPublicSiteUrl(client) {
    return `${SITE_URL}${getPublicSiteUrl(client)}`;
  }

  function getClientLoginUrl() {
    return `${SITE_URL}/login`;
  }

  async function copySiteUrl(client) {
    const fullUrl = getFullPublicSiteUrl(client);

    try {
      await navigator.clipboard.writeText(fullUrl);
      alert("Link público copiado 🔥");
    } catch {
      alert("Error copiando link");
    }
  }

  async function copyClientAccess(client) {
    const accessText = `🔐 Panel cliente:
${getClientLoginUrl()}

📧 Email:
${client.email}

🔑 Contraseña:
${client.password}

🌐 Sitio web:
${getFullPublicSiteUrl(client)}`;

    try {
      await navigator.clipboard.writeText(accessText);
      alert("Acceso cliente copiado 🔥");
    } catch {
      alert("Error copiando acceso");
    }
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

    sidebarItem: {
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

    sidebarItemActive: {
      background: "#facc15",
      color: "#111827",
      border: "1px solid #facc15"
    },

    sidebarButton: {
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
      marginTop: "8px"
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "18px",
      marginBottom: "30px"
    },

    statCard: {
      background: "rgba(15,23,42,0.82)",
      border: "1px solid #1f2937",
      borderRadius: "18px",
      padding: "22px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      backdropFilter: "blur(10px)"
    },

    statNumber: {
      fontSize: "34px",
      fontWeight: "800",
      color: "#facc15",
      marginTop: "8px"
    },

    section: {
      background: "rgba(15,23,42,0.82)",
      border: "1px solid #1f2937",
      borderRadius: "20px",
      padding: isMobile ? "18px" : "24px",
      marginBottom: "28px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      overflow: "hidden",
      backdropFilter: "blur(10px)"
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "14px"
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

    select: {
      width: "100%",
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid #334155",
      background: "#020617",
      color: "#e5e7eb",
      boxSizing: "border-box"
    },

    primaryButton: {
      width: isMobile ? "100%" : "auto",
      padding: "12px 18px",
      borderRadius: "12px",
      border: "none",
      background: "#facc15",
      color: "#111827",
      fontWeight: "800",
      cursor: "pointer"
    },

    clientGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "18px"
    },

    clientCard: {
      background: "rgba(2,6,23,0.92)",
      border: "1px solid #1e293b",
      borderRadius: "18px",
      padding: isMobile ? "16px" : "20px",
      overflow: "hidden",
      backdropFilter: "blur(10px)"
    },

    badge: {
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "800",
      marginBottom: "12px"
    },

    actions: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(130px, 1fr))",
      gap: "10px",
      marginTop: "16px"
    },

    darkButton: {
      width: "100%",
      padding: "11px 12px",
      borderRadius: "10px",
      border: "1px solid #334155",
      background: "#1e293b",
      color: "#e5e7eb",
      fontWeight: "700",
      cursor: "pointer"
    },

    deleteButton: {
      width: "100%",
      padding: "11px 12px",
      borderRadius: "10px",
      border: "none",
      background: "#dc2626",
      color: "white",
      fontWeight: "700",
      cursor: "pointer"
    },

    linkInput: {
      width: "100%",
      maxWidth: "100%",
      padding: "12px",
      borderRadius: "12px",
      border: "1px solid #334155",
      background: "#020617",
      color: "#e5e7eb",
      outline: "none",
      boxSizing: "border-box",
      fontSize: isMobile ? "13px" : "14px"
    }
  };

  function getStatusBadge(status) {
    if (status === "activo") {
      return {
        background: "rgba(34,197,94,0.15)",
        color: "#22c55e",
        border: "1px solid rgba(34,197,94,0.35)"
      };
    }

    if (status === "suspendido") {
      return {
        background: "rgba(239,68,68,0.15)",
        color: "#ef4444",
        border: "1px solid rgba(239,68,68,0.35)"
      };
    }

    return {
      background: "rgba(250,204,21,0.15)",
      color: "#facc15",
      border: "1px solid rgba(250,204,21,0.35)"
    };
  }

  function sidebarStyle(section) {
    return {
      ...styles.sidebarItem,
      ...(activeSection === section ? styles.sidebarItemActive : {})
    };
  }

  function PlanSelect({ client }) {
    return (
      <select
        style={styles.select}
        value={client.plan || "Basic"}
        onChange={(e) =>
          updateClient(client.id, {
            plan: e.target.value
          })
        }
      >
        <option value="Basic">Basic - $500</option>
        <option value="Medium">Medium - $900</option>
        <option value="Premium">Premium - $1200</option>
      </select>
    );
  }

  function StatusSelect({ client }) {
    return (
      <select
        style={styles.select}
        value={client.status || "activo"}
        onChange={(e) =>
          updateClient(client.id, {
            status: e.target.value
          })
        }
      >
        <option value="activo">Activo</option>
        <option value="pendiente">Pendiente</option>
        <option value="suspendido">Suspendido</option>
      </select>
    );
  }

  function StatusBadge({ status }) {
    return (
      <span
        style={{
          ...styles.badge,
          ...getStatusBadge(status || "activo")
        }}
      >
        {status || "activo"}
      </span>
    );
  }

  function renderDashboard() {
    return (
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div>Total clientes</div>
          <div style={styles.statNumber}>{stats.total}</div>
        </div>

        <div style={styles.statCard}>
          <div>Activos</div>
          <div style={styles.statNumber}>{stats.active}</div>
        </div>

        <div style={styles.statCard}>
          <div>Pendientes</div>
          <div style={styles.statNumber}>{stats.pending}</div>
        </div>

        <div style={styles.statCard}>
          <div>Suspendidos</div>
          <div style={styles.statNumber}>{stats.suspended}</div>
        </div>

        <div style={styles.statCard}>
          <div>Ingresos estimados</div>
          <div style={styles.statNumber}>${stats.revenue}</div>
        </div>
      </div>
    );
  }

  function renderClients() {
    return (
      <>
        <section style={styles.section}>
          <h2>Crear nuevo cliente</h2>

          <form onSubmit={addClient}>
            <div style={styles.formGrid}>
              <input
                style={styles.input}
                name="businessName"
                value={newClient.businessName}
                onChange={handleChange}
                placeholder="Nombre del negocio"
              />

              <input
                style={styles.input}
                name="slug"
                value={newClient.slug}
                onChange={handleChange}
                placeholder="Slug del sitio"
              />

              <input
                style={styles.input}
                name="email"
                value={newClient.email}
                onChange={handleChange}
                placeholder="Email"
              />

              <input
                style={styles.input}
                name="phone"
                value={newClient.phone}
                onChange={handleChange}
                placeholder="Teléfono"
              />

              <input
                style={styles.input}
                name="password"
                value={newClient.password}
                onChange={handleChange}
                placeholder="Contraseña"
              />
            </div>

            <br />

            <button type="submit" style={styles.primaryButton}>
              Crear cliente
            </button>
          </form>
        </section>

        <section style={styles.section}>
          <h2>Clientes registrados</h2>

          <div style={styles.clientGrid}>
            {clients.map((client) => (
              <div key={client.id} style={styles.clientCard}>
                <StatusBadge status={client.status} />

                <h3>{client.businessName}</h3>

                <p>
                  <strong>Status:</strong>
                </p>

                <StatusSelect client={client} />

                <p>
                  <strong>Slug:</strong> {client.slug}
                </p>

                <p>
                  <strong>🌐 Sitio público:</strong>
                </p>

                <input
                  style={styles.linkInput}
                  readOnly
                  value={getFullPublicSiteUrl(client)}
                />

                <p style={{ marginTop: "12px" }}>
                  <strong>🔐 Panel cliente:</strong>
                </p>

                <input
                  style={styles.linkInput}
                  readOnly
                  value={getClientLoginUrl()}
                />

                <p style={{ marginTop: "12px" }}>
                  <strong>📧 Email:</strong>
                </p>

                <input
                  style={styles.input}
                  readOnly
                  value={client.email || ""}
                />

                <p style={{ marginTop: "12px" }}>
                  <strong>🔑 Contraseña:</strong>
                </p>

                <input
                  style={styles.input}
                  readOnly
                  value={client.password || ""}
                />

                <p>
                  <strong>Plan:</strong>
                </p>

                <PlanSelect client={client} />

                <div style={styles.actions}>
                  <a
                    href={getFullPublicSiteUrl(client)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <button style={styles.darkButton}>
                      🌐 Abrir sitio
                    </button>
                  </a>

                  <button
                    onClick={() => copySiteUrl(client)}
                    style={styles.darkButton}
                  >
                    📋 Copiar web
                  </button>

                  <button
                    onClick={() => copyClientAccess(client)}
                    style={styles.darkButton}
                  >
                    🔐 Copiar acceso
                  </button>

                  <button
                    onClick={() => editClientSite(client.id)}
                    style={styles.darkButton}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => deleteClient(client.id)}
                    style={styles.deleteButton}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>SitiosWebDLB</div>

        <p style={styles.sidebarText}>Panel administrativo</p>

        <button
          style={sidebarStyle("dashboard")}
          onClick={() => setActiveSection("dashboard")}
        >
          📊 Dashboard
        </button>

        <button
          style={sidebarStyle("clients")}
          onClick={() => setActiveSection("clients")}
        >
          👥 Clientes
        </button>

        <button onClick={logout} style={styles.sidebarButton}>
          Cerrar sesión
        </button>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Panel Admin</h1>

            <p style={styles.subtitle}>
              Administra clientes y sitios web.
            </p>
          </div>

          <button
            onClick={() => loadClients(true)}
            style={styles.primaryButton}
          >
            {loadingRefresh
              ? "Actualizando..."
              : refreshSuccess
              ? "Datos actualizados"
              : "Actualizar"}
          </button>
        </div>

        {activeSection === "dashboard" && renderDashboard()}
        {activeSection === "clients" && renderClients()}
      </main>
    </div>
  );
}