import { useEffect, useState } from "react";
import { fixedCredit } from "../utils/defaultProject.js";
import { renderField } from "../utils/renderField.jsx";
import { DraggableElement } from "./DraggableElement.jsx";

export function Preview({ project, setProject, visiblePages = [] }) {
  const pages = project?.pages || [];
  const business = project?.business || {};
  const design = project?.design || {};

  const safeVisiblePages = visiblePages.length
    ? visiblePages
    : pages.filter((page) => page.show);

  const [activePageKey, setActivePageKey] = useState(
    safeVisiblePages[0]?.key || "home"
  );

  useEffect(() => {
    if (!safeVisiblePages.some((p) => p.key === activePageKey)) {
      setActivePageKey(safeVisiblePages[0]?.key || "home");
    }
  }, [safeVisiblePages, activePageKey]);

  const activePage =
    pages.find((p) => p.key === activePageKey) || safeVisiblePages[0];

  const overlay = design.overlayOpacity ?? 0.72;

  const backgroundMode =
    design.backgroundMode === "perPage" ? "perPage" : "global";

  const globalSiteBackground =
    backgroundMode === "global" && design.globalBackground
      ? {
          backgroundImage: `
            linear-gradient(
              rgba(0,0,0,${overlay}),
              rgba(0,0,0,${overlay})
            ),
            url(${design.globalBackground})
          `,
          backgroundSize: `${design.globalBackgroundSize ?? 100}%`,
          backgroundPosition: `${design.globalBackgroundPositionX ?? 50}% ${
            design.globalBackgroundPositionY ?? 50
          }%`,
          backgroundRepeat: "no-repeat",
          backgroundAttachment: design.backgroundFixed ? "fixed" : "scroll",
          backgroundColor: "#000"
        }
      : {
          backgroundColor: "#000"
        };

  function goToPage(key) {
    const page = pages.find((p) => p.key === key);
    if (page) setActivePageKey(key);
  }

  return (
    <section className="previewWrap">
      <div className="previewTop">
        <strong>Vista previa</strong>
        <span>{activePage?.label}</span>
      </div>

      <div
        className="previewSite"
        style={{
          "--accent": design.accent || "#facc15",
          "--radius": `${design.radius ?? design.borderRadius ?? 14}px`,
          fontFamily: design.font || "Arial, sans-serif",
          color: design.textColor || "#ffffff",
          ...globalSiteBackground
        }}
      >
        <div
          className="siteHeader"
          style={{
            background: design.headerBackground || "rgba(0,0,0,.75)",
            borderBottom: `${design.borderSize ?? 1}px solid ${
              design.borderColor || "#333"
            }`
          }}
        >
          <DraggableElement
            id="headerLogo"
            project={project}
            setProject={setProject}
          >
            <div
              className="siteLogo"
              style={{
                color: design.titleColor || design.accent || "#facc15"
              }}
            >
              {business.name || "Nombre del negocio"}
            </div>
          </DraggableElement>

          <DraggableElement
            id="headerNav"
            project={project}
            setProject={setProject}
            style={{ display: "block" }}
          >
            <div
              className="siteNav"
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap"
              }}
            >
              {safeVisiblePages.map((page) => (
                <button
                  key={page.key}
                  type="button"
                  onClick={() => goToPage(page.key)}
                  style={{
                    background:
                      page.key === activePageKey
                        ? design.accent || "#facc15"
                        : "transparent",
                    color:
                      page.key === activePageKey
                        ? "#000"
                        : design.textColor || "#ffffff",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    transition: ".2s"
                  }}
                >
                  {page.label}
                </button>
              ))}
            </div>
          </DraggableElement>
        </div>

        <PreviewPage
          page={activePage}
          project={project}
          setProject={setProject}
          backgroundMode={backgroundMode}
          overlay={overlay}
        />

        <DraggableElement
          id="footer"
          project={project}
          setProject={setProject}
          style={{ display: "block", width: "100%" }}
        >
          <footer
            className="siteFooter"
            style={{
              background: design.footerBackground || "rgba(0,0,0,.85)",
              borderTop: `${design.borderSize ?? 1}px solid ${
                design.borderColor || "#333"
              }`
            }}
          >
            <p>
              © 2026 {business.name || "Negocio"}. Todos los derechos reservados.
            </p>

            <div className="developerCredit">
              {fixedCredit.text}{" "}
              <a
                href={fixedCredit.url}
                target="_blank"
                rel="noreferrer"
                style={{ color: design.accent || "#facc15" }}
              >
                {fixedCredit.brand}
              </a>
            </div>
          </footer>
        </DraggableElement>
      </div>
    </section>
  );
}

