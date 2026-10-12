#!/usr/bin/env node
/* =====================================================================
   DECKLUME · EXPORT
   Vector PDF (selectable, searchable text; one 1920×1080 page per
   slide, every build step shown) or per-slide PNGs.

   Usage:
     node export.mjs deck.html                → deck.pdf
     node export.mjs deck.html -o handout.pdf
     node export.mjs deck.html --png [-o dir] [--scale 2]
     node export.mjs deck.html --raster       → image PDF (pixel-exact
                                               fallback for exotic CSS)
   ===================================================================== */
import { mkdirSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, basename, resolve, join, relative } from "node:path";
import { launch, serve, freeze, waitForFonts, open } from "./lib/browser.mjs";

const args = process.argv.slice(2);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const input = args.find((a, i) => !a.startsWith("-") && !["-o", "--out", "--scale"].includes(args[i - 1]));
if (!input) {
  console.error("usage: node export.mjs <deck.html> [-o out] [--png] [--scale 2] [--raster]");
  process.exit(2);
}

const deck = resolve(input);
const png = args.includes("--png");
const raster = args.includes("--raster");
const scale = Number(opt("--scale") || (png ? 1 : 1));
const out = resolve(opt("-o") || opt("--out") || (png ? deck.replace(/\.html?$/, "") + "-slides" : deck.replace(/\.html?$/, ".pdf")));

const browser = await launch();
const server = await serve(dirname(deck));
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
  await open(page, server.url(basename(deck)));
  await waitForFonts(page);
  await freeze(page);
  const count = await page.evaluate(() => document.querySelectorAll(".deck-stage > .slide").length);

  if (png || raster) {
    if (png) mkdirSync(out, { recursive: true });
    const shots = [];
    for (let i = 0; i < count; i++) {
      await page.evaluate((i) => window.decklume.go(i, { steps: Infinity, instant: true }), i);
      await page.waitForTimeout(50);
      const buf = await page.screenshot({ type: "png" });
      if (png) writeFileSync(join(out, `${String(i + 1).padStart(2, "0")}.png`), buf);
      else shots.push(buf.toString("base64"));
    }
    if (png) {
      console.log(`✓ ${count} PNGs → ${relative(process.cwd(), out)}/`);
    } else {
      // Raster PDF: one full-bleed image per page.
      const html = `<!doctype html><style>@page{size:1920px 1080px;margin:0}body{margin:0}img{display:block;width:1920px;height:1080px;break-after:page}</style>` +
        shots.map((b) => `<img src="data:image/png;base64,${b}">`).join("");
      const p2 = await browser.newPage();
      await p2.setContent(html, { waitUntil: "load" });
      await p2.pdf({ path: out, width: "1920px", height: "1080px", printBackground: true });
      report(out, count, "raster");
    }
  } else {
    await page.emulateMedia({ media: "print" });
    await page.pdf({ path: out, width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true });
    report(out, count, "vector");
  }
} finally {
  await server.close();
  await browser.close();
}

function report(file, n, kind) {
  const mb = (statSync(file).size / 1048576).toFixed(1);
  const pages = (readFileSync(file, "latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log(`✓ ${relative(process.cwd(), file)} · ${kind} PDF · ${pages} pages · ${mb} MB`);
  if (pages !== n) console.warn(`  ⚠ expected ${n} pages, got ${pages} — check the deck's print styles`);
}
