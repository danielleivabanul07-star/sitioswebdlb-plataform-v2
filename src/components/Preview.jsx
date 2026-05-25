import { useEffect, useMemo, useState } from "react";
import { fixedCredit } from "../utils/defaultProject.js";
import { renderField } from "../utils/renderField.jsx";

export function Preview({ project, visiblePages = [] }) {
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
    pages.find((p) => p.key === activePageKey) ||
    safeVisiblePages[0];

  const overlay = design.overlayOpacity ?? 0.72;

  const backgroundMode =
    design.backgroundMode === "perPage"
      ? "perPage"
      : "global";

  // =========================
  // FONDO GLOBAL CORREGIDO
  // =========================

  const globalSiteBackground =
    backgroundMode === "global" &&
    design.globalBackground
      ? {
          backgroundImage: `
            linear-gradient(
              rgba(0,0,0,${overlay}),
              rgba(0,0,0,${overlay})
            ),
            url(${design.globalBackground})
          `,
          backgroundSize: "cover",
          backgroundPosition: `
            ${design.globalBackgroundPositionX ?? 50}%
            ${design.globalBackgroundPositionY ?? 50}%
          `,
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "scroll",
          backgroundColor: "#000"
        }
      : {
          backgroundColor: "#000"
        };

  function goToPage(key) {
    const page = pages.find((p) => p.key === key);

    if (page) {
      setActivePageKey(key);
    }
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
          "--accent":
            design.accent || "#facc15",

          "--radius": `${
            design.radius ??
            design.borderRadius ??
            14
          }px`,

          fontFamily:
            design.font ||
            "Arial, sans-serif",

          color:
            design.textColor ||
            "#ffffff",

          ...globalSiteBackground
        }}
      >
        <div
          className="siteHeader"
          style={{
            background:
              design.headerBackground ||
              "rgba(0,0,0,.75)",

            borderBottom: `${
              design.borderSize ?? 1
            }px solid ${
              design.borderColor || "#333"
            }`
          }}
        >
          <div
            className="siteLogo"
            style={{
              color:
                design.titleColor ||
                design.accent ||
                "#facc15"
            }}
          >
            {business.name ||
              "Nombre del negocio"}
          </div>

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
                onClick={() =>
                  goToPage(page.key)
                }
                style={{
                  background:
                    page.key ===
                    activePageKey
                      ? design.accent ||
                        "#facc15"
                      : "transparent",

                  color:
                    page.key ===
                    activePageKey
                      ? "#000"
                      : design.textColor ||
                        "#ffffff",

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
        </div>

        <PreviewPage
          page={activePage}
          project={project}
          backgroundMode={
            backgroundMode
          }
          overlay={overlay}
        />

        <footer
          className="siteFooter"
          style={{
            background:
              design.footerBackground ||
              "rgba(0,0,0,.85)",

            borderTop: `${
              design.borderSize ?? 1
            }px solid ${
              design.borderColor || "#333"
            }`
          }}
        >
          <p>
            © 2026{" "}
            {business.name ||
              "Negocio"}
            . Todos los derechos
            reservados.
          </p>

          <div className="developerCredit">
            {fixedCredit.text}{" "}
            <a
              href={fixedCredit.url}
              target="_blank"
              rel="noreferrer"
              style={{
                color:
                  design.accent ||
                  "#facc15"
              }}
            >
              {fixedCredit.brand}
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}

function PreviewPage({
  page,
  project,
  backgroundMode,
  overlay
}) {
  const business =
    project?.business || {};

  const services =
    project?.services || [];

  const gallery =
    project?.gallery || [];

  const forms =
    project?.forms || {
      appointments: [],
      financing: []
    };

  const buttons =
    project?.buttons || {};

  const design =
    project?.design || {};

  if (!page) return null;

  const heroImage =
    design.heroBackground || "";

  // =========================
  // HERO CORREGIDO
  // =========================

  const heroBgStyle = heroImage
    ? {
        backgroundImage: `
          linear-gradient(
            rgba(0,0,0,${overlay}),
            rgba(0,0,0,${overlay})
          ),
          url(${heroImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: `
          ${
            design.heroBackgroundPositionX ??
            50
          }%
          ${
            design.heroBackgroundPositionY ??
            50
          }%
        `,
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000"
      }
    : {
        background: "transparent"
      };

  const pageBgStyle =
    backgroundMode ===
      "perPage" &&
    page?.background
      ? {
          backgroundImage: `
            linear-gradient(
              rgba(0,0,0,${overlay}),
              rgba(0,0,0,${overlay})
            ),
            url("${page.background}")
          `,

          backgroundSize: `${
            page.backgroundSize ||
            100
          }%`,

          backgroundPosition: `
            ${
              page.backgroundPositionX ||
              50
            }%
            ${
              page.backgroundPositionY ||
              50
            }%
          `,

          backgroundRepeat:
            "no-repeat"
        }
      : {
          background:
            design.sectionBackground ||
            "transparent"
        };

  const cardStyle = {
    background:
      design.cardBackground ||
      "rgba(0,0,0,.55)",

    border: `${
      design.borderSize ?? 1
    }px solid ${
      design.borderColor || "#333"
    }`,

    borderRadius: `${
      design.borderRadius ??
      design.radius ??
      14
    }px`,

    boxShadow: `0 0 ${
      design.shadowStrength ?? 20
    }px rgba(0,0,0,.45)`,

    color:
      design.textColor ||
      "#ffffff"
  };

  const btnStyle = {
    background:
      design.buttonBackground ||
      design.accent ||
      "#facc15",

    color:
      design.buttonTextColor ||
      "#111827",

    borderRadius: `${
      design.borderRadius ??
      design.radius ??
      14
    }px`,

    border: `${
      design.borderSize ?? 1
    }px solid ${
      design.borderColor ||
      "transparent"
    }`,

    cursor: "pointer"
  };

  if (page.key === "home") {
    return (
      <>
        <section
          className="siteHero"
          style={heroBgStyle}
        >
          <div>
            <h1
              style={{
                color:
                  design.titleColor ||
                  "#facc15"
              }}
            >
              {business.name}
            </h1>

            <p>{business.hero}</p>
          </div>
        </section>

        <section
          className="siteSection"
          style={pageBgStyle}
        >
          <h2
            style={{
              color:
                design.titleColor ||
                "#facc15"
            }}
          >
            Sobre Nosotros
          </h2>

          <div
            className="storyCard"
            style={cardStyle}
          >
            {business.about}
          </div>
        </section>

        <section
          className="siteSection"
          style={pageBgStyle}
        >
          <h2
            style={{
              color:
                design.titleColor ||
                "#facc15"
            }}
          >
            Por qué elegirnos
          </h2>

          <div
            className="storyCard"
            style={cardStyle}
          >
            {business.why}
          </div>
        </section>
      </>
    );
  }

  if (page.key === "services") {
    return (
      <section
        className="siteSection"
        style={pageBgStyle}
      >
        <h2
          style={{
            color:
              design.titleColor ||
              "#facc15"
          }}
        >
          {page.title}
        </h2>

        <div className="cards">
          {services.map(
            (service, i) => (
              <div
                className="siteCard"
                key={i}
                style={cardStyle}
              >
                <h3>
                  {service.title}
                </h3>

                <p>
                  {
                    service.description
                  }
                </p>
              </div>
            )
          )}
        </div>
      </section>
    );
  }

  return null;
}