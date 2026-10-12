#!/usr/bin/env node
/* =====================================================================
   Build the GitHub Pages site assets:
   - site/demos/<theme>.html  the showcase lecture in every theme (live demos)
   - site/assets/themes/<theme>.jpg  a 3-slide strip per theme (README + site)
   - site/assets/hero.jpg      a mosaic of every theme's title slide
   - site/assets/og.png        1280×640 social preview card

   Usage: node scripts/build-site.mjs [--no-images]
   ===================================================================== */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build, listThemes } from "../skills/decklume/scripts/build.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = join(ROOT, "site");
const SRC = join(ROOT, "examples/sleep-and-memory/sleep-and-memory.deck.html");
const STRIP_SLIDES = [1, 7, 15]; // title, process, numbers
const ORDER = ["folio", "nocturne", "grid", "campus", "atlas", "aurora", "volt", "ma", "bloom", "chalk"];
const rank = (slug) => (ORDER.includes(slug) ? ORDER.indexOf(slug) : ORDER.length);
const themes = listThemes().sort((a, b) => rank(a.slug) - rank(b.slug));

mkdirSync(join(SITE, "demos"), { recursive: true });
mkdirSync(join(SITE, "assets/themes"), { recursive: true });

// 1. Live demos: one self-contained deck per theme (assets inlined).
for (const t of themes) {
  const r = build(SRC, { theme: t.slug, out: join(SITE, "demos", `${t.slug}.html`), inline: true });
  console.log(`✓ demo ${t.slug} (${(r.bytes / 1024).toFixed(0)} KB)`);
}
writeFileSync(join(SITE, "assets/themes.json"), JSON.stringify(themes.map(({ fonts, ...t }) => t), null, 2));

// Static theme gallery in index.html (crawlable, no JS needed).
const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const gallery = themes.map((t) => `      <article class="theme">
        <div>
          <h3><a href="demos/${t.slug}.html">${esc(t.name)}</a></h3>
          <p>${esc(t.tagline)}</p>
          <div class="tags">${t.best_for.slice(0, 3).map(esc).join(" · ")}</div>
        </div>
        <a href="demos/${t.slug}.html" aria-label="Open the ${esc(t.name)} live demo">
          <img src="assets/themes/${t.slug}.jpg" width="1854" height="374" loading="lazy" alt="Three slides in the ${esc(t.name)} theme: title, process and numbers">
        </a>
      </article>`).join("\n");
const indexPath = join(SITE, "index.html");
const index = readFileSync(indexPath, "utf8").replace(/<!-- THEMES:START -->[\s\S]*?<!-- THEMES:END -->/, `<!-- THEMES:START -->\n${gallery}\n<!-- THEMES:END -->`);
writeFileSync(indexPath, index);

// Sitemap: landing page + every live demo.
const BASE = "https://ggauravj05.github.io/decklume/";
const today = new Date().toISOString().slice(0, 10);
const urls = ["", ...themes.map((t) => `demos/${t.slug}.html`)];
writeFileSync(join(SITE, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${BASE}${u}</loc><lastmod>${today}</lastmod><priority>${u ? "0.6" : "1.0"}</priority></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(SITE, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${BASE}sitemap.xml\n`);
writeFileSync(join(SITE, ".nojekyll"), "");

if (process.argv.includes("--no-images")) process.exit(0);

// 2. Images.
const { launch, serve, open, waitForFonts, freeze } = await import("../skills/decklume/scripts/lib/browser.mjs");
const browser = await launch();
const server = await serve(SITE);
const shots = {};
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const t of themes) {
    await open(page, server.url(`demos/${t.slug}.html`));
    await waitForFonts(page);
    await freeze(page);
    shots[t.slug] = [];
    for (const n of STRIP_SLIDES) {
      await page.evaluate((i) => window.decklume.go(i, { steps: Infinity, instant: true }), n - 1);
      await page.waitForTimeout(80);
      shots[t.slug].push((await page.screenshot({ type: "jpeg", quality: 88 })).toString("base64"));
    }
    console.log(`✓ captured ${t.slug}`);
  }

  const img = (b64) => `<img src="data:image/jpeg;base64,${b64}">`;
  const render = async (html, w, h, path, type = "jpeg") => {
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    await p.setContent(html, { waitUntil: "load" });
    await p.screenshot({ path, type, ...(type === "jpeg" ? { quality: 84 } : {}) });
    await p.close();
  };

  // Strips: three slides side by side.
  for (const t of themes) {
    await render(
      `<style>body{margin:0;background:#0f0f10;display:flex;gap:18px;padding:18px}img{width:600px;height:337.5px;border-radius:8px;display:block}</style>${shots[t.slug].map(img).join("")}`,
      1854, 374, join(SITE, `assets/themes/${t.slug}.jpg`)
    );
  }

  // Hero mosaic: every theme's title slide, 5 × 2.
  await render(
    `<style>body{margin:0;background:#0f0f10;display:grid;grid-template-columns:repeat(5,1fr);gap:16px;padding:16px}img{width:100%;aspect-ratio:16/9;border-radius:8px;display:block}</style>${themes.map((t) => img(shots[t.slug][0])).join("")}`,
    1920, 466, join(SITE, "assets/hero.jpg")
  );

  // Social preview card (GitHub recommends 1280×640).
  const tiles = themes.slice(0, 6).map((t, i) => `<img style="--r:${[-6, 4, -3, 5, -4, 3][i]}deg" src="data:image/jpeg;base64,${shots[t.slug][i % 3]}">`).join("");
  await render(
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400&family=Instrument+Sans:wght@500;600&display=swap">
    <style>
      body{margin:0;width:1280px;height:640px;overflow:hidden;background:#0f0f10;color:#f3eee4;font-family:"Instrument Sans",sans-serif;position:relative}
      .copy{position:absolute;left:72px;top:96px;width:560px}
      h1{font:400 112px/0.95 Fraunces,serif;letter-spacing:-0.03em;margin:0}
      h1 em{color:#e9b44c}
      p{font-size:30px;line-height:1.35;color:#c9c3b6;margin:28px 0 0}
      .tag{margin-top:36px;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:#e9b44c}
      .wall{position:absolute;right:-90px;top:-40px;width:720px;display:grid;grid-template-columns:1fr 1fr;gap:22px;transform:rotate(-8deg)}
      .wall img{width:100%;border-radius:10px;box-shadow:0 20px 40px rgba(0,0,0,.5)}
    </style>
    <div class="copy"><h1>Deck<em>lume</em></h1><p>Beautiful, animated presentations from any topic — a Claude Code skill.</p><div class="tag">10 themes · Magic Move · Design QA</div></div>
    <div class="wall">${tiles}</div>`,
    1280, 640, join(SITE, "assets/og.png"), "png"
  );
  console.log("✓ strips, hero.jpg, og.png");
} finally {
  await server.close();
  await browser.close();
}
