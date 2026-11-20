#!/usr/bin/env node
/* =====================================================================
   Build the Decklume website (GitHub Pages, site/):
   - demos/<theme>.html            the showcase lecture in every theme
   - all pages (static HTML)       home, themes, audiences, docs, compare, 404
   - sitemap.xml, robots.txt
   With --images (needs Playwright + cwebp):
   - assets/frames/<theme>/NN.webp  every slide of every theme (640 px, 1280 for slide 1)
   - assets/themes/<theme>.jpg      3-slide strips (README)
   - assets/hero.jpg                README mosaic

   Usage: node scripts/build-site.mjs [--images]
   ===================================================================== */
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { build, listThemes } from "../skills/decklume/scripts/build.mjs";
import { SITE, AUDIENCES, EXAMPLES } from "./site/content.mjs";
import { home } from "./site/home.mjs";
import { themesIndex, themePage, audiencePage, docsPage, comparePage, notFound, examplesPage } from "./site/pages.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "site");
const SRC = join(ROOT, "examples/sleep-and-memory/sleep-and-memory.deck.html");
const ORDER = ["folio", "nocturne", "grid", "campus", "atlas", "aurora", "volt", "ma", "bloom", "chalk", "blueprint", "broadsheet", "clinic"];
const rank = (slug) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);
const themes = listThemes().sort((a, b) => rank(a.slug) - rank(b.slug));

const write = (rel, html) => {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

// 1. Live demo decks (assets inlined so each is one file).
for (const t of themes) build(SRC, { theme: t.slug, out: join(OUT, "demos", `${t.slug}.html`), inline: true });
console.log(`✓ ${themes.length} demo decks`);
for (const ex of EXAMPLES) build(join(ROOT, "examples", ex.slug, `${ex.slug}.deck.html`), { out: join(OUT, "examples", `${ex.slug}.html`), inline: true });
console.log(`✓ ${EXAMPLES.length} example decks`);

// 2. Pages.
const pages = [
  ["index.html", home(themes), ""],
  ["themes/index.html", themesIndex(themes), "themes/"],
  ...themes.map((t) => [`themes/${t.slug}/index.html`, themePage(t, themes), `themes/${t.slug}/`]),
  ...Object.values(AUDIENCES).map((a) => [`for/${a.slug}/index.html`, audiencePage(a, themes), `for/${a.slug}/`]),
  ["examples/index.html", examplesPage(themes), "examples/"],
  ["docs/index.html", docsPage(), "docs/"],
  ["compare/frontend-slides/index.html", comparePage(), "compare/frontend-slides/"],
  ["404.html", notFound(), null],
];
for (const [rel, html] of pages) write(rel, html);
console.log(`✓ ${pages.length} pages`);

// 3. Sitemap + robots.
const today = new Date().toISOString().slice(0, 10);
const urls = pages.filter(([, , p]) => p !== null).map(([, , p]) => p);
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE.base}${u}</loc><lastmod>${today}</lastmod><priority>${u === "" ? "1.0" : u.split("/").length > 2 ? "0.7" : "0.8"}</priority></url>`).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE.base}sitemap.xml\n`);
write(".nojekyll", "");
console.log("✓ sitemap.xml, robots.txt");

if (!process.argv.includes("--images")) process.exit(0);

