const fieldTypes = [
  ["text", "Texto"],
  ["tel", "Teléfono"],
  ["email", "Email"],
  ["date", "Fecha"],
  ["number", "Número"],
  ["select", "Select"],
  ["checkbox", "Checkbox"],
  ["textarea", "Texto largo"]
];

export function FormBuilder({ title, kind, project, setProject }) {
  const fields = project.forms[kind];

  function update(index, field, value) {
    setProject((prev) => {
      const fields = [...prev.forms[kind]];
      fields[index] = { ...fields[index], [field]: value };
      return {
        ...prev,
        forms: { ...prev.forms, [kind]: fields }
      };
    });
  }

  function add() {
    setProject((prev) => ({
      ...prev,
      forms: {
        ...prev.forms,
        [kind]: [
          ...prev.forms[kind],
          {
            label: "Nueva pregunta",
            type: "text",
            placeholder: "Escribe aquí",
            required: false,
            full: false,
            options: ""
          }
        ]
      }
    }));
  }

  function remove(index) {
    setProject((prev) => ({
      ...prev,
      forms: {
        ...prev.forms,
        [kind]: prev.forms[kind].filter((_, i) => i !== index)
      }
    }));
  }

  function move(index, direction) {
    setProject((prev) => {
      const fields = [...prev.forms[kind]];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= fields.length) return prev;
      [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
      return {
        ...prev,
        forms: { ...prev.forms, [kind]: fields }
      };
    });
  }

  return (
    <section className="panelSection">
      <div className="sectionHeader">
        <h3>{title}</h3>
        <button onClick={add} className="btn secondary">+ Pregunta</button>
      </div>

      {fields.map((field, index) => (
        <div className="editBox" key={index}>
          <div className="editHead">
            <strong>Pregunta {index + 1}</strong>
            <div>
              <button onClick={() => move(index, -1)}>↑</button>
              <button onClick={() => move(index, 1)}>↓</button>
              <button onClick={() => remove(index)}>X</button>
            </div>
          </div>

          <label>
            Pregunta / etiqueta
            <input value={field.label} onChange={(e) => update(index, "label", e.target.value)} />
          </label>

          <div className="grid2">
            <label>
              Tipo
              <select value={field.type} onChange={(e) => update(index, "type", e.target.value)}>
                {fieldTypes.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label>
              Placeholder
              <input value={field.placeholder} onChange={(e) => update(index, "placeholder", e.target.value)} />
            </label>
          </div>

          <label>
            Opciones para select/checkbox, separadas por coma
            <input value={field.options} onChange={(e) => update(index, "options", e.target.value)} />
          </label>

          <div className="checks">
            <label className="check">
              <input type="checkbox" checked={field.required} onChange={(e) => update(index, "required", e.target.checked)} />
              Obligatorio
            </label>

            <label className="check">
              <input type="checkbox" checked={field.full} onChange={(e) => update(index, "full", e.target.checked)} />
              Ancho completo
            </label>
          </div>
        </div>
      ))}
    </section>
  );
}
