import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function ImportedSite() {
  const { clientId } = useParams();

  const [html, setHtml] = useState("");
  const [currentPage, setCurrentPage] = useState("index.html");

  function buildGallery(gallery = []) {
    if (!Array.isArray(gallery) || gallery.length === 0) {
      return "";
    }

    return `
      <section class="dynamic-gallery">
        <div class="dynamic-gallery-grid">
          ${gallery
            .map((item) => {
              const src = item.src || item.url || "";
              const title = item.title || "";
              const description = item.description || "";

              if (!src) return "";

              return `
                <div class="dynamic-gallery-item">
                  <img src="${src}" alt="${title}">
                  ${
                    title || description
                      ? `
                        <div class="dynamic-gallery-caption">
                          ${title ? `<h3>${title}</h3>` : ""}
                          ${description ? `<p>${description}</p>` : ""}
                        </div>
                      `
                      : ""
                  }
                </div>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }

  function injectDynamicStyles(text) {
    const dynamicStyles = `
      <style>
        .dynamic-gallery {
          width: 100%;
          padding: 40px 7%;
          box-sizing: border-box;
        }

        .dynamic-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .dynamic-gallery-item {
          background: rgba(0,0,0,.55);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.15);
        }

        .dynamic-gallery-item img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }

        .dynamic-gallery-caption {
          padding: 14px;
          color: white;
        }

        .dynamic-gallery-caption h3 {
          margin: 0 0 8px;
        }

        .dynamic-gallery-caption p {
          margin: 0;
        }
      </style>
    `;

    return text.replace("</head>", `${dynamicStyles}</head>`);
  }

  function injectNavigationScript(text) {
    const script = `
      <script>
        document.addEventListener("click", function(e) {
          const link = e.target.closest("a");

          if (!link) return;

          const href = link.getAttribute("href");

          if (!href) return;

          if (
            href.startsWith("http") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            href.startsWith("https://wa.me") ||
            href.startsWith("#")
          ) {
            return;
          }

          if (href.endsWith(".html")) {
            e.preventDefault();

            window.parent.postMessage({
              type: "CHANGE_IMPORTED_PAGE",
              page: href
            }, "*");
          }
        });
      </script>
    `;

    return text.replace("</body>", `${script}</body>`);
  }

  useEffect(() => {
    async function loadSite() {
      try {
        const projectRes = await api.get(`/projects/${clientId}`);

        const project = projectRes.data || {};
        const business = project.business || {};
        const gallery = project.gallery || [];

        const baseUrl =
          `https://xkehxgpzolkhjmjjscxr.supabase.co/storage/v1/object/public/imported-sites/${clientId}/`;

        const response = await fetch(`${baseUrl}${currentPage}`);

        let text = await response.text();

        text = text.replace("<head>", `<head><base href="${baseUrl}">`);

        text = injectDynamicStyles(text);
        text = injectNavigationScript(text);

        text = text.replaceAll("{{business.name}}", business.name || "");
        text = text.replaceAll("{{business.phone}}", business.phone || "");
        text = text.replaceAll("{{business.email}}", business.email || "");
        text = text.replaceAll("{{business.address}}", business.address || "");
        text = text.replaceAll("{{business.whatsapp}}", business.whatsapp || "");
        text = text.replaceAll("{{business.facebook}}", business.facebook || "");
        text = text.replaceAll("{{business.instagram}}", business.instagram || "");
        text = text.replaceAll("{{business.tiktok}}", business.tiktok || "");
        text = text.replaceAll("{{business.hours}}", business.hours || "");
        text = text.replaceAll("{{business.payments}}", business.payments || "");
        text = text.replaceAll("{{business.google}}", business.google || "");
        text = text.replaceAll("{{gallery}}", buildGallery(gallery));

        setHtml(text);
      } catch (error) {
        console.error(error);
      }
    }

    loadSite();
  }, [clientId, currentPage]);

  useEffect(() => {
    function handleMessage(event) {
      if (event.data?.type === "CHANGE_IMPORTED_PAGE") {
        setCurrentPage(event.data.page);
      }
    }

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#000"
      }}
    >
      <iframe
        title="Imported Site"
        srcDoc={html}
        style={{
          width: "100%",
          height: "100%",
          border: "none"
        }}
      />
    </div>
  );
}