function PreviewPage({ page, project, setProject, backgroundMode, overlay }) {
  const business = project?.business || {};
  const services = project?.services || [];
  const gallery = project?.gallery || [];
  const forms = project?.forms || {
    appointments: [],
    financing: []
  };
  const buttons = project?.buttons || {};
  const design = project?.design || {};

  if (!page) return null;

  const heroImage = design.heroBackground || "";

  const heroBgStyle = heroImage
    ? {
        backgroundImage: `
          linear-gradient(
            rgba(0,0,0,${overlay}),
            rgba(0,0,0,${overlay})
          ),
          url(${heroImage})
        `,
        backgroundSize: `${design.heroBackgroundSize ?? 100}%`,
        backgroundPosition: `${design.heroBackgroundPositionX ?? 50}% ${
          design.heroBackgroundPositionY ?? 50
        }%`,
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000"
      }
    : {
        background: "transparent"
      };

  const pageBgStyle =
    backgroundMode === "perPage" && page?.background
      ? {
          backgroundImage: `
            linear-gradient(
              rgba(0,0,0,${overlay}),
              rgba(0,0,0,${overlay})
            ),
            url(${page.background})
          `,
          backgroundSize: `${page.backgroundSize ?? 100}%`,
          backgroundPosition: `${page.backgroundPositionX ?? 50}% ${
            page.backgroundPositionY ?? 50
          }%`,
          backgroundRepeat: "no-repeat",
          backgroundAttachment: design.backgroundFixed ? "fixed" : "scroll",
          backgroundColor: "#000"
        }
      : {
          background: design.sectionBackground || "transparent"
        };

  const cardStyle = {
    background: design.cardBackground || "rgba(0,0,0,.55)",
    border: `${design.borderSize ?? 1}px solid ${design.borderColor || "#333"}`,
    borderRadius: `${design.borderRadius ?? design.radius ?? 14}px`,
    boxShadow: `0 0 ${design.shadowStrength ?? 20}px rgba(0,0,0,.45)`,
    color: design.textColor || "#ffffff"
  };

  const btnStyle = {
    background: design.buttonBackground || design.accent || "#facc15",
    color: design.buttonTextColor || "#111827",
    borderRadius: `${design.borderRadius ?? design.radius ?? 14}px`,
    border: `${design.borderSize ?? 1}px solid ${
      design.borderColor || "transparent"
    }`,
    cursor: "pointer"
  };

  if (page.key === "home") {
    return (
      <>
        <section className="siteHero" style={heroBgStyle}>
          <div>
            <DraggableElement
              id="heroTitle"
              project={project}
              setProject={setProject}
            >
              <h1 style={{ color: design.titleColor || "#facc15" }}>
                {business.name}
              </h1>
            </DraggableElement>

            <DraggableElement
              id="heroText"
              project={project}
              setProject={setProject}
            >
              <p>{business.hero}</p>
            </DraggableElement>
          </div>
        </section>

        <section className="siteSection" style={pageBgStyle}>
          <DraggableElement
            id="aboutTitle"
            project={project}
            setProject={setProject}
          >
            <h2 style={{ color: design.titleColor || "#facc15" }}>
              Sobre Nosotros
            </h2>
          </DraggableElement>

          <DraggableElement
            id="aboutCard"
            project={project}
            setProject={setProject}
            style={{ display: "block" }}
          >
            <div className="storyCard" style={cardStyle}>
              {business.about}
            </div>
          </DraggableElement>
        </section>

        <section className="siteSection" style={pageBgStyle}>
          <DraggableElement
            id="whyTitle"
            project={project}
            setProject={setProject}
          >
            <h2 style={{ color: design.titleColor || "#facc15" }}>
              Por qué elegirnos
            </h2>
          </DraggableElement>

          <DraggableElement
            id="whyCard"
            project={project}
            setProject={setProject}
            style={{ display: "block" }}
          >
            <div className="storyCard" style={cardStyle}>
              {business.why}
            </div>
          </DraggableElement>
        </section>
      </>
    );
  }

  if (page.key === "services") {
    return (
      <section className="siteSection" style={pageBgStyle}>
        <DraggableElement
          id="servicesTitle"
          project={project}
          setProject={setProject}
        >
          <h2 style={{ color: design.titleColor || "#facc15" }}>
            {page.title}
          </h2>
        </DraggableElement>

        <div className="cards">
          {services.map((service, i) => (
            <DraggableElement
              key={i}
              id={`serviceCard-${i}`}
              project={project}
              setProject={setProject}
              style={{ display: "block" }}
            >
              <div className="siteCard" style={cardStyle}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </DraggableElement>
          ))}
        </div>
      </section>
    );
  }

  if (page.key === "gallery") {
    return (
      <section className="siteSection" style={pageBgStyle}>
        <DraggableElement
          id="galleryTitle"
          project={project}
          setProject={setProject}
        >
          <h2 style={{ color: design.titleColor || "#facc15" }}>
            {page.title}
          </h2>
        </DraggableElement>

        <div className="galleryGrid">
          {gallery.length ? (
            gallery.map((img, i) => (
              <DraggableElement
                key={i}
                id={`galleryItem-${i}`}
                project={project}
                setProject={setProject}
                style={{ display: "block" }}
              >
                <div style={cardStyle}>
                  <img src={img.src} alt={img.title || "Galería"} />
                  {img.description && <p>{img.description}</p>}
                </div>
              </DraggableElement>
            ))
          ) : (
            <DraggableElement
              id="galleryEmptyCard"
              project={project}
              setProject={setProject}
              style={{ display: "block" }}
            >
              <div className="siteCard" style={cardStyle}>
                <h3>Galería próximamente</h3>
                <p>Agrega fotos desde el panel.</p>
              </div>
            </DraggableElement>
          )}
        </div>
      </section>
    );
  }

  if (page.key === "appointments") {
    return (
      <section className="siteSection" style={pageBgStyle}>
        <DraggableElement
          id="appointmentsTitle"
          project={project}
          setProject={setProject}
        >
          <h2 style={{ color: design.titleColor || "#facc15" }}>
            {page.title}
          </h2>
        </DraggableElement>

        <DraggableElement
          id="appointmentsForm"
          project={project}
          setProject={setProject}
          style={{ display: "block" }}
        >
          <form className="formBox" style={cardStyle}>
            <div className="formGrid">
              {(forms.appointments || []).map((field, i) =>
                renderField(field, i)
              )}
            </div>

            <a
              className="siteBtn"
              style={btnStyle}
              href={`https://wa.me/${business.phone || ""}`}
              target="_blank"
              rel="noreferrer"
            >
              Enviar por WhatsApp
            </a>
          </form>
        </DraggableElement>
      </section>
    );
  }

  if (page.key === "financing") {
    return (
      <section className="siteSection" style={pageBgStyle}>
        <DraggableElement
          id="financingTitle"
          project={project}
          setProject={setProject}
        >
          <h2 style={{ color: design.titleColor || "#facc15" }}>
            {page.title}
          </h2>
        </DraggableElement>

        <DraggableElement
          id="financingForm"
          project={project}
          setProject={setProject}
          style={{ display: "block" }}
        >
          <form className="formBox" style={cardStyle}>
            <div className="formGrid">
              {(forms.financing || []).map((field, i) => renderField(field, i))}
            </div>

            <a
              className="siteBtn"
              style={btnStyle}
              href={`https://wa.me/${business.phone || ""}`}
              target="_blank"
              rel="noreferrer"
            >
              Solicitar por WhatsApp
            </a>
          </form>
        </DraggableElement>
      </section>
    );
  }

  if (page.key === "contact") {
    return (
      <section className="siteSection" style={pageBgStyle}>
        <DraggableElement
          id="contactTitle"
          project={project}
          setProject={setProject}
        >
          <h2 style={{ color: design.titleColor || "#facc15" }}>
            {page.title}
          </h2>
        </DraggableElement>

        <DraggableElement
          id="contactButtons"
          project={project}
          setProject={setProject}
          style={{ display: "block" }}
        >
          <div className="contactButtons">
            <a
              className="contactBtn"
              style={btnStyle}
              href={`https://wa.me/${business.phone || ""}`}
              target="_blank"
              rel="noreferrer"
            >
              🟢 <span>{buttons.whatsapp || "WhatsApp"}</span>
            </a>

            <a
              className="contactBtn"
              style={btnStyle}
              href={`tel:${business.phone || ""}`}
            >
              📞 <span>{buttons.call || "Llamar"}</span>
            </a>

            <a
              className="contactBtn"
              style={btnStyle}
              href={`sms:${business.phone || ""}`}
            >
              💬 <span>{buttons.sms || "Mensaje"}</span>
            </a>

            <a
              className="contactBtn"
              style={btnStyle}
              href={`mailto:${business.email || ""}`}
            >
              ✉️ <span>{buttons.email || "Email"}</span>
            </a>
          </div>
        </DraggableElement>

        <DraggableElement
          id="contactInfo"
          project={project}
          setProject={setProject}
          style={{ display: "block" }}
        >
          <div className="storyCard" style={cardStyle}>
            <p>
              <strong>Dirección:</strong> {business.address}
            </p>

            <p>
              <strong>Pagos:</strong> {business.payments}
            </p>
          </div>
        </DraggableElement>
      </section>
    );
  }

  return null;
}