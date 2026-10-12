#!/usr/bin/env node
/* =====================================================================
   DECKLUME · QA GATE
   Renders every slide in a real browser and fails the deck on design
   defects a screenshot glance misses.

   Usage:
     node qa.mjs deck.html                 → deck.qa/ (report + screenshots)
     node qa.mjs deck.html --out qa-out --density reading --json

   Errors (exit 1): overflow, overlap, text too small, low contrast,
                    web font failed, leaked internal text.
   Warnings:        slop patterns, crowded slides, missing alt text,
                    long headlines, empty slides.
   ===================================================================== */
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { dirname, basename, resolve, join, relative } from "node:path";
import { launch, serve, freeze, waitForFonts, open } from "./lib/browser.mjs";

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : dflt;
};
const VALUED = new Set(["--out", "--density"]);
const deckPath = args.find((a, i) => !a.startsWith("--") && !VALUED.has(args[i - 1]));
if (!deckPath || !existsSync(deckPath)) {
  console.error("usage: node qa.mjs <deck.html> [--out dir] [--density speaker|reading] [--json] [--no-shots]");
  process.exit(2);
}

const deck = resolve(deckPath);
const outDir = resolve(opt("--out", deck.replace(/\.html?$/, "") + ".qa"));
const density = opt("--density", "auto");
const asJson = args.includes("--json");
const shots = !args.includes("--no-shots");

/* --- Checks run inside the page, one slide at a time ------------------- */
function inspectSlide({ index, minBody, minChrome }) {
  const slide = document.querySelectorAll(".deck-stage > .slide")[index];
  const issues = [];
  const add = (level, rule, msg, el) => {
    let where = "";
    if (el) {
      const r = el.getBoundingClientRect();
      const s = slide.getBoundingClientRect();
      const k = 1920 / s.width;
      where = ` @ (${Math.round((r.left - s.left) * k)}, ${Math.round((r.top - s.top) * k)})`;
    }
    issues.push({ level, rule, msg: msg + where });
  };
  const sr = slide.getBoundingClientRect();
  const k = 1920 / sr.width; // stage px per CSS px
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return { l: (r.left - sr.left) * k, t: (r.top - sr.top) * k, r: (r.right - sr.left) * k, b: (r.bottom - sr.top) * k, w: r.width * k, h: r.height * k };
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const hasOwnText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const textEls = [...slide.querySelectorAll("*")].filter(
    (el) => !el.closest(".notes, svg, script, style, [aria-hidden='true']") && hasOwnText(el) && visible(el)
  );

  // 1. Overflow: content outside the slide, or clipped inside a box.
  const decorative = (el) => el.closest(".media, .bg, [data-bleed], .l-bleed > img, .l-split > .media");
  slide.querySelectorAll("*").forEach((el) => {
    if (el.closest(".notes, svg") || decorative(el) || !visible(el)) return;
    const r = rect(el);
    if (r.l < -2 || r.t < -2 || r.r > 1922 || r.b > 1082) {
      add("error", "overflow", `<${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""}> extends past the slide edge`, el);
    }
  });
  textEls.forEach((el) => {
    const cs = getComputedStyle(el);
    if (/(hidden|clip)/.test(cs.overflow + cs.overflowY) && el.scrollHeight > el.clientHeight + 2) {
      add("error", "clipped", `text is clipped inside <${el.tagName.toLowerCase()}>`, el);
    }
  });
  // Text must stay clear of the folio (deck name + page number), which is
  // drawn by ::after in the bottom margin. Measure where it actually sits.
  const folio = getComputedStyle(slide, "::after");
  if (folio.content && folio.content !== "none" && folio.display !== "none") {
    const fs = parseFloat(folio.fontSize) || 20;
    const lh = parseFloat(folio.lineHeight) || fs * 1.3;
    const folioTop = 1080 - (parseFloat(folio.bottom) || 0) - lh;
    textEls.forEach((el) => {
      if (el.closest(".l-bleed, .media")) return;
      if (rect(el).b > folioTop - 6) add("error", "safe-area", "text runs into the folio (deck name and page number)", el);
    });
  }

  // 2. Overlap between unrelated text blocks.
  const blocks = textEls;
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i], b = blocks[j];
      if (a.contains(b) || b.contains(a)) continue;
      if (a.closest("[data-overlap-ok]") || b.closest("[data-overlap-ok]")) continue;
      const ra = rect(a), rb = rect(b);
      const w = Math.min(ra.r, rb.r) - Math.max(ra.l, rb.l);
      const h = Math.min(ra.b, rb.b) - Math.max(ra.t, rb.t);
      if (w > 6 && h > 6) add("error", "overlap", `"${a.textContent.trim().slice(0, 28)}" overlaps "${b.textContent.trim().slice(0, 28)}"`, a);
    }
  }

  // 3. Type size.
  const chrome = ".source, .folio, .pron, .time, .card-index, th, .dl-lab, figcaption, .caption";
  textEls.forEach((el) => {
    const px = parseFloat(getComputedStyle(el).fontSize);
    const min = el.closest(chrome) ? minChrome : minBody;
    if (px < min - 0.5) add("error", "type-size", `${Math.round(px)}px text "${el.textContent.trim().slice(0, 30)}" is below ${min}px`, el);
  });

  // 4. Contrast (WCAG 2.x) against the nearest opaque background colour.
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
  };
  const toRgb = (str) => {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = "#000";
    c.fillStyle = str;
    const v = c.fillStyle;
    if (v.startsWith("#")) {
      const n = parseInt(v.slice(1), 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
    }
    return parse(v);
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const bgOf = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== "none" && !n.classList.contains("slide")) return null; // image/gradient: can't judge
      const c = toRgb(cs.backgroundColor);
      if (c && c.a > 0) {
        layers.push(c);
        if (c.a >= 1) break;
      }
      if (n === slide) break;
    }
    let out = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) out = blend(layers[i], out);
    return out;
  };
  if (!slide.matches(".l-bleed")) {
    textEls.forEach((el) => {
      const cs = getComputedStyle(el);
      const bg = bgOf(el);
      if (!bg) return;
      // Outlined text (transparent fill + stroke) is judged by its stroke.
      const stroke = parseFloat(cs.webkitTextStrokeWidth) || 0;
      let fg = toRgb(stroke > 0 && /rgba\(.*,\s*0\)$|transparent/.test(cs.color) ? cs.webkitTextStrokeColor : cs.color);
      if (!fg) return;
      const op = Number(cs.opacity);
      fg = blend({ ...fg, a: fg.a * op }, bg);
      const L1 = lum(fg), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const px = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      const large = px >= 36 || (bold && px >= 28);
      const need = large ? 3 : 4.5;
      if (ratio < need) add("error", "contrast", `contrast ${ratio.toFixed(2)}:1 < ${need}:1 for "${el.textContent.trim().slice(0, 30)}"`, el);
    });
  }

  // 5. Leaked internal / placeholder text.
  const text = slide.innerText || "";
  const leaks = [/lorem ipsum/i, /\bTODO\b/, /\bOption [ABC]\b/, /\bstyle (preview|option)\b/i, /\bpreset\b/i, /\.deck\.html|\.md\b|\/Users\//, /\{\{.*?\}\}/, /\[(insert|placeholder|your)[^\]]*\]/i];
  leaks.forEach((re) => {
    const m = text.match(re);
    if (m) add("error", "leak", `internal or placeholder text on slide: "${m[0]}"`);
  });

  // 6. Warnings: crowding, alt text, headline length, emptiness, emoji icons.
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words > 120) add("warn", "crowded", `${words} words on one slide — consider splitting`);
  if (words === 0 && !slide.querySelector("img, svg, video")) add("warn", "empty", "slide has no visible content");
  slide.querySelectorAll("img").forEach((img) => {
    if (!img.hasAttribute("alt")) add("warn", "alt", `image without alt attribute: ${img.getAttribute("src")?.slice(0, 40)}`);
    if (img.complete && img.naturalWidth === 0) add("error", "image", `image failed to load: ${img.getAttribute("src")?.slice(0, 60)}`);
  });
  slide.querySelectorAll("h1, h2").forEach((h) => {
    const n = h.textContent.trim().split(/\s+/).length;
    if (n > 14) add("warn", "headline", `headline has ${n} words — keep headlines under ~12`);
  });
  const emoji = text.match(/\p{Extended_Pictographic}/u);
  if (emoji) add("warn", "slop", `emoji used on slide ("${emoji[0]}") — prefer real icons or none`);

  return { index, words, issues };
}

