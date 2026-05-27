import { Download, Save, Upload } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { PagesEditor } from "./PagesEditor.jsx";
import { ServicesEditor } from "./ServicesEditor.jsx";
import { GalleryEditor } from "./GalleryEditor.jsx";
import { FormBuilder } from "./FormBuilder.jsx";
import { AITools } from "./AITools.jsx";

const supabaseUrl = "https://xkehxgpzolkhjmjjsccxr.supabase.co";
const supabaseKey = "sb_publishable_P1VuCqfYNf6uhlZsazicpA_x8w7Rdcc";
const supabaseStorage = createClient(supabaseUrl, supabaseKey);

export function BuilderPanel({
  project,
  setProject,
  updateBusiness,
  updateDesign,
  onExportZip
}) {
  const { business, design, buttons, pages } = project;

  const backgroundMode =
    design.backgroundMode === "perPage" ? "perPage" : "global";

  function updateButtons(field, value) {
    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      buttons: {
        ...prev.buttons,
        [field]: value
      }
    }));
  }

  async function uploadImage(file, folder = "backgrounds") {
    if (!file) return "";

    const safeName = file.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "");

    const filePath = `${folder}/${Date.now()}-${safeName}`;

    const { error } = await supabaseStorage.storage
      .from("site-backgrounds")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true
      });

    if (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error subiendo imagen a Supabase Storage");
      return "";
    }

    const { data } = supabaseStorage.storage
      .from("site-backgrounds")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleHeroBackground(file) {
    if (!file) return;

    const imageUrl = await uploadImage(file, "hero");

    if (!imageUrl) return;

    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      design: {
        ...prev.design,
        heroBackground: imageUrl,
        heroBackgroundName: file.name || "fondo-hero.jpg"
      }
    }));
  }

  function removeHeroBackground() {
    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      design: {
        ...prev.design,
        heroBackground: "",
        heroBackgroundName: ""
      }
    }));
  }

  async function handleGlobalBackground(file) {
    if (!file) return;

    const imageUrl = await uploadImage(file, "global");

    if (!imageUrl) return;

    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      design: {
        ...prev.design,
        globalBackground: imageUrl,
        globalBackgroundName: file.name || "fondo-global.jpg",
        backgroundMode: "global"
      }
    }));
  }

  function removeGlobalBackground() {
    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      design: {
        ...prev.design,
        globalBackground: "",
        globalBackgroundName: ""
      }
    }));
  }

  async function handlePageBackground(index, file) {
    if (!file) return;

    const imageUrl = await uploadImage(file, "pages");

    if (!imageUrl) return;

    setProject((prev) => {
      const updatedPages = [...prev.pages];

      updatedPages[index] = {
        ...updatedPages[index],
        background: imageUrl,
        backgroundName: file.name || "fondo-pagina.jpg"
      };

      return {
        ...prev,
        updatedAt: Date.now(),
        pages: updatedPages,
        design: {
          ...prev.design,
          backgroundMode: "perPage"
        }
      };
    });
  }

  function removePageBackground(index) {
    setProject((prev) => {
      const updatedPages = [...prev.pages];

      updatedPages[index] = {
        ...updatedPages[index],
        background: "",
        backgroundName: ""
      };

      return {
        ...prev,
        updatedAt: Date.now(),
        pages: updatedPages
      };
    });
  }

  function removeAllPageBackgrounds() {
    setProject((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      pages: prev.pages.map((page) => ({
        ...page,
        background: "",
        backgroundName: ""
      }))
    }));
  }

  function saveProject() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            ...project,
            updatedAt: Date.now()
          },
          null,
          2
        )
      ],
      {
        type: "application/json"
      }
    );

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = "proyecto-sitioswebdlb.json";
    a.click();

    URL.revokeObjectURL(a.href);
  }

  function loadProject(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const loadedProject = JSON.parse(reader.result);

        setProject({
          ...loadedProject,
          updatedAt: Date.now()
        });
      } catch {
        alert("Ese archivo no parece un proyecto válido.");
      }
    };

    reader.readAsText(file);
  }

  return (
    <aside className="panel">
      <h2>Panel editable</h2>

      <section className="panelSection">
        <h3>Datos del negocio</h3>

        <div className="grid2">
          <Field
            label="Nombre"
            value={business.name}
            onChange={(v) => updateBusiness("name", v)}
          />

          <Field
            label="Tipo"
            value={business.type}
            onChange={(v) => updateBusiness("type", v)}
          />
        </div>

        <Field
          label="Mensaje principal"
          value={business.hero}
          onChange={(v) => updateBusiness("hero", v)}
        />

        <TextArea
          label="Sobre Nosotros"
          value={business.about}
          onChange={(v) => updateBusiness("about", v)}
        />

        <TextArea
          label="Por qué elegirnos"
          value={business.why}
          onChange={(v) => updateBusiness("why", v)}
        />

        <div className="grid2">
          <Field
            label="Teléfono / WhatsApp"
            value={business.phone}
            onChange={(v) => updateBusiness("phone", v)}
          />

          <Field
            label="Email"
            value={business.email}
            onChange={(v) => updateBusiness("email", v)}
          />
        </div>

        <Field
          label="Dirección"
          value={business.address}
          onChange={(v) => updateBusiness("address", v)}
        />
      </section>

      <section className="panelSection">
        <h3>Diseño avanzado</h3>

        <div className="grid2">
          <ColorField
            label="Color principal"
            value={design.accent}
            onChange={(v) => updateDesign("accent", v)}
          />

          <ColorField
            label="Color texto"
            value={design.textColor}
            onChange={(v) => updateDesign("textColor", v)}
          />

          <ColorField
            label="Color títulos"
            value={design.titleColor}
            onChange={(v) => updateDesign("titleColor", v)}
          />

          <ColorField
            label="Fondo botones"
            value={design.buttonBackground}
            onChange={(v) => updateDesign("buttonBackground", v)}
          />

          <ColorField
            label="Texto botones"
            value={design.buttonTextColor}
            onChange={(v) => updateDesign("buttonTextColor", v)}
          />

          <ColorField
            label="Color bordes"
            value={design.borderColor}
            onChange={(v) => updateDesign("borderColor", v)}
          />

          <ColorField
            label="Fondo header"
            value={design.headerBackground}
            onChange={(v) => updateDesign("headerBackground", v)}
          />

          <ColorField
            label="Fondo footer"
            value={design.footerBackground}
            onChange={(v) => updateDesign("footerBackground", v)}
          />
        </div>

        <Field
          label="Fondo secciones CSS"
          value={design.sectionBackground}
          onChange={(v) => updateDesign("sectionBackground", v)}
        />

        <Field
          label="Fondo tarjetas CSS"
          value={design.cardBackground}
          onChange={(v) => updateDesign("cardBackground", v)}
        />

        <label>
          Fuente
          <select
            value={design.font}
            onChange={(e) => updateDesign("font", e.target.value)}
          >
            <option value="Arial, Helvetica, sans-serif">Arial</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Trebuchet MS', Arial, sans-serif">Trebuchet</option>
          </select>
        </label>

        <RangeField
          label="Redondeo general"
          value={design.radius ?? 20}
          min="0"
          max="50"
          step="1"
          onChange={(v) => updateDesign("radius", v)}
        />

        <RangeField
          label="Redondeo recuadros"
          value={design.borderRadius ?? 20}
          min="0"
          max="50"
          step="1"
          onChange={(v) => updateDesign("borderRadius", v)}
        />

        <RangeField
          label="Grosor marco"
          value={design.borderSize ?? 1}
          min="0"
          max="10"
          step="1"
          onChange={(v) => updateDesign("borderSize", v)}
        />

        <RangeField
          label="Sombra recuadros"
          value={design.shadowStrength ?? 25}
          min="0"
          max="80"
          step="1"
          onChange={(v) => updateDesign("shadowStrength", v)}
        />

        <RangeField
          label="Oscuridad fondo"
          value={design.overlayOpacity ?? 0.72}
          min="0"
          max="1"
          step="0.05"
          onChange={(v) => updateDesign("overlayOpacity", v)}
        />

        <label>
          Modo de fondo
          <select
            value={backgroundMode}
            onChange={(e) => updateDesign("backgroundMode", e.target.value)}
          >
            <option value="global">Un solo fondo para toda la web</option>
            <option value="perPage">Fondo diferente por cada página</option>
          </select>
        </label>

        <label>
          Imagen de fondo fija
          <select
            value={design.backgroundFixed ? "yes" : "no"}
            onChange={(e) =>
              updateDesign("backgroundFixed", e.target.value === "yes")
            }
          >
            <option value="yes">Sí, dejar fija al hacer scroll</option>
            <option value="no">No, mover con la página</option>
          </select>
        </label>

        <Box>
          <h4>Ajuste fondo global</h4>

          <RangeField
            label="Zoom fondo global"
            value={design.globalBackgroundSize ?? 100}
            min="50"
            max="200"
            step="1"
            onChange={(v) => updateDesign("globalBackgroundSize", v)}
          />

          <RangeField
            label="Mover horizontal"
            value={design.globalBackgroundPositionX ?? 50}
            min="0"
            max="100"
            step="1"
            onChange={(v) => updateDesign("globalBackgroundPositionX", v)}
          />

          <RangeField
            label="Mover vertical"
            value={design.globalBackgroundPositionY ?? 50}
            min="0"
            max="100"
            step="1"
            onChange={(v) => updateDesign("globalBackgroundPositionY", v)}
          />
        </Box>

        <Box>
          <h4>Ajuste Hero</h4>

          <RangeField
            label="Zoom hero"
            value={design.heroBackgroundSize ?? 100}
            min="50"
            max="200"
            step="1"
            onChange={(v) => updateDesign("heroBackgroundSize", v)}
          />

          <RangeField
            label="Hero horizontal"
            value={design.heroBackgroundPositionX ?? 50}
            min="0"
            max="100"
            step="1"
            onChange={(v) => updateDesign("heroBackgroundPositionX", v)}
          />

          <RangeField
            label="Hero vertical"
            value={design.heroBackgroundPositionY ?? 50}
            min="0"
            max="100"
            step="1"
            onChange={(v) => updateDesign("heroBackgroundPositionY", v)}
          />
        </Box>

        {backgroundMode === "global" && (
          <Box>
            <h4>Fondo global de toda la web</h4>

            <label>
              Subir fondo global
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleGlobalBackground(e.target.files[0])}
              />
            </label>

            {design.globalBackgroundName && (
              <>
                <p>Fondo actual: {design.globalBackgroundName}</p>

                <button
                  type="button"
                  className="btn secondary"
                  onClick={removeGlobalBackground}
                >
                  Quitar fondo global
                </button>
              </>
            )}
          </Box>
        )}

        {backgroundMode === "perPage" && (
          <Box>
            <h4>Fondos por página</h4>

            <button
              type="button"
              className="btn secondary"
              onClick={removeAllPageBackgrounds}
            >
              Quitar todos
            </button>

            {pages.map((page, index) => (
              <div key={page.key} style={{ marginBottom: "15px" }}>
                <label>
                  Fondo para {page.label}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handlePageBackground(index, e.target.files[0])
                    }
                  />
                </label>

                {page.backgroundName && (
                  <>
                    <p>Fondo actual: {page.backgroundName}</p>

                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => removePageBackground(index)}
                    >
                      Quitar fondo
                    </button>
                  </>
                )}
              </div>
            ))}
          </Box>
        )}

        <Box>
          <h4>Fondo Hero / Inicio</h4>

          <label>
            Subir fondo hero
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleHeroBackground(e.target.files[0])}
            />
          </label>

          {design.heroBackgroundName && (
            <>
              <p>Hero actual: {design.heroBackgroundName}</p>

              <button
                type="button"
                className="btn secondary"
                onClick={removeHeroBackground}
              >
                Quitar hero
              </button>
            </>
          )}
        </Box>
      </section>

      <PagesEditor project={project} setProject={setProject} />

      <ServicesEditor project={project} setProject={setProject} />

      <GalleryEditor project={project} setProject={setProject} />

      <FormBuilder
        title="Formulario de citas"
        kind="appointments"
        project={project}
        setProject={setProject}
      />

      <FormBuilder
        title="Formulario financiamiento"
        kind="financing"
        project={project}
        setProject={setProject}
      />

      <section className="panelSection">
        <h3>Botones y links</h3>

        <div className="grid2">
          <Field
            label="WhatsApp"
            value={buttons.whatsapp}
            onChange={(v) => updateButtons("whatsapp", v)}
          />

          <Field
            label="Llamada"
            value={buttons.call}
            onChange={(v) => updateButtons("call", v)}
          />

          <Field
            label="Mensaje"
            value={buttons.sms}
            onChange={(v) => updateButtons("sms", v)}
          />

          <Field
            label="Email"
            value={buttons.email}
            onChange={(v) => updateButtons("email", v)}
          />
        </div>

        <Field
          label="Google Business"
          value={business.google}
          onChange={(v) => updateBusiness("google", v)}
        />

        <div className="grid2">
          <Field
            label="Facebook"
            value={business.facebook}
            onChange={(v) => updateBusiness("facebook", v)}
          />

          <Field
            label="Instagram"
            value={business.instagram}
            onChange={(v) => updateBusiness("instagram", v)}
          />
        </div>

        <Field
          label="TikTok"
          value={business.tiktok}
          onChange={(v) => updateBusiness("tiktok", v)}
        />

        <Field
          label="Pagos"
          value={business.payments}
          onChange={(v) => updateBusiness("payments", v)}
        />
      </section>

      <AITools project={project} setProject={setProject} />

      <section className="panelSection">
        <h3>Guardar y exportar</h3>

        <div className="actions">
          <button onClick={saveProject} className="btn secondary">
            <Save size={16} />
            Guardar proyecto
          </button>

          <label className="btn secondary fileButton">
            <Upload size={16} />
            Cargar JSON
            <input
              type="file"
              accept=".json"
              onChange={(e) => loadProject(e.target.files[0])}
              hidden
            />
          </label>

          <button onClick={onExportZip} className="btn">
            <Download size={16} />
            Exportar ZIP
          </button>
        </div>

        <div className="locked">
          Crédito fijo:
          <strong>SitiosWebDLB</strong>
        </div>
      </section>
    </aside>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label>
      {label}
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  const safeValue = value?.startsWith("#") ? value : "#000000";

  return (
    <label>
      {label}
      <input
        type="color"
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
      />
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function RangeField({ label, value, min, max, step, onChange }) {
  return (
    <label>
      {label}: {value}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label>
      {label}
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Box({ children }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,.2)",
        padding: "14px",
        borderRadius: "12px",
        marginTop: "15px"
      }}
    >
      {children}
    </div>
  );
}