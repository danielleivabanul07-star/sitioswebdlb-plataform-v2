import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const SITE_URL = "https://sitioswebdlb-plataform-v2.vercel.app";

export default function AdminPanel() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [tempPasswords, setTempPasswords] = useState({});
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [editingClient, setEditingClient] = useState(null);

  const [editForm, setEditForm] = useState({
    businessName: "",
    email: "",
    phone: "",
    password: ""
  });

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

  const filteredClients = useMemo(() => {
    const term = clientSearch.trim().toLowerCase();

    if (!term) return clients;

    return clients.filter((client) => {
      return (
        String(client.businessName || "").toLowerCase().includes(term) ||
        String(client.email || "").toLowerCase().includes(term) ||
        String(client.phone || "").toLowerCase().includes(term) ||
        String(client.slug || "").toLowerCase().includes(term) ||
        String(client.plan || "").toLowerCase().includes(term) ||
        String(client.status || "").toLowerCase().includes(term)
      );
    });
  }, [clients, clientSearch]);

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

  async function changeClientPassword(client) {
    const newPassword = window.prompt(
      `Nueva contraseña para ${client.businessName || client.email}:`
    );

    if (!newPassword || !newPassword.trim()) return;

    try {
      await api.patch(`/admin/clients/${client.id}`, {
        password: newPassword.trim()
      });

      setTempPasswords((prev) => ({
        ...prev,
        [client.id]: newPassword.trim()
      }));

      alert("Contraseña actualizada correctamente");
      loadClients();
    } catch (error) {
      console.log("Error cambiando contraseña:", error);
      alert("Error cambiando contraseña");
    }
  }

  function openEditClient(client) {
    setEditingClient(client.id);

    setEditForm({
      businessName: client.businessName || "",
      email: client.email || "",
      phone: client.phone || "",
      password: ""
    });
  }

  function cancelEditClient() {
    setEditingClient(null);

    setEditForm({
      businessName: "",
      email: "",
      phone: "",
      password: ""
    });
  }

  async function saveClientChanges(clientId) {
    try {
      const payload = {
        businessName: editForm.businessName,
        email: editForm.email,
        phone: editForm.phone
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      await api.patch(`/admin/clients/${clientId}`, payload);

      if (editForm.password.trim()) {
        setTempPasswords((prev) => ({
          ...prev,
          [clientId]: editForm.password.trim()
        }));
      }

      alert("Cliente actualizado correctamente");

      cancelEditClient();
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
    const visiblePassword =
      tempPasswords[client.id] || "Contraseña no visible. Usa Cambiar contraseña.";

    const accessText = `🔐 Panel cliente:
${getClientLoginUrl()}

📧 Email:
${client.email}

🔑 Contraseña:
${visiblePassword}

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
    },
    searchBox: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr auto auto",
      gap: "10px",
      alignItems: "center",
      marginBottom: "18px"
    },
    editBox: {
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "14px",
      background: "rgba(15,23,42,0.9)",
      marginBottom: "14px"
    },
    smallText: {
      color: "#94a3b8",
      fontSize: "13px",
      marginTop: "8px"
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

  function renderClientSearchSection() {
    return (
      <section style={styles.section}>
        <h2>🔎 Búsqueda de cliente</h2>

        <div style={styles.searchBox}>
          <input
            style={styles.input}
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="Buscar cliente por negocio, email, teléfono, slug, plan o estado"
          />

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => setClientSearch(clientSearch.trim())}
          >
            🔎 Buscar
          </button>

          <button
            type="button"
            style={styles.darkButton}
            onClick={() => setClientSearch("")}
          >
            Limpiar
          </button>
        </div>

        <p style={styles.smallText}>
          Resultados encontrados: {filteredClients.length}
        </p>
      </section>
    );
  }

  function renderEditClientBox(client) {
    if (editingClient !== client.id) return null;

    return (
      <div style={styles.editBox}>
        <h4>👤 Editar usuario y contraseña</h4>

        <div style={styles.formGrid}>
          <input
            style={styles.input}
            value={editForm.businessName}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                businessName: e.target.value
              })
            }
            placeholder="Nombre del negocio"
          />

          <input
            style={styles.input}
            value={editForm.email}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                email: e.target.value
              })
            }
            placeholder="Email del cliente"
          />

          <input
            style={styles.input}
            value={editForm.phone}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                phone: e.target.value
              })
            }
            placeholder="Teléfono del cliente"
          />

          <input
            style={styles.input}
            type="password"
            value={editForm.password}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                password: e.target.value
              })
            }
            placeholder="Nueva contraseña"
          />
        </div>

        <p style={styles.smallText}>
          Si dejas la contraseña vacía, se mantiene la contraseña actual.
        </p>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={() => saveClientChanges(client.id)}
            style={styles.primaryButton}
          >
            💾 Guardar cambios
          </button>

          <button
            type="button"
            onClick={cancelEditClient}
            style={styles.darkButton}
          >
            Cancelar
          </button>
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

        {renderClientSearchSection()}

        <section style={styles.section}>
          <h2>Clientes registrados</h2>

          <div style={styles.clientGrid}>
            {filteredClients.map((client) => (
              <div key={client.id} style={styles.clientCard}>
                <StatusBadge status={client.status} />

                <h3>{client.businessName}</h3>

                {renderEditClientBox(client)}

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
                  <strong>📱 Teléfono:</strong>
                </p>

                <input
                  style={styles.input}
                  readOnly
                  value={client.phone || ""}
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
                    onClick={() => openEditClient(client)}
                    style={styles.darkButton}
                  >
                    👤 Editar usuario
                  </button>

                  <button
                    onClick={() => changeClientPassword(client)}
                    style={styles.darkButton}
                  >
                    🔑 Cambiar contraseña
                  </button>

                  <button
                    onClick={() => editClientSite(client.id)}
                    style={styles.darkButton}
                  >
                    ✏️ Editar sitio
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

          {filteredClients.length === 0 && (
            <p style={styles.smallText}>
              No hay clientes que coincidan con esa búsqueda.
            </p>
          )}
        </section>
      </>
    );
  }

  function renderClientSearchOnly() {
    return (
      <>
        {renderClientSearchSection()}

        <section style={styles.section}>
          <h2>Resultados de búsqueda</h2>

          <div style={styles.clientGrid}>
            {filteredClients.map((client) => (
              <div key={client.id} style={styles.clientCard}>
                <StatusBadge status={client.status} />

                <h3>{client.businessName}</h3>

                <p>
                  <strong>Email:</strong> {client.email}
                </p>

                <p>
                  <strong>Teléfono:</strong> {client.phone}
                </p>

                <p>
                  <strong>Slug:</strong> {client.slug}
                </p>

                <p>
                  <strong>Plan:</strong> {client.plan}
                </p>

                <input
                  style={styles.linkInput}
                  readOnly
                  value={getFullPublicSiteUrl(client)}
                />

                <div style={styles.actions}>
                  <button
                    onClick={() => copyClientAccess(client)}
                    style={styles.darkButton}
                  >
                    🔐 Copiar acceso
                  </button>

                  <button
                    onClick={() => openEditClient(client)}
                    style={styles.darkButton}
                  >
                    👤 Editar usuario
                  </button>

                  <button
                    onClick={() => {
                      setActiveSection("users");
                      openEditClient(client);
                    }}
                    style={styles.primaryButton}
                  >
                    🔑 Ir a usuarios
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <p style={styles.smallText}>
              No hay clientes que coincidan con esa búsqueda.
            </p>
          )}
        </section>
      </>
    );
  }

  function renderUsersAndPasswords() {
    return (
      <>
        {renderClientSearchSection()}

        <section style={styles.section}>
          <h2>👤 Usuarios y contraseñas de clientes</h2>

          <p style={styles.smallText}>
            Aquí puedes editar el nombre del negocio, email, teléfono y contraseña
            del cliente. Si no escribes una nueva contraseña, se mantiene la actual.
          </p>

          <div style={styles.clientGrid}>
            {filteredClients.map((client) => (
              <div key={client.id} style={styles.clientCard}>
                <StatusBadge status={client.status} />

                <h3>{client.businessName}</h3>

                <p>
                  <strong>Email actual:</strong>
                </p>

                <input
                  style={styles.input}
                  readOnly
                  value={client.email || ""}
                />

                <p>
                  <strong>Teléfono actual:</strong>
                </p>

                <input
                  style={styles.input}
                  readOnly
                  value={client.phone || ""}
                />

                <p>
                  <strong>Panel cliente:</strong>
                </p>

                <input
                  style={styles.linkInput}
                  readOnly
                  value={getClientLoginUrl()}
                />

                {renderEditClientBox(client)}

                <div style={styles.actions}>
                  <button
                    type="button"
                    onClick={() => openEditClient(client)}
                    style={styles.primaryButton}
                  >
                    👤 Editar usuario
                  </button>

                  <button
                    type="button"
                    onClick={() => changeClientPassword(client)}
                    style={styles.darkButton}
                  >
                    🔑 Cambiar contraseña rápido
                  </button>

                  <button
                    type="button"
                    onClick={() => copyClientAccess(client)}
                    style={styles.darkButton}
                  >
                    🔐 Copiar acceso
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <p style={styles.smallText}>
              No hay clientes que coincidan con esa búsqueda.
            </p>
          )}
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

        <button
          style={sidebarStyle("search")}
          onClick={() => setActiveSection("search")}
        >
          🔎 Buscar cliente
        </button>

        <button
          style={sidebarStyle("users")}
          onClick={() => setActiveSection("users")}
        >
          👤 Usuarios y contraseñas
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
              Administra clientes, sitios web, usuarios y contraseñas.
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
        {activeSection === "search" && renderClientSearchOnly()}
        {activeSection === "users" && renderUsersAndPasswords()}
      </main>
    </div>
  );
}