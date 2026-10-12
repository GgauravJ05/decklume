/* Shared page shell and components for the Decklume site. */
import { SITE, SLIDES } from "./content.mjs";

export const esc = (v = "") => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pad = (n) => String(n).padStart(2, "0");

/* --- Icons: one stroke family, 24px grid, 1.75 stroke ------------------ */
const ICONS = {
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  prev: '<path d="M15 5.5L8.5 12l6.5 6.5"/>',
  next: '<path d="M9 5.5l6.5 6.5L9 18.5"/>',
  expand: '<path d="M14 4.5h5.5V10M10 19.5H4.5V14M19.5 4.5l-6 6M4.5 19.5l6-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  loupe: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4"/>',
};
export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

/* --- Grease-pencil marks (authored SVG strokes) ------------------------ */
export const greaseCircle = (cls = "") =>
  `<svg class="grease ${cls}" viewBox="0 0 220 140" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M118 12C64 6 14 26 10 66c-4 40 44 66 104 64 62-2 100-28 96-64-4-34-46-56-102-54-30 1-58 8-74 20"/></svg>`;
export const greaseArrow = (cls = "") =>
  `<svg class="grease ${cls}" viewBox="0 0 160 70" aria-hidden="true"><path pathLength="1" d="M6 52C40 18 92 10 146 28M146 28l-20-16M146 28l-24 10"/></svg>`;

/* --- Frames and film --------------------------------------------------- */
export const frameSrc = (root, theme, n, size = 640) =>
  `${root}assets/frames/${theme}/${pad(n)}${size === 1280 ? "-1280" : ""}.webp`;

export function frame(root, theme, n, { eager = false, label = true, href = null, themeName = theme } = {}) {
  const alt = `${themeName} theme: ${SLIDES[n - 1]}`;
  const img = `<img src="${frameSrc(root, theme, n)}" alt="${esc(alt)}" width="640" height="360" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
  const body = href ? `<a href="${href}" class="frame-link">${img}</a>` : img;
  return `<figure class="frame">${body}${label ? `<figcaption class="edge"><span>${esc(themeName.toUpperCase())}</span><span>${pad(n)}A</span></figcaption>` : ""}</figure>`;
}

/* --- Copyable command ---------------------------------------------------- */
/* Break commands only at URL and handle boundaries, never inside a word. */
const breakable = (text) => esc(text).replace(/\//g, "/<wbr>").replace(/@/g, "<wbr>@");
export const command = (text, { big = false } = {}) =>
  `<div class="cmd${big ? " cmd-big" : ""}"><code>${breakable(text)}</code><button type="button" class="cmd-copy" data-copy="${esc(text)}" aria-label="Copy command">${icon("copy", "i-copy")}${icon("check", "i-done")}<span class="cmd-label">Copy</span></button></div>`;

/* --- Page shell ----------------------------------------------------------- */
const NAV = [
  ["themes/", "Themes"],
  ["for/students/", "Students"],
  ["for/teachers/", "Teachers"],
  ["for/researchers/", "Researchers"],
  ["for/founders/", "Founders"],
  ["docs/", "Docs"],
];

export function page({ root, path, title, description, jsonld = [], body, current = "", ogImage = "assets/og.png", noindex = false, bodyClass = "" }) {
  const url = SITE.base + path;
  const fullTitle = title.includes("Decklume") ? title : `${title} | Decklume`;
  const ld = jsonld.length ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": jsonld })}</script>` : "";
  const nav = NAV.map(([href, label]) => `<li><a href="${root}${href}"${current === href ? ' aria-current="page"' : ""}>${label}</a></li>`).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? "" : `<link rel="canonical" href="${url}">`}
<meta name="robots" content="${noindex ? "noindex" : "index, follow, max-image-preview:large"}">
<meta name="theme-color" content="#F1EEE7">
<meta name="author" content="${SITE.author}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Decklume">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.base}${ogImage}">
<meta property="og:image:width" content="1280">
<meta property="og:image:height" content="640">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE.base}${ogImage}">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&family=Martian+Mono:wght@400;600&family=Reenie+Beanie&display=swap">
<link rel="stylesheet" href="${root}assets/site.css">
${ld}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <a class="wordmark" href="${root}" aria-label="Decklume home">Decklume</a>
  <nav aria-label="Main">
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-list">${icon("menu", "i-open")}${icon("close", "i-close")}<span class="sr">Menu</span></button>
    <ul id="nav-list">${nav}<li><a class="nav-gh" href="${SITE.repo}">${icon("github")}<span>GitHub</span></a></li></ul>
  </nav>
</header>
<main id="main">
${body}
</main>
<footer class="colophon">
  <div class="rebate" aria-hidden="true"><span>DECKLUME 1920×1080</span><span>▸ 01A</span><span>10 THEMES</span><span>▸ 22 LAYOUTS</span><span>MIT</span><span>▸ 25A</span></div>
  <div class="colophon-grid">
    <div>
      <a class="wordmark" href="${root}">Decklume</a>
      <p>Designer-grade HTML presentations for Claude Code. Free and open source.</p>
    </div>
    <nav aria-label="Product"><p class="col-h">Product</p><ul><li><a href="${root}themes/">Themes</a></li><li><a href="${root}docs/">Docs</a></li><li><a href="${root}compare/frontend-slides/">Compare</a></li><li><a href="${root}demos/folio.html">Live demo</a></li></ul></nav>
    <nav aria-label="Use cases"><p class="col-h">Made for</p><ul><li><a href="${root}for/students/">Students</a></li><li><a href="${root}for/teachers/">Teachers</a></li><li><a href="${root}for/researchers/">Researchers</a></li><li><a href="${root}for/founders/">Founders</a></li></ul></nav>
    <nav aria-label="Project"><p class="col-h">Project</p><ul><li><a href="${SITE.repo}">GitHub</a></li><li><a href="${SITE.repo}/blob/main/CHANGELOG.md">Changelog</a></li><li><a href="${SITE.repo}/blob/main/CONTRIBUTING.md">Contribute</a></li><li><a href="${SITE.repo}/blob/main/LICENSE">MIT License</a></li></ul></nav>
  </div>
  <p class="credit">Inspired by <a href="https://github.com/zarazhangrui/frontend-slides">frontend-slides</a> by Zara Zhang. Typefaces from Google Fonts.</p>
</footer>
<script src="${root}assets/site.js" defer></script>
</body>
</html>
`;
}

/* --- Structured data helpers -------------------------------------------- */
export const breadcrumbs = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE.base + path })),
});

export const faqLd = (faq) => ({
  "@type": "FAQPage",
  mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

export const faqHtml = (faq, heading = "Questions") => `
<section class="faq band" aria-labelledby="faq-h">
  <h2 id="faq-h">${heading}</h2>
  <div class="faq-list">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
</section>`;

export const softwareLd = {
  "@type": "SoftwareApplication",
  "@id": SITE.base + "#software",
  name: "Decklume",
  applicationCategory: "DesignApplication",
  applicationSubCategory: "Presentation software",
  operatingSystem: "macOS, Windows, Linux",
  description: "An open-source Claude Code skill that turns a topic, notes or a PowerPoint file into a designed, animated HTML presentation with presenter view, PDF export and automated design QA.",
  url: SITE.base,
  downloadUrl: SITE.repo,
  softwareVersion: "0.1.0",
  license: "https://opensource.org/licenses/MIT",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: SITE.author, url: "https://github.com/GgauravJ05" },
  image: SITE.base + "assets/og.png",
};
