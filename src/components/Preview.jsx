import { useEffect, useState } from "react";
import { fixedCredit } from "../utils/defaultProject.js";
import { renderField } from "../utils/renderField.jsx";

export function Preview({ project, visiblePages }) {
  const [activePageKey, setActivePageKey] = useState(
    visiblePages[0]?.key || "home"
  );

  useEffect(() => {
    if (
      !visiblePages.some(
        (p) => p.key === activePageKey
      )
    ) {
      setActivePageKey(
        visiblePages[0]?.key || "home"
      );
    }
  }, [visiblePages, activePageKey]);

  const activePage =
    project.pages.find(
      (p) => p.key === activePageKey
    ) || visiblePages[0];

  const { business, design } = project;

  const overlay =
    design.overlayOpacity ?? 0.72;

  const backgroundMode =
    design.backgroundMode ===
    "perPage"
      ? "perPage"
      : "global";

  // FONDO GLOBAL SOLO PARA TODA LA WEB

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

          backgroundSize: `
            ${
              design.globalBackgroundSize ??
              100
            }%
          `,

          backgroundPosition: `
            ${
              design.globalBackgroundPositionX ??
              50
            }%
            ${
              design.globalBackgroundPositionY ??
              50
            }%
          `,

          backgroundRepeat:
            "no-repeat",

          backgroundAttachment:
            "fixed"
        }
      : {};

  function goToPage(key) {
    const page =
      project.pages.find(
        (p) => p.key === key
      );

    if (page)
      setActivePageKey(key);
  }

  return (
    <section className="previewWrap">
      <div className="previewTop">
        <strong>
          Vista previa
        </strong>

        <span>
          {activePage?.label}
        </span>
      </div>

      <div
        className="previewSite"
        style={{
          "--accent":
            design.accent,

          "--radius": `
            ${design.radius}px
          `,

          fontFamily:
            design.font,

          color:
            design.textColor,

          ...globalSiteBackground
        }}
      >
        {/* HEADER */}

        <div
          className="siteHeader"
          style={{
            background:
              design.headerBackground,

            borderBottom: `
              ${design.borderSize}px
              solid
              ${design.borderColor}
            `
          }}
        >
          <div
            className="siteLogo"
            style={{
              color:
                design.titleColor
            }}
          >
            {business.name}
          </div>

          {/* NAV */}

          <div
            className="siteNav"
            style={{
              display: "flex",

              gap: "10px",

              alignItems:
                "center",

              flexWrap: "wrap"
            }}
          >
            {visiblePages.map(
              (page) => (
                <button
                  key={page.key}
                  type="button"
                  onClick={() =>
                    goToPage(
                      page.key
                    )
                  }
                  style={{
                    background:
                      page.key ===
                      activePageKey
                        ? design.accent
                        : "transparent",

                    color:
                      page.key ===
                      activePageKey
                        ? "#000"
                        : design.textColor,

                    border:
                      "none",

                    cursor:
                      "pointer",

                    padding:
                      "8px 12px",

                    borderRadius:
                      "10px",

                    fontWeight:
                      "600",

                    transition:
                      ".2s"
                  }}
                >
                  {page.label}
                </button>
              )
            )}
          </div>
        </div>

        {/* PAGE */}

        <PreviewPage
          page={activePage}
          project={project}
          backgroundMode={
            backgroundMode
          }
          overlay={overlay}
        />

        {/* FOOTER */}

        <footer
          className="siteFooter"
          style={{
            background:
              design.footerBackground,

            borderTop: `
              ${design.borderSize}px
              solid
              ${design.borderColor}
            `
          }}
        >
          <p>
            © 2026{" "}
            {business.name}.
            Todos los derechos
            reservados.
          </p>

          <div className="developerCredit">
            {
              fixedCredit.text
            }{" "}
            <a
              href={
                fixedCredit.url
              }
              target="_blank"
              rel="noreferrer"
              style={{
                color:
                  design.accent
              }}
            >
              {
                fixedCredit.brand
              }
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
  const {
    business,
    services,
    gallery,
    forms,
    buttons,
    design
  } = project;

  // HERO SOLO SI EXISTE HERO

  const heroImage =
    design.heroBackground || "";

  const heroBgStyle =
    heroImage
      ? {
          backgroundImage: `
            linear-gradient(
              rgba(0,0,0,${overlay}),
              rgba(0,0,0,${overlay})
            ),
            url(${heroImage})
          `,

          backgroundSize: `
            ${
              design.heroBackgroundSize ??
              100
            }%
          `,

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

          backgroundRepeat:
            "no-repeat"
        }
      : {
          background:
            "transparent",

          backgroundImage:
            "none"
        };

  // FONDOS POR PAGINA

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
            url(${page.background})
          `,

          backgroundSize: `
            ${
              page.backgroundSize ||
              100
            }%
          `,

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
      design.cardBackground,

    border: `
      ${design.borderSize}px
      solid
      ${design.borderColor}
    `,

    borderRadius: `
      ${design.borderRadius}px
    `,

    boxShadow: `
      0 0
      ${design.shadowStrength}px
      rgba(0,0,0,.45)
    `,

    color:
      design.textColor
  };

  const btnStyle = {
    background:
      design.buttonBackground,

    color:
      design.buttonTextColor,

    borderRadius: `
      ${design.borderRadius}px
    `,

    border: `
      ${design.borderSize}px
      solid
      ${design.borderColor}
    `,

    cursor: "pointer"
  };

  if (!page) return null;

  // HOME

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
                  design.titleColor
              }}
            >
              {business.name}
            </h1>

            <p>
              {business.hero}
            </p>
          </div>
        </section>

        <section
          className="siteSection"
          style={pageBgStyle}
        >
          <h2
            style={{
              color:
                design.titleColor
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
                design.titleColor
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

  // SERVICES

  if (page.key === "services") {
    return (
      <section
        className="siteSection"
        style={pageBgStyle}
      >
        <h2
          style={{
            color:
              design.titleColor
          }}
        >
          {page.title}
        </h2>

        <div className="cards">
          {services.map(
            (
              service,
              i
            ) => (
              <div
                className="siteCard"
                key={i}
                style={
                  cardStyle
                }
              >
                <h3>
                  {
                    service.title
                  }
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

  // GALLERY

  if (page.key === "gallery") {
    return (
      <section
        className="siteSection"
        style={pageBgStyle}
      >
        <h2
          style={{
            color:
              design.titleColor
          }}
        >
          {page.title}
        </h2>

        <div className="galleryGrid">
          {gallery.length ? (
            gallery.map(
              (
                img,
                i
              ) => (
                <div
                  key={i}
                  style={
                    cardStyle
                  }
                >
                  <img
                    src={
                      img.src
                    }
                    alt={
                      img.title ||
                      "Galería"
                    }
                  />

                  {img.description && (
                    <p>
                      {
                        img.description
                      }
                    </p>
                  )}
                </div>
              )
            )
          ) : (
            <div
              className="siteCard"
              style={
                cardStyle
              }
            >
              <h3>
                Galería
                próximamente
              </h3>

              <p>
                Agrega fotos
                desde el panel.
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }

  // APPOINTMENTS

  if (
    page.key ===
    "appointments"
  ) {
    return (
      <section
        className="siteSection"
        style={pageBgStyle}
      >
        <h2
          style={{
            color:
              design.titleColor
          }}
        >
          {page.title}
        </h2>

        <form
          className="formBox"
          style={cardStyle}
        >
          <div className="formGrid">
            {forms.appointments.map(
              (
                field,
                i
              ) =>
                renderField(
                  field,
                  i
                )
            )}
          </div>

          <a
            className="siteBtn"
            style={btnStyle}
            href={`https://wa.me/${business.phone}`}
            target="_blank"
            rel="noreferrer"
          >
            Enviar por
            WhatsApp
          </a>
        </form>
      </section>
    );
  }

  // FINANCING

  if (
    page.key ===
    "financing"
  ) {
    return (
      <section
        className="siteSection"
        style={pageBgStyle}
      >
        <h2
          style={{
            color:
              design.titleColor
          }}
        >
          {page.title}
        </h2>

        <form
          className="formBox"
          style={cardStyle}
        >
          <div className="formGrid">
            {forms.financing.map(
              (
                field,
                i
              ) =>
                renderField(
                  field,
                  i
                )
            )}
          </div>

          <a
            className="siteBtn"
            style={btnStyle}
            href={`https://wa.me/${business.phone}`}
            target="_blank"
            rel="noreferrer"
          >
            Solicitar por
            WhatsApp
          </a>
        </form>
      </section>
    );
  }

  // CONTACT

  if (page.key === "contact") {
    return (
      <section
        className="siteSection"
        style={pageBgStyle}
      >
        <h2
          style={{
            color:
              design.titleColor
          }}
        >
          {page.title}
        </h2>

        <div className="contactButtons">
          <a
            className="contactBtn"
            style={btnStyle}
            href={`https://wa.me/${business.phone}`}
            target="_blank"
            rel="noreferrer"
          >
            🟢

            <span>
              {
                buttons.whatsapp
              }
            </span>
          </a>

          <a
            className="contactBtn"
            style={btnStyle}
            href={`tel:${business.phone}`}
          >
            📞

            <span>
              {
                buttons.call
              }
            </span>
          </a>

          <a
            className="contactBtn"
            style={btnStyle}
            href={`sms:${business.phone}`}
          >
            💬

            <span>
              {
                buttons.sms
              }
            </span>
          </a>

          <a
            className="contactBtn"
            style={btnStyle}
            href={`mailto:${business.email}`}
          >
            ✉️

            <span>
              {
                buttons.email
              }
            </span>
          </a>
        </div>

        <div
          className="storyCard"
          style={cardStyle}
        >
          <p>
            <strong>
              Dirección:
            </strong>{" "}
            {
              business.address
            }
          </p>

          <p>
            <strong>
              Pagos:
            </strong>{" "}
            {
              business.payments
            }
          </p>
        </div>
      </section>
    );
  }

  return null;
}