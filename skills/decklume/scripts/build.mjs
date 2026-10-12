#!/usr/bin/env node
/* =====================================================================
   DECKLUME · BUILD
   Turns a deck source (front matter + <section class="slide"> markup)
   into ONE self-contained HTML file: engine + theme + fonts + content.

   Usage:
     node build.mjs talk.deck.html                 → talk.html
     node build.mjs talk.deck.html -o out/talk.html
     node build.mjs talk.deck.html --theme nocturne --inline-assets
     node build.mjs talk.deck.html --watch
     node build.mjs --list-themes

   Node ≥ 18, no dependencies.
   ===================================================================== */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, watch, statSync, realpathSync } from "node:fs";
import { dirname, resolve, join, basename, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL = resolve(HERE, "..");
const ENGINE = join(SKILL, "engine");
const THEMES = join(SKILL, "themes");

const LAYOUTS = [
  "l-title", "l-section", "l-statement", "l-quote", "l-list", "l-cards", "l-split", "l-bleed",
  "l-compare", "l-timeline", "l-steps", "l-kpi", "l-stats", "l-chart", "l-table", "l-code",
  "l-diagram", "l-people", "l-agenda", "l-define", "l-gallery", "l-closing", "l-free",
];

const TRANSITIONS = ["fade", "push", "rise", "cover", "zoom", "wipe", "iris", "blur", "flip", "morph", "none"];
const ANIMS = ["fade", "rise", "drop", "left", "right", "scale", "pop", "blur", "wipe", "iris", "flip", "type", "count", "draw", "highlight"];

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".avif": "image/avif" };

/* --- CLI ------------------------------------------------------------- */
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-o" || a === "--out") args.out = argv[++i];
    else if (a === "--theme") args.theme = argv[++i];
    else if (a === "--variant") args.variant = argv[++i];
    else if (a === "--inline-assets") args.inline = true;
    else if (a === "--watch") args.watch = true;
    else if (a === "--list-themes") args.listThemes = true;
    else if (a === "--json") args.json = true;
    else if (a === "-h" || a === "--help") args.help = true;
    else args._.push(a);
  }
  return args;
}

const HELP = `decklume build — compile a deck source into one HTML file

  node build.mjs <deck.deck.html> [-o out.html] [--theme slug] [--variant name]
                 [--inline-assets] [--watch]
  node build.mjs --list-themes [--json]`;

/* --- Front matter ----------------------------------------------------
   ---
   title: My talk
   theme: folio
   ---                                                                 */
