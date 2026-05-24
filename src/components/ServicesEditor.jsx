export function ServicesEditor({ project, setProject }) {
  function update(index, field, value) {
    setProject((prev) => {
      const services = [...prev.services];
      services[index] = { ...services[index], [field]: value };
      return { ...prev, services };
    });
  }

  function add() {
    setProject((prev) => ({
      ...prev,
      services: [...prev.services, { title: "Nuevo servicio", description: "Descripción del servicio." }]
    }));
  }

  function remove(index) {
    setProject((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  }

  function move(index, direction) {
    setProject((prev) => {
      const services = [...prev.services];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= services.length) return prev;
      [services[index], services[newIndex]] = [services[newIndex], services[index]];
      return { ...prev, services };
    });
  }

  return (
    <section className="panelSection">
      <div className="sectionHeader">
        <h3>Servicios editables</h3>
        <button onClick={add} className="btn secondary">+ Servicio</button>
      </div>

      {project.services.map((service, index) => (
        <div className="editBox" key={index}>
          <div className="editHead">
            <strong>Servicio {index + 1}</strong>
            <div>
              <button onClick={() => move(index, -1)}>↑</button>
              <button onClick={() => move(index, 1)}>↓</button>
              <button onClick={() => remove(index)}>X</button>
            </div>
          </div>

          <label>
            Nombre
            <input value={service.title} onChange={(e) => update(index, "title", e.target.value)} />
          </label>

          <label>
            Descripción
            <textarea value={service.description} onChange={(e) => update(index, "description", e.target.value)} />
          </label>
        </div>
      ))}
    </section>
  );
}
