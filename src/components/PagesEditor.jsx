export function PagesEditor({ project, setProject }) {
  function updatePage(index, field, value) {
    setProject((prev) => {
      const pages = [...prev.pages];
      pages[index] = { ...pages[index], [field]: value };
      return { ...prev, pages };
    });
  }

  function movePage(index, direction) {
    setProject((prev) => {
      const pages = [...prev.pages];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= pages.length) return prev;
      [pages[index], pages[newIndex]] = [pages[newIndex], pages[index]];
      return { ...prev, pages };
    });
  }

  return (
    <section className="panelSection">
      <h3>Páginas, orden y visibilidad</h3>
      {project.pages.map((page, index) => (
        <div className="editBox" key={page.key}>
          <div className="editHead">
            <strong>{page.file}</strong>
            <div>
              <button onClick={() => movePage(index, -1)}>↑</button>
              <button onClick={() => movePage(index, 1)}>↓</button>
            </div>
          </div>

          <label className="check">
            <input
              type="checkbox"
              checked={page.show}
              onChange={(e) => updatePage(index, "show", e.target.checked)}
            />
            Mostrar página
          </label>

          <label>
            Nombre en menú
            <input value={page.label} onChange={(e) => updatePage(index, "label", e.target.value)} />
          </label>

          <label>
            Título de página
            <input value={page.title} onChange={(e) => updatePage(index, "title", e.target.value)} />
          </label>
        </div>
      ))}
    </section>
  );
}