export function parseSource(text) {
  const meta = {};
  let body = text;
  const m = text.match(/^﻿?\s*---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (m) {
    body = text.slice(m[0].length);
    for (const line of m[1].split("\n")) {
      const kv = line.match(/^\s*([A-Za-z][\w-]*)\s*:\s*(.*?)\s*$/);
      if (!kv) continue;
      let v = kv[2];
      if (/^(["']).*\1$/.test(v)) v = v.slice(1, -1);
      if (v === "true") v = true;
      else if (v === "false") v = false;
      meta[kv[1].toLowerCase()] = v;
    }
  }
  return { meta, body };
}

export function listThemes() {
  if (!existsSync(THEMES)) return [];
  return readdirSync(THEMES)
    .filter((d) => existsSync(join(THEMES, d, "meta.json")))
    .map((d) => ({ slug: d, ...JSON.parse(readFileSync(join(THEMES, d, "meta.json"), "utf8")) }));
}

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cssString = (s = "") => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ") + '"';
const read = (p) => readFileSync(p, "utf8");

function inlineAssets(html, baseDir, warnings) {
  return html.replace(/(\ssrc|\shref|\sposter)=("|')([^"']+)\2/g, (all, attr, q, url) => {
    if (/^(data:|https?:|#|mailto:)/.test(url) || attr.trim() === "href") return all;
    const file = resolve(baseDir, decodeURIComponent(url));
    const type = MIME[extname(file).toLowerCase()];
    if (!type) return all;
    if (!existsSync(file)) {
      warnings.push(`missing asset: ${url}`);
      return all;
    }
    return `${attr}=${q}data:${type};base64,${readFileSync(file).toString("base64")}${q}`;
  });
}

function lint(body, baseDir, warnings) {
  const sections = [...body.matchAll(/<section\b([^>]*)>/g)];
  let slideCount = 0;
  sections.forEach((s, i) => {
    const cls = (s[1].match(/class=("|')([^"']*)\1/) || [])[2] || "";
    if (!/\bslide\b/.test(cls)) return;
    slideCount++;
    const layouts = cls.split(/\s+/).filter((c) => c.startsWith("l-"));
    if (!layouts.length) warnings.push(`slide ${slideCount}: no layout class (l-*) — it will not get a designed layout`);
    layouts.filter((l) => !LAYOUTS.includes(l)).forEach((l) => warnings.push(`slide ${slideCount}: unknown layout "${l}"`));
  });
  for (const m of body.matchAll(/data-transition=("|')([^"']*)\1/g)) {
    if (!TRANSITIONS.includes(m[2])) warnings.push(`unknown transition "${m[2]}" (use ${TRANSITIONS.join(", ")})`);
  }
  for (const m of body.matchAll(/data-anim=("|')([^"']*)\1/g)) {
    const t = m[2].split(/\s+/)[0];
    if (!ANIMS.includes(t)) warnings.push(`unknown animation "${t}" (use ${ANIMS.join(", ")})`);
  }
  for (const m of body.matchAll(/\ssrc=("|')([^"']+)\1/g)) {
    const url = m[2];
    if (/^(data:|https?:)/.test(url)) continue;
    if (url.startsWith("/")) warnings.push(`absolute asset path will break when shared: ${url}`);
    else if (!existsSync(resolve(baseDir, decodeURIComponent(url)))) warnings.push(`missing asset: ${url}`);
  }
  return slideCount;
}

/* --- Build --------------------------------------------------------------- */
export function build(srcPath, opts = {}) {
  const warnings = [];
  const src = resolve(srcPath);
  const baseDir = dirname(src);
  const { meta, body: rawBody } = parseSource(read(src));

  // A theme is a built-in slug, or a path (./my-theme) to a folder with
  // theme.css + meta.json — used for one-off custom designs.
  const themeRef = opts.theme || meta.theme || "folio";
  const isPath = /[\\/]/.test(themeRef) || themeRef.startsWith(".");
  const themeDir = isPath ? resolve(baseDir, themeRef) : join(THEMES, themeRef);
  const themeSlug = isPath ? basename(themeDir) : themeRef;
  if (!existsSync(join(themeDir, "theme.css")) || !existsSync(join(themeDir, "meta.json"))) {
    if (isPath) throw new Error(`Custom theme "${themeRef}" needs theme.css and meta.json in ${themeDir}`);
    const known = listThemes().map((t) => t.slug).join(", ") || "none installed";
    throw new Error(`Unknown theme "${themeSlug}". Available: ${known}`);
  }
  const theme = JSON.parse(read(join(themeDir, "meta.json")));
  const variant = opts.variant || meta.variant || "";

  // Pull author <style>/<script> blocks out of the body so they land in the right place.
  const userStyles = [];
  const userScripts = [];
  let body = rawBody
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/g, (_, css) => (userStyles.push(css), ""))
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, (_, js) => (userScripts.push(js), ""))
    .trim();

  const slideCount = lint(body, baseDir, warnings);
  if (!slideCount) throw new Error("No <section class=\"slide ...\"> elements found in " + srcPath);

  // The first slide starts active so the deck is never blank before JS runs.
  body = body.replace(/<section\b([^>]*\bclass=("|')[^"']*\bslide\b)/, (m) => m.replace(/class=("|')/, "class=$1is-active "));

  if (opts.inline || meta["inline-assets"] === true) body = inlineAssets(body, baseDir, warnings);

  const usesCharts = /class=("|')[^"']*\bchart\b/.test(body);
  const title = meta.title || basename(src).replace(/(\.deck)?\.html?$/, "");
  const description = meta.description || meta.subtitle || `${title} — a presentation`;
  const lang = meta.lang || "en";
  const transition = meta.transition || theme.transition || "";
  if (transition && !TRANSITIONS.includes(transition)) warnings.push(`unknown deck transition "${transition}"`);
  const folio = meta.folio === false ? "" : meta.folio && meta.folio !== true ? meta.folio : title;

  const css = [
    read(join(ENGINE, "tokens.css")),
    read(join(ENGINE, "stage.css")),
    read(join(ENGINE, "base.css")),
    read(join(ENGINE, "layouts.css")),
    usesCharts ? read(join(ENGINE, "charts.css")) : "",
    read(join(ENGINE, "motion.css")),
    `/* === THEME: ${theme.name} === */\n` + read(join(themeDir, "theme.css")),
    userStyles.length ? "/* === DECK-SPECIFIC STYLES === */\n" + userStyles.join("\n") : "",
  ].filter(Boolean).join("\n\n");

  const js = [read(join(ENGINE, "deck.js")), usesCharts ? read(join(ENGINE, "charts.js")) : "", ...userScripts].filter(Boolean).join("\n\n");

  const fontLinks = theme.fonts
    ? `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(theme.fonts)}">`
    : "";

  const og = meta.image ? `\n<meta property="og:image" content="${esc(meta.image)}">\n<meta name="twitter:image" content="${esc(meta.image)}">` : "";

  const html = `<!DOCTYPE html>
<html lang="${esc(lang)}"${variant ? ` data-variant="${esc(variant)}"` : ""} data-theme="${esc(themeSlug)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${meta.author ? `<meta name="author" content="${esc(meta.author)}">\n` : ""}<meta name="generator" content="Decklume — https://github.com/GgauravJ05/decklume">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta name="twitter:card" content="summary_large_image">${og}
<meta name="theme-color" content="${esc(theme.colors?.bg || "#000")}">
${fontLinks}
<style>
${css}
</style>
</head>
<body>
<div class="deck-viewport">
<main class="deck-stage${folio ? "" : " no-folio"}" style="--deck-name: ${esc(cssString(folio))}"${transition ? ` data-transition="${esc(transition)}"` : ""}${meta.automorph === true ? " data-automorph" : ""} aria-label="${esc(title)}">
${body}
</main>
</div>
<script>
${js}
</script>
</body>
</html>
`;

  const out = resolve(opts.out || join(baseDir, basename(src).replace(/(\.deck)?\.html?$/, "") + ".html"));
  if (out === src) throw new Error("Output would overwrite the source. Name the source *.deck.html or pass -o.");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  return { out, slides: slideCount, theme: themeSlug, warnings, bytes: Buffer.byteLength(html) };
}

/* --- Main ---------------------------------------------------------------- */
function report(r) {
  const kb = (r.bytes / 1024).toFixed(0);
  console.log(`✓ ${relative(process.cwd(), r.out) || r.out}  ·  ${r.slides} slides  ·  theme ${r.theme}  ·  ${kb} KB`);
  r.warnings.forEach((w) => console.warn("  ⚠ " + w));
}

// Compare real paths: symlinked install locations (e.g. /var → /private/var
// on macOS) must still count as running this file directly.
const real = (p) => { try { return realpathSync(p); } catch { return resolve(p); } };
const isMain = Boolean(process.argv[1]) && real(process.argv[1]) === real(fileURLToPath(import.meta.url));
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }
  if (args.listThemes) {
    if (args.json) {
      console.log(JSON.stringify(listThemes().map(({ fonts, ...t }) => t), null, 2));
      process.exit(0);
    }
    for (const t of listThemes()) console.log(`${t.slug.padEnd(14)} ${t.name} — ${t.tagline}`);
    process.exit(0);
  }
  const src = args._[0];
  if (!src) {
    console.error(HELP);
    process.exit(1);
  }
  const run = () => {
    try {
      report(build(src, args));
      return true;
    } catch (e) {
      console.error("✗ " + e.message);
      return false;
    }
  };
  const ok = run();
  if (args.watch) {
    console.log("watching for changes… (Ctrl+C to stop)");
    let t;
    const targets = [resolve(src), ENGINE, THEMES].filter((p) => existsSync(p));
    for (const p of targets) {
      watch(p, { recursive: statSync(p).isDirectory() }, () => {
        clearTimeout(t);
        t = setTimeout(run, 120);
      });
    }
  } else if (!ok) process.exit(1);
}
