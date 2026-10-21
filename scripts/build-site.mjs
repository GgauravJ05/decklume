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
const ORDER = ["folio", "nocturne", "grid", "campus", "atlas", "aurora", "volt", "ma", "bloom", "chalk"];
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

  // Social card (1280×640), in the site's contact-sheet world.
  const og = await browser.newPage({ viewport: { width: 1280, height: 640 } });
  const ogFrames = ["nocturne", "grid", "folio", "campus", "aurora", "chalk"].map((s, i) => `<img${i === 2 ? ' class="keep"' : ""} src="data:image/jpeg;base64,${strips[s][i % 3]}">`).join("");
  await og.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;800;900&family=Reenie+Beanie&display=swap">
  <style>body{margin:0;width:1280px;height:640px;overflow:hidden;background:#f1eee7;font-family:"Schibsted Grotesk";color:#0d0d0d;position:relative}
  .w{position:absolute;left:64px;top:48px;font:900 30px/1 "Schibsted Grotesk";letter-spacing:-.04em}
  h1{position:absolute;left:60px;top:110px;margin:0;font:800 96px/.9 "Schibsted Grotesk";letter-spacing:-.045em}
  p{position:absolute;left:64px;top:318px;margin:0;font:500 26px/1.35 "Schibsted Grotesk";color:#3d3a35;width:620px}
  .sheet{position:absolute;left:0;right:0;bottom:0;height:210px;background:#0d0d0d;display:grid;grid-template-columns:repeat(6,1fr);gap:12px;padding:30px 24px;box-sizing:border-box}
  .sheet:before,.sheet:after{content:"";position:absolute;left:0;right:0;height:12px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='12'%3E%3Crect x='7' y='2' width='14' height='8' rx='2' fill='%233a3936'/%3E%3C/svg%3E") repeat-x}
  .sheet:before{top:8px}.sheet:after{bottom:8px}
  img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:2px;align-self:center}
  .ring{position:absolute;left:428px;top:430px;width:250px;height:170px;border:6px solid #e4362b;border-radius:50%;transform:rotate(-5deg);box-sizing:border-box}
  .note{position:absolute;left:700px;top:372px;font:56px "Reenie Beanie";color:#b3261c;transform:rotate(-4deg)}</style>
  <div class="w">Decklume</div><h1>Pick the frame.<br>Ship the deck.</h1>
  <p>Beautiful, animated presentations from any topic: a free Claude Code skill.</p>
  <div class="note">keep this one</div><div class="sheet">${ogFrames}</div><div class="ring"></div>`, { waitUntil: "networkidle" });
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: join(OUT, "assets/og.png") });
  console.log("✓ og.png");
  console.log("✓ strips and hero mosaic");
} finally {
  rmSync(tmp, { recursive: true, force: true });
  await server.close();
  await browser.close();
}
