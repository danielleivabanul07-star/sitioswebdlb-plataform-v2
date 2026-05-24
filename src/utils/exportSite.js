import JSZip from "jszip";
import { saveAs } from "file-saver";
import { fixedCredit } from "./defaultProject.js";
import { renderField } from "./renderField.jsx";

function slug(value) {
  return String(value || "sitio-web")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "sitio-web";
}

function cleanPhone(value) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function visiblePages(project) {
  return project.pages.filter((page) => page.show);
}

function nav(project) {
  const { business } = project;
  return `
<header>
  <a class="logo" href="index.html">${business.name}</a>
  <nav>
    ${visiblePages(project).map((page) => `<a href="${page.file}">${page.label}</a>`).join("")}
  </nav>
</header>`;
}

function footer(project) {
  return `
<footer>
  <p>© 2026 ${project.business.name}. Todos los derechos reservados.</p>
  <div class="developerCredit">
    ${fixedCredit.text}
    <a href="${fixedCredit.url}" target="_blank">${fixedCredit.brand}</a>
  </div>
</footer>`;
}

function css(project) {
  const { design } = project;
  return `
:root{--accent:${design.accent};--radius:${design.radius}px}
*{box-sizing:border-box;margin:0;padding:0;font-family:${design.font}}
html{scroll-behavior:smooth}
body{background:#080808;color:#fff}
header{position:sticky;top:0;z-index:999;background:rgba(0,0,0,.88);backdrop-filter:blur(12px);border-bottom:2px solid var(--accent);padding:18px 7%;display:flex;justify-content:space-between;align-items:center}
.logo{color:var(--accent);font-size:26px;font-weight:900;text-decoration:none}
nav a{color:#fff;text-decoration:none;margin-left:18px;font-weight:800}
nav a:hover{color:var(--accent)}
section{padding:75px 7%;background:#101010;background-size:cover;background-position:center}
.hero{min-height:92vh;display:flex;align-items:center;justify-content:center;text-align:center;background:#111}
.hero.hasBg,.sectionBg{background-image:linear-gradient(rgba(0,0,0,.72),rgba(0,0,0,.82)),url("../imagenes/fondo-web.jpg")}
.heroContent{max-width:850px;margin:auto}
.hero h1{font-size:56px;color:var(--accent);margin-bottom:18px}
.hero p{font-size:21px;color:#eee;margin-bottom:25px}
.btn{background:var(--accent);color:#000;padding:14px 23px;border-radius:12px;text-decoration:none;font-weight:900;display:inline-flex;gap:8px;align-items:center;justify-content:center;margin:7px}
h1.pageTitle,h2{text-align:center;color:var(--accent);font-size:39px;margin-bottom:30px}
.storyCard,.formBox,.contactInfo{max-width:950px;margin:auto;background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.05));border:1px solid rgba(255,255,255,.14);border-left:6px solid var(--accent);border-radius:var(--radius);padding:32px;box-shadow:0 18px 45px rgba(0,0,0,.35);font-size:18px;line-height:1.7}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.card{background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.05));border:1px solid rgba(255,255,255,.14);border-left:5px solid var(--accent);border-radius:var(--radius);padding:27px;box-shadow:0 16px 40px rgba(0,0,0,.32)}
.card h3{font-size:22px;margin-bottom:10px}
.card p{color:#e8e8e8;line-height:1.45}
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}
.gallery img{width:100%;height:230px;object-fit:cover;border-radius:16px}
.formGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.formFieldFull{grid-column:1/-1}
input,textarea,select{width:100%;padding:14px;border-radius:12px;background:rgba(0,0,0,.5);color:white;border:1px solid rgba(255,255,255,.18);margin-bottom:12px}
textarea{min-height:120px;resize:vertical}
.check{display:block;margin:8px 0}
.contactButtons{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:1000px;margin:0 auto 28px}
.contactBtn{background:linear-gradient(145deg,var(--accent),#fff0a0);color:#000;text-decoration:none;border-radius:20px;padding:22px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;font-weight:900;text-align:center}
footer{background:#060606;border-top:2px solid var(--accent);text-align:center;padding:30px;color:#ccc}
.developerCredit{margin-top:14px;font-size:14px;color:#aaa}
.developerCredit a{color:var(--accent);font-weight:900;text-decoration:none}
@media(max-width:850px){
  header{flex-direction:column;gap:14px}
  nav a{display:inline-block;margin:7px}
  .hero h1{font-size:38px}
  .cards,.gallery,.contactButtons,.formGrid{grid-template-columns:1fr}
  .formFieldFull{grid-column:auto}
}`;
}

function layout(project, page, body) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.label} | ${project.business.name}</title>
  <meta name="description" content="${project.business.name} - ${project.business.hero}">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
${nav(project)}
${body}
${footer(project)}
<script src="js/script.js"></script>
</body>
</html>`;
}

function bodyFor(project, page) {
  const { business, buttons, design } = project;
  const phone = cleanPhone(business.phone);
  const bgClass = design.backgroundMode === "all" ? "sectionBg" : "";

  if (page.key === "home") {
    const heroBg = design.backgroundMode !== "none" ? "hasBg" : "";
    return `