// 4. Images: every slide of every theme, captured from the live demos.
const { launch, serve, open, waitForFonts, freeze } = await import("../skills/decklume/scripts/lib/browser.mjs");
const browser = await launch();
const server = await serve(OUT);
const tmp = join(ROOT, ".decklume-frames");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const webp = (png, out, width) => {
  execFileSync("cwebp", ["-quiet", "-q", width > 700 ? "82" : "76", "-resize", String(width), "0", png, "-o", out]);
};
const strips = {};
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const t of themes) {
    await open(page, server.url(`demos/${t.slug}.html`));
    await waitForFonts(page);
    await freeze(page);
    const n = await page.evaluate(() => window.decklume.slides.length);
    mkdirSync(join(OUT, "assets/frames", t.slug), { recursive: true });
    strips[t.slug] = [];
    for (let i = 0; i < n; i++) {
      await page.evaluate((i) => window.decklume.go(i, { steps: Infinity, instant: true }), i);
      await page.waitForTimeout(60);
      const png = join(tmp, `${t.slug}-${i}.png`);
      await page.screenshot({ path: png });
      const nn = String(i + 1).padStart(2, "0");
      webp(png, join(OUT, "assets/frames", t.slug, `${nn}.webp`), 640);
      if (i === 0) webp(png, join(OUT, "assets/frames", t.slug, `${nn}-1280.webp`), 1280);
      if ([0, 6, 14].includes(i)) strips[t.slug].push((await page.screenshot({ type: "jpeg", quality: 88 })).toString("base64"));
    }
    console.log(`✓ frames ${t.slug} (${n})`);
  }

  // Example deck frames for the gallery and audience pages.
  for (const ex of EXAMPLES) {
    await open(page, server.url(`examples/${ex.slug}.html`));
    await waitForFonts(page);
    await freeze(page);
    mkdirSync(join(OUT, "assets/examples", ex.slug), { recursive: true });
    for (const n of ex.frames) {
      await page.evaluate((i) => window.decklume.go(i, { steps: Infinity, instant: true }), n - 1);
      await page.waitForTimeout(60);
      const png = join(tmp, `${ex.slug}-${n}.png`);
      await page.screenshot({ path: png });
      const nn = String(n).padStart(2, "0");
      webp(png, join(OUT, "assets/examples", ex.slug, `${nn}.webp`), 640);
    }
    console.log(`✓ example frames ${ex.slug}`);
  }

  const img = (b64) => `<img src="data:image/jpeg;base64,${b64}">`;
  const render = async (html, w, h, path) => {
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    await p.setContent(html, { waitUntil: "load" });
    await p.screenshot({ path, type: "jpeg", quality: 84 });
    await p.close();
  };
  mkdirSync(join(OUT, "assets/themes"), { recursive: true });
  for (const t of themes) {
    await render(`<style>body{margin:0;background:#0f0f10;display:flex;gap:18px;padding:18px}img{width:600px;height:337.5px;border-radius:8px;display:block}</style>${strips[t.slug].map(img).join("")}`, 1854, 374, join(OUT, `assets/themes/${t.slug}.jpg`));
  }
  await render(`<style>body{margin:0;background:#0f0f10;display:grid;grid-template-columns:repeat(5,1fr);gap:16px;padding:16px}img{width:100%;aspect-ratio:16/9;border-radius:8px;display:block}</style>${themes.map((t) => img(strips[t.slug][0])).join("")}`, 1920, 466, join(OUT, "assets/hero.jpg"));

  // Social card (1280×640), in the site's palette: light paper, Poppins and Lora,
  // three real slides fanned on the right.
  const og = await browser.newPage({ viewport: { width: 1280, height: 640 } });
  const ogFrames = [["nocturne", 0], ["folio", 0], ["campus", 1]].map(([s, i], k) => `<img class="f${k}" src="data:image/jpeg;base64,${strips[s][i]}">`).join("");
  await og.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Lora:wght@400&display=swap">
  <style>body{margin:0;width:1280px;height:640px;overflow:hidden;background:#faf9f5;color:#141413;position:relative;font-family:Poppins}
  .w{position:absolute;left:72px;top:60px;display:flex;align-items:center;gap:14px;font:700 30px/1 Poppins;letter-spacing:-.02em}
  h1{position:absolute;left:68px;top:150px;margin:0;font:700 76px/1.04 Poppins;letter-spacing:-.03em}
  p{position:absolute;left:72px;top:356px;margin:0;font:400 27px/1.45 Lora;color:#47443e;width:520px}
  .dots{position:absolute;left:72px;bottom:68px;display:flex;gap:10px}.dots i{width:14px;height:14px;border-radius:50%}
  img{position:absolute;width:470px;aspect-ratio:16/9;object-fit:cover;border-radius:12px;box-shadow:0 0 0 1px rgba(20,20,19,.1),0 30px 60px -24px rgba(20,20,19,.45)}
  .f0{left:770px;top:52px;transform:rotate(5deg)}.f1{left:730px;top:214px;transform:rotate(-3deg)}.f2{left:790px;top:378px;transform:rotate(4deg)}</style>
  <div class="w"><svg viewBox="0 0 32 32" width="40" height="40"><rect width="32" height="32" rx="8" fill="#141413"/><rect x="5.5" y="9" width="21" height="14" rx="2.2" fill="#faf9f5"/><rect x="8.5" y="12.5" width="9" height="2.2" rx="1.1" fill="#141413"/><rect x="8.5" y="16.3" width="6" height="1.6" rx=".8" fill="#b0aea5"/><circle cx="22.6" cy="9.4" r="4.2" fill="#d97757"/></svg>Decklume</div>
  <h1>One prompt.<br>A designed deck.</h1>
  <p>Animated HTML presentations from any topic, in a free Claude Code skill.</p>
  <div class="dots"><i style="background:#d97757"></i><i style="background:#6a9bcc"></i><i style="background:#788c5d"></i></div>
  ${ogFrames}`, { waitUntil: "networkidle" });
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: join(OUT, "assets/og.png") });
  console.log("✓ og.png");
  console.log("✓ strips and hero mosaic");
} finally {
  rmSync(tmp, { recursive: true, force: true });
  await server.close();
  await browser.close();
}