/* Deck-level checks: fonts and slop heuristics. */
function inspectDeck() {
  const issues = [];
  const add = (level, rule, msg) => issues.push({ level, rule, msg });
  const families = new Set();
  document.querySelectorAll(".deck-stage .slide *").forEach((el) => {
    const f = getComputedStyle(el).fontFamily.split(",")[0].replace(/["']/g, "").trim();
    if (f) families.add(f);
  });
  const generic = /^(serif|sans-serif|monospace|system-ui|ui-sans-serif|ui-serif|ui-monospace|cursive|math)$/i;
  const loaded = new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/["']/g, "")));
  families.forEach((f) => {
    if (generic.test(f)) return;
    if (!loaded.has(f) && !document.fonts.check(`16px "${f}"`)) add("error", "font", `web font "${f}" did not load — slides fall back to system fonts`);
  });
  const display = getComputedStyle(document.documentElement).getPropertyValue("--f-display").split(",")[0].replace(/["']/g, "").trim();
  if (/^(Inter|Roboto|Arial|Helvetica|Open Sans|Poppins|Montserrat|Lato)$/i.test(display)) {
    add("warn", "slop", `display face "${display}" is generic — choose a font with character`);
  }
  // Purple-on-white gradient cliché.
  const bgImages = [...document.querySelectorAll(".deck-stage .slide, .deck-stage .slide *")].map((el) => getComputedStyle(el).backgroundImage).filter((b) => b.includes("gradient"));
  const purple = bgImages.some((b) =>
    [...b.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g)].some(([, r, g, bl]) => {
      r = +r; g = +g; bl = +bl;
      return bl > 150 && r > 90 && r < 200 && g < 110;
    })
  );
  if (purple) add("warn", "slop", "purple gradient detected — the most common AI-deck cliché");
  return { families: [...families], issues };
}

/* --- Run ------------------------------------------------------------------- */
const browser = await launch();
const server = await serve(dirname(deck));
const failures = [];
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  await open(page, server.url(basename(deck)));
  await waitForFonts(page);
  await freeze(page);

  const count = await page.evaluate(() => document.querySelectorAll(".deck-stage > .slide").length);
  const isReading = density === "reading";
  const minBody = isReading ? 20 : 24;
  const minChrome = 18;

  if (shots) {
    if (existsSync(outDir)) rmSync(outDir, { recursive: true });
    mkdirSync(join(outDir, "slides"), { recursive: true });
  }

  const slides = [];
  for (let i = 0; i < count; i++) {
    await page.evaluate((i) => window.decklume.go(i, { steps: Infinity, instant: true }), i);
    await page.waitForTimeout(60);
    slides.push(await page.evaluate(inspectSlide, { index: i, minBody, minChrome }));
    if (shots) await page.screenshot({ path: join(outDir, "slides", `${String(i + 1).padStart(2, "0")}.png`) });
  }
  const deckReport = await page.evaluate(inspectDeck);

  // Phone check: the stage must stay 16:9 (scaled, never reflowed).
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await open(phone, server.url(basename(deck)));
  const ratio = await phone.evaluate(() => {
    const r = document.querySelector(".deck-stage").getBoundingClientRect();
    return r.width / r.height;
  });
  if (Math.abs(ratio - 16 / 9) > 0.01) deckReport.issues.push({ level: "error", rule: "stage", msg: `stage is ${ratio.toFixed(3)}:1 on phones, expected 16:9` });
  if (shots) await phone.screenshot({ path: join(outDir, "phone.png") });
  consoleErrors.forEach((m) => deckReport.issues.push({ level: "error", rule: "js", msg: "console error: " + m.slice(0, 160) }));

  // Contact sheet: every slide on one image.
  if (shots) {
    const cols = 5;
    const tiles = slides.map((s) => {
      const n = String(s.index + 1).padStart(2, "0");
      const bad = s.issues.some((x) => x.level === "error");
      return `<figure class="${bad ? "bad" : ""}"><img src="slides/${n}.png"><figcaption>${n}${bad ? " · " + s.issues.filter((x) => x.level === "error").length + " error(s)" : ""}</figcaption></figure>`;
    }).join("");
    const sheet = `<!doctype html><meta charset="utf-8"><style>
      body{margin:0;padding:32px;background:#111;font:600 18px system-ui;color:#aaa}
      .g{display:grid;grid-template-columns:repeat(${cols},1fr);gap:20px}
      figure{margin:0}img{width:100%;display:block;border-radius:4px;outline:1px solid #333}
      figure.bad img{outline:4px solid #ff4d4d}figure.bad figcaption{color:#ff6b6b}
      figcaption{padding-top:6px}</style><div class="g">${tiles}</div>`;
    writeFileSync(join(outDir, "contact-sheet.html"), sheet);
    const sp = await browser.newPage({ viewport: { width: 1920, height: 800 } });
    await sp.goto(server.url(relative(dirname(deck), join(outDir, "contact-sheet.html"))), { waitUntil: "load" });
    await sp.screenshot({ path: join(outDir, "contact-sheet.png"), fullPage: true });
  }

  /* --- Report --------------------------------------------------------- */
  const all = [
    ...deckReport.issues.map((x) => ({ slide: null, ...x })),
    ...slides.flatMap((s) => s.issues.map((x) => ({ slide: s.index + 1, ...x }))),
  ];
  const errors = all.filter((x) => x.level === "error");
  const warns = all.filter((x) => x.level === "warn");
  const report = { deck: deck, slides: count, errors: errors.length, warnings: warns.length, fonts: deckReport.families, issues: all, passed: errors.length === 0 };
  if (shots) writeFileSync(join(outDir, "report.json"), JSON.stringify(report, null, 2));

  if (asJson) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`\nDecklume QA · ${basename(deck)} · ${count} slides`);
    for (const x of all) console.log(`  ${x.level === "error" ? "✗" : "⚠"} ${x.slide ? "slide " + String(x.slide).padStart(2, " ") : "deck    "}  [${x.rule}] ${x.msg}`);
    console.log(`\n${errors.length ? "✗ FAILED" : "✓ PASSED"} · ${errors.length} error(s), ${warns.length} warning(s)`);
    if (shots) console.log(`  screenshots + contact sheet: ${relative(process.cwd(), outDir)}/`);
  }
  if (errors.length) failures.push(errors.length);
} finally {
  await server.close();
  await browser.close();
}
process.exit(failures.length ? 1 : 0);
