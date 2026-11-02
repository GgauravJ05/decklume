#!/usr/bin/env node
/* =====================================================================
   Render the same slides in every theme onto one image, to compare the
   compositions side by side. Writes qa-out/theme-matrix.png.

   Usage: node scripts/theme-matrix.mjs [slide numbers…]
   ===================================================================== */
import { basename, dirname, join } from "node:path";
import { launch, serve, freeze, waitForFonts, open } from "../skills/decklume/scripts/lib/browser.mjs";
import { ROOT, buildThemeDecks } from "./lib/theme-decks.mjs";

const DEFAULT_SLIDES = [1, 7, 8, 17, 25, 31];
const TILE = { width: 480, height: 270 };

const slides = process.argv.slice(2).map(Number).filter(Boolean);
const picks = slides.length ? slides : DEFAULT_SLIDES;
const decks = buildThemeDecks();
const browser = await launch();
const server = await serve(dirname(decks[0].out));

try {
  const page = await browser.newPage({ viewport: TILE });
  const rows = [];
  for (const { slug, out } of decks) {
    await open(page, server.url(basename(out)));
    await waitForFonts(page);
    await freeze(page);
    const tiles = [];
    for (const n of picks) {
      await page.evaluate((i) => window.decklume.go(i, { steps: Infinity, instant: true }), n - 1);
      await page.waitForTimeout(60);
      const png = await page.screenshot({ type: "png" });
      tiles.push(`<img src="data:image/png;base64,${png.toString("base64")}" width="${TILE.width}" height="${TILE.height}">`);
    }
    rows.push(`<h2>${slug}</h2><div class="row">${tiles.join("")}</div>`);
  }
  const heads = picks.map((n) => `<b>Slide ${n}</b>`).join("");
  await page.setViewportSize({ width: picks.length * (TILE.width + 12) + 180, height: 800 });
  await page.setContent(`<!doctype html><style>
    body{margin:0;padding:24px;background:#111;color:#aaa;font:600 18px system-ui;display:grid;grid-template-columns:132px 1fr;gap:12px;align-items:center}
    h2{margin:0;font:inherit;color:#eee}.row{display:flex;gap:12px}.row b{width:${TILE.width}px}
  </style><span></span><div class="row">${heads}</div>${rows.join("")}`, { waitUntil: "load" });
  const path = join(ROOT, "qa-out/theme-matrix.png");
  await page.screenshot({ path, fullPage: true });
  console.log(`✓ ${decks.length} themes × ${picks.length} slides: ${path}`);
} finally {
  await server.close();
  await browser.close();
}