<section class="hero ${heroBg}">
  <div class="heroContent">
    <h1>${business.name}</h1>
    <p>${business.hero}</p>
    <a class="btn" href="https://wa.me/${phone}" target="_blank">💬 ${buttons.whatsapp}</a>
    <a class="btn" href="tel:${phone}">📞 ${buttons.call}</a>
    <a class="btn" href="sms:${phone}">💬 ${buttons.sms}</a>
  </div>
</section>
<section class="${bgClass}">
  <h2>Sobre Nosotros</h2>
  <div class="storyCard"><p>${business.about}</p></div>
</section>
<section class="${bgClass}">
  <h2>Por qué elegirnos</h2>
  <div class="storyCard"><p>${business.why}</p></div>
</section>`;
  }

  if (page.key === "services") {
    return `
<section class="${bgClass}">
  <h1 class="pageTitle">${page.title}</h1>
  <div class="cards">
    ${project.services.map((service) => `
    <div class="card">
      <h3>${service.title}</h3>
      <p>${service.description}</p>
    </div>`).join("")}
  </div>
</section>`;
  }

  if (page.key === "gallery") {
    return `
<section class="${bgClass}">
  <h1 class="pageTitle">${page.title}</h1>
  <div class="gallery">
    ${project.gallery.length ? project.gallery.map((image, i) => `
    <div>
      <img src="imagenes/galeria${i + 1}.jpg" alt="${image.title}">
      ${image.description ? `<p>${image.description}</p>` : ""}
    </div>`).join("") : `<div class="card"><h3>Galería próximamente</h3><p>Agrega fotos en la carpeta imagenes.</p></div>`}
  </div>
</section>`;
  }

  if (page.key === "appointments") {
    return `
<section class="${bgClass}">
  <h1 class="pageTitle">${page.title}</h1>
  <form class="formBox">
    <div class="formGrid">
      ${project.forms.appointments.map((field, i) => renderField(field, i, true)).join("")}
    </div>
    <a class="btn" href="https://wa.me/${phone}" target="_blank">Enviar por WhatsApp</a>
  </form>
</section>`;
  }

  if (page.key === "financing") {
    return `
<section class="${bgClass}">
  <h1 class="pageTitle">${page.title}</h1>
  <form class="formBox">
    <div class="formGrid">
      ${project.forms.financing.map((field, i) => renderField(field, i, true)).join("")}
    </div>
    <a class="btn" href="https://wa.me/${phone}" target="_blank">Solicitar por WhatsApp</a>
  </form>
</section>`;
  }

  if (page.key === "contact") {
    return `
<section class="${bgClass}">
  <h1 class="pageTitle">${page.title}</h1>
  <div class="contactButtons">
    <a class="contactBtn" href="https://wa.me/${phone}" target="_blank">🟢<span>${buttons.whatsapp}</span></a>
    <a class="contactBtn" href="tel:${phone}">📞<span>${buttons.call}</span></a>
    <a class="contactBtn" href="sms:${phone}">💬<span>${buttons.sms}</span></a>
    <a class="contactBtn" href="mailto:${business.email}">✉️<span>${buttons.email}</span></a>
  </div>
  <div class="contactInfo">
    <p><strong>Teléfono:</strong> ${phone}</p>
    <p><strong>Email:</strong> ${business.email}</p>
    <p><strong>Dirección:</strong> ${business.address}</p>
    <p><strong>Pagos:</strong> ${business.payments}</p>
    <a class="btn" href="${business.google}" target="_blank">Google Business</a>
    <a class="btn" href="${business.facebook}" target="_blank">Facebook</a>
    <a class="btn" href="${business.instagram}" target="_blank">Instagram</a>
    <a class="btn" href="${business.tiktok}" target="_blank">TikTok</a>
  </div>
</section>`;
  }

  return "";
}

export async function exportProjectZip(project) {
  const zip = new JSZip();
  const rootName = slug(project.business.name);
  const folder = zip.folder(rootName);

  const pages = visiblePages(project);
  pages.forEach((page) => {
    folder.file(page.file, layout(project, page, bodyFor(project, page)));
  });

  folder.folder("css").file("style.css", css(project));
  folder.folder("js").file("script.js", `console.log("Sitio generado por SitiosWebDLB Builder Pro");`);

  const imgFolder = folder.folder("imagenes");

  if (project.design.heroBackground) {
    const base64 = project.design.heroBackground.split(",")[1];
    imgFolder.file("fondo-web.jpg", base64, { base64: true });
  }

  project.gallery.forEach((image, i) => {
    const base64 = image.src.split(",")[1];
    imgFolder.file(`galeria${i + 1}.jpg`, base64, { base64: true });
  });

  imgFolder.file("LEEME-IMAGENES.txt", `Las imágenes usadas por el sitio se guardan aquí.\n\nfondo-web.jpg\ngaleria1.jpg\ngaleria2.jpg\n...`);

  folder.file("LEEME.txt", `Proyecto generado por SitiosWebDLB Builder Pro.\n\nAbre index.html con Live Server o súbelo a GitHub Pages.\n\nCrédito fijo incluido: Desarrollado por SitiosWebDLB.`);

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${rootName}-sitioswebdlb.zip`);
}
