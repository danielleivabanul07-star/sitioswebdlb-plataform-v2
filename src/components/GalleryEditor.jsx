export function GalleryEditor({ project, setProject }) {
  function addFiles(files) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setProject((prev) => ({
          ...prev,
          gallery: [
            ...prev.gallery,
            {
              src: reader.result,
              fileName: file.name || `galeria${prev.gallery.length + 1}.jpg`,
              title: "Foto de galería",
              description: ""
            }
          ]
        }));
      };
      reader.readAsDataURL(file);
    });
  }

  function update(index, field, value) {
    setProject((prev) => {
      const gallery = [...prev.gallery];
      gallery[index] = { ...gallery[index], [field]: value };
      return { ...prev, gallery };
    });
  }

  function remove(index) {
    setProject((prev) => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  }

  function move(index, direction) {
    setProject((prev) => {
      const gallery = [...prev.gallery];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= gallery.length) return prev;
      [gallery[index], gallery[newIndex]] = [gallery[newIndex], gallery[index]];
      return { ...prev, gallery };
    });
  }

  return (
    <section className="panelSection">
      <h3>Galería editable</h3>

      <label>
        Subir fotos
        <input type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} />
      </label>

      {project.gallery.map((image, index) => (
        <div className="editBox" key={index}>
          <div className="editHead">
            <strong>Foto {index + 1}</strong>
            <div>
              <button onClick={() => move(index, -1)}>↑</button>
              <button onClick={() => move(index, 1)}>↓</button>
              <button onClick={() => remove(index)}>X</button>
            </div>
          </div>

          <img src={image.src} className="thumb" alt={image.title} />

          <label>
            Título / alt
            <input value={image.title} onChange={(e) => update(index, "title", e.target.value)} />
          </label>

          <label>
            Descripción
            <input value={image.description} onChange={(e) => update(index, "description", e.target.value)} />
          </label>
        </div>
      ))}
    </section>
  );
}
