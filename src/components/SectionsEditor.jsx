export function SectionsEditor({ project, setProject }) {
  const sections = project.sections || [];
  const pages = project.pages || [];

  function updateSection(id, field, value) {
    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      sections: (prev.sections || []).map((section) =>
        section.id === id
          ? {
              ...section,
              [field]: value
            }
          : section
      )
    }));
  }

  function addSection(type = "text-card") {
    const newSection = {
      id: crypto.randomUUID(),
      page: "home",
      type,
      title: type === "buttons" ? "Botones de contacto" : "Nueva sección",
      text: type === "buttons" ? "" : "Escribe aquí el contenido de esta sección.",
      show: true,
      order: sections.length + 1,

      showWhatsapp: type === "buttons",
      showCall: type === "buttons",
      showSms: false,
      showEmail: type === "buttons",
      showPayments: false
    };

    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      sections: [...(prev.sections || []), newSection]
    }));
  }

  function deleteSection(id) {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar esta sección?"
    );

    if (!confirmDelete) return;

    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      sections: (prev.sections || []).filter((section) => section.id !== id)
    }));
  }

  function moveSection(id, direction) {
    setProject((prev) => {
      const currentSections = [...(prev.sections || [])];
      const index = currentSections.findIndex((section) => section.id === id);

      if (index === -1) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= currentSections.length) {
        return prev;
      }

      const temp = currentSections[index];
      currentSections[index] = currentSections[targetIndex];
      currentSections[targetIndex] = temp;

      const reorderedSections = currentSections.map((section, i) => ({
        ...section,
        order: i + 1
      }));

      return {
        ...prev,
        updatedAt: Date.now(),
        sections: reorderedSections
      };
    });
  }

  function duplicateSection(section) {
    const copy = {
      ...section,
      id: crypto.randomUUID(),
      title: `${section.title || "Sección"} copia`,
      order: sections.length + 1
    };

    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      sections: [...(prev.sections || []), copy]
    }));
  }

  const sortedSections = [...sections].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  return (
    <section className="panelSection">
      <h3>Secciones editables</h3>

      <p
        style={{
          color: "#94a3b8",
          fontSize: "14px",
          marginBottom: "15px"
        }}
      >
        Agrega, edita, elimina y mueve secciones completas dentro de cada página.
      </p>

      <div className="actions">
        <button
          type="button"
          className="btn secondary"
          onClick={() => addSection("text-card")}
        >
          + Agregar texto
        </button>

        <button
          type="button"
          className="btn secondary"
          onClick={() => addSection("buttons")}
        >
          + Agregar botones
        </button>
      </div>

      <br />

      {sortedSections.length ? (
        sortedSections.map((section) => (
          <div
            key={section.id}
            style={{
              border: "1px solid rgba(255,255,255,.2)",
              borderRadius: "14px",
              padding: "14px",
              marginBottom: "18px",
              background: "rgba(0,0,0,.25)"
            }}
          >
            <div className="grid2">
              <label>
                Mostrar
                <select
                  value={section.show ? "yes" : "no"}
                  onChange={(e) =>
                    updateSection(section.id, "show", e.target.value === "yes")
                  }
                >
                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label>
                Página
                <select
                  value={section.page || "home"}
                  onChange={(e) =>
                    updateSection(section.id, "page", e.target.value)
                  }
                >
                  {pages.map((page) => (
                    <option key={page.key} value={page.key}>
                      {page.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid2">
              <label>
                Tipo
                <select
                  value={section.type || "text-card"}
                  onChange={(e) =>
                    updateSection(section.id, "type", e.target.value)
                  }
                >
                  <option value="text-card">Cartel de texto</option>
                  <option value="buttons">Botones</option>
                </select>
              </label>

              <label>
                Orden
                <input
                  type="number"
                  value={section.order || 1}
                  onChange={(e) =>
                    updateSection(section.id, "order", Number(e.target.value))
                  }
                />
              </label>
            </div>

            <label>
              Título
              <input
                value={section.title || ""}
                onChange={(e) =>
                  updateSection(section.id, "title", e.target.value)
                }
              />
            </label>

            {section.type !== "buttons" && (
              <label>
                Texto
                <textarea
                  value={section.text || ""}
                  onChange={(e) =>
                    updateSection(section.id, "text", e.target.value)
                  }
                />
              </label>
            )}

            {section.type === "buttons" && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  border: "1px solid rgba(255,255,255,.15)",
                  borderRadius: "12px"
                }}
              >
                <h4>Botones visibles</h4>

                <CheckField
                  label="WhatsApp"
                  checked={section.showWhatsapp}
                  onChange={(v) =>
                    updateSection(section.id, "showWhatsapp", v)
                  }
                />

                <CheckField
                  label="Llamar"
                  checked={section.showCall}
                  onChange={(v) => updateSection(section.id, "showCall", v)}
                />

                <CheckField
                  label="SMS"
                  checked={section.showSms}
                  onChange={(v) => updateSection(section.id, "showSms", v)}
                />

                <CheckField
                  label="Email"
                  checked={section.showEmail}
                  onChange={(v) => updateSection(section.id, "showEmail", v)}
                />

                <CheckField
                  label="Pagos"
                  checked={section.showPayments}
                  onChange={(v) =>
                    updateSection(section.id, "showPayments", v)
                  }
                />
              </div>
            )}

            <div
              className="actions"
              style={{
                marginTop: "12px"
              }}
            >
              <button
                type="button"
                className="btn secondary"
                onClick={() => moveSection(section.id, "up")}
              >
                ↑ Subir
              </button>

              <button
                type="button"
                className="btn secondary"
                onClick={() => moveSection(section.id, "down")}
              >
                ↓ Bajar
              </button>

              <button
                type="button"
                className="btn secondary"
                onClick={() => duplicateSection(section)}
              >
                Duplicar
              </button>

              <button
                type="button"
                className="btn danger"
                onClick={() => deleteSection(section.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No hay secciones agregadas.</p>
      )}
    </section>
  );
}

function CheckField({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "center",
        marginBottom: "8px"
      }}
    >
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}