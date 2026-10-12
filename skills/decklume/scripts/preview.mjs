#!/usr/bin/env node
/* =====================================================================
   DECKLUME · STYLE PREVIEW
   Renders ONE sample deck (title + 1–2 real content slides) in several
   themes and lays them side by side on a single comparison page, so a
   person can choose a look by seeing it with their own content.

   Usage:
     node preview.mjs sample.deck.html --themes folio,nocturne,./my-theme
     node preview.mjs sample.deck.html --themes folio,grid,campus -o out/ --png

   Writes <out>/index.html (+ index.png with --png) and one deck per theme.
   Default <out>: .decklume/preview/ next to the sample.
   ===================================================================== */
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, resolve, join, relative } from "node:path";
import { build, listThemes } from "./build.mjs";

const args = process.argv.slice(2);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const sample = args.find((a, i) => !a.startsWith("-") && !["--themes", "-o", "--out"].includes(args[i - 1]));
const themes = (opt("--themes") || "").split(",").map((s) => s.trim()).filter(Boolean);
if (!sample || themes.length < 1) {
  console.error("usage: node preview.mjs <sample.deck.html> --themes a,b,c [-o dir] [--png]");
  process.exit(2);
}

const src = resolve(sample);
const out = resolve(opt("-o") || opt("--out") || join(dirname(src), ".decklume", "preview"));
if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });

const catalog = Object.fromEntries(listThemes().map((t) => [t.slug, t]));
const letters = "ABCDEFGH";
const columns = [];
let slideCount = 0;

themes.forEach((theme, i) => {
  const file = `${letters[i].toLowerCase()}.html`;
  // Inline assets: preview decks live in another folder than the sample.
  const r = build(src, { theme, out: join(out, file), inline: true });
  slideCount = Math.max(slideCount, r.slides);
  r.warnings.forEach((w) => console.warn(`  ⚠ [${theme}] ${w}`));
  const meta = catalog[theme] || { name: r.theme, tagline: "Custom design for this deck" };
  columns.push({ letter: letters[i], file, name: meta.name, tagline: meta.tagline });
});

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const frames = (c) =>
  Array.from({ length: slideCount }, (_, n) =>
    `<div class="frame"><iframe src="${c.file}?embed#/${n + 1}" title="${esc(c.name)} slide ${n + 1}" loading="eager"></iframe></div>`
  ).join("");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Choose a style · Decklume</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #101012; color: #ededed; font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, sans-serif; }
  header.top { padding: 28px 32px 8px; }
  header.top h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
  header.top p { margin: 4px 0 0; color: #9a9a9a; }
  .cols { display: grid; grid-template-columns: repeat(${columns.length}, minmax(0, 1fr)); gap: 24px; padding: 24px 32px 40px; }
  .col { display: grid; gap: 14px; align-content: start; }
  .col h2 { margin: 0; display: flex; gap: 12px; align-items: baseline; font-size: 18px; font-weight: 600; }
  .col h2 b { display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: #ededed; color: #101012; font-size: 15px; }
  .col p { margin: -8px 0 0; color: #9a9a9a; min-height: 3em; }
  .frame { position: relative; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; background: #000; box-shadow: 0 0 0 1px #262626; }
  .frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; pointer-events: none; }
  .col a { color: #ededed; font-size: 14px; }
  @media (max-width: 900px) { .cols { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<header class="top">
  <h1>Which direction feels right?</h1>
  <p>The same slides in ${columns.length} styles. Pick one, or mix: “A’s type with C’s colours”.</p>
</header>
<main class="cols">
${columns.map((c) => `  <section class="col">
    <h2><b>${c.letter}</b>${esc(c.name)}</h2>
    <p>${esc(c.tagline)}</p>
    ${frames(c)}
    <a href="${c.file}" target="_blank" rel="noopener">Open ${esc(c.name)} full screen →</a>
  </section>`).join("\n")}
</main>
</body>
</html>
`;
writeFileSync(join(out, "index.html"), html);
console.log(`✓ ${relative(process.cwd(), join(out, "index.html"))} · ${columns.length} styles × ${slideCount} slides`);

if (args.includes("--png")) {
  const { launch, serve, open, waitForFonts } = await import("./lib/browser.mjs");
  const browser = await launch();
  const server = await serve(out);
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await open(page, server.url("index.html"));
    for (const f of page.frames()) await waitForFonts(f).catch(() => {});
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(out, "index.png"), fullPage: true });
    console.log(`✓ ${relative(process.cwd(), join(out, "index.png"))}`);
  } finally {
    await server.close();
    await browser.close();
  }
}
