// Decklume demo: presenting the showcase lecture (site/demos/folio.html).
// node scripts/demo/present-demo.mjs --rehearse   checks every step, records nothing
// node scripts/demo/present-demo.mjs <out-dir>    records <out-dir>/raw.webm + timing.json
// See docs/roadmap/demo-video.md for the full pipeline.
import { writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const { launch, serve } = await import(join(REPO, "skills/decklume/scripts/lib/browser.mjs"));

const REHEARSAL = process.argv.includes("--rehearse");
const OUT = resolve(process.argv.find((a, i) => i > 1 && !a.startsWith("--")) || "launch/demo/rec");
const SIZE = { width: 1280, height: 720 };

async function injectOverlays(page) {
  // The deck's control bar appears on mouse moves and would sit under the captions.
  await page.addStyleTag({ content: ".dl-hud { display: none !important; }" });
  await page.evaluate(() => {
    if (document.getElementById("demo-cursor")) return;
    const cursor = document.createElement("div");
    cursor.id = "demo-cursor";
    cursor.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
    cursor.style.cssText = "position:fixed;z-index:999999;pointer-events:none;left:-40px;top:-40px;filter:drop-shadow(1px 2px 3px rgba(0,0,0,.35))";
    document.body.appendChild(cursor);
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });
    const bar = document.createElement("div");
    bar.id = "demo-subtitle";
    bar.style.cssText = `position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:999998;
      padding:10px 22px;border-radius:999px;background:rgba(17,17,17,.82);color:#fff;
      font:500 19px/1.3 -apple-system,"Segoe UI",sans-serif;letter-spacing:.2px;white-space:nowrap;
      opacity:0;transition:opacity .35s;pointer-events:none`;
    document.body.appendChild(bar);
  });
}

async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    const bar = document.getElementById("demo-subtitle");
    if (t) bar.textContent = t;
    bar.style.opacity = t ? "1" : "0";
  }, text);
  if (text) await page.waitForTimeout(700);
}

const where = (page) => page.evaluate(() => ({ index: window.decklume.index, steps: window.decklume.stepIndex, overview: window.decklume.overview }));

// Fails loudly: a wrong slide or step must stop the rehearsal.
async function expectAt(page, label, index, steps) {
  const at = await where(page);
  const ok = at.index === index && (steps === undefined || at.steps === steps);
  console.log(`${ok ? "REHEARSAL OK" : "REHEARSAL FAIL"}: ${label} (slide ${at.index + 1}, step ${at.steps}, expected slide ${index + 1}${steps === undefined ? "" : ", step " + steps})`);
  if (!ok) throw new Error(`rehearsal failed at "${label}"`);
}

const events = [];
const mark = (kind) => events.push({ kind, ms: Date.now() - t0 });

async function press(page, key, pause) {
  mark(key.length === 1 && /\d/.test(key) ? "digit" : key === "o" ? "overview" : key === "End" ? "end" : "key");
  await page.keyboard.press(key);
  await page.waitForTimeout(pause);
}

async function typeSlideNumber(page, n, pause) {
  for (const ch of String(n)) await press(page, ch, 180);
  await press(page, "Enter", pause);
}

async function moveTo(page, locator, steps = 24) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("no box for cursor target");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps });
  return box;
}

const pace = REHEARSAL ? (ms) => Math.min(ms, 900) : (ms) => ms;

const browser = await launch();
const server = await serve(join(REPO, "site/demos"));
const context = await browser.newContext({
  viewport: SIZE,
  deviceScaleFactor: 1,
  ...(REHEARSAL ? {} : { recordVideo: { dir: OUT, size: SIZE } }),
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let t0 = Date.now();
let readyAt = 0;

try {
  await page.goto(server.url("folio.html"), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await injectOverlays(page);
  await page.mouse.move(1180, 640);
  readyAt = Date.now() - t0;

  await expectAt(page, "title slide", 0);
  await showSubtitle(page, "One HTML file: open it and present");
  await page.waitForTimeout(pace(3200));

  await showSubtitle(page, "Arrow keys move through the lecture");
  await press(page, "ArrowRight", pace(2200));
  await expectAt(page, "agenda", 1);
  await press(page, "ArrowRight", pace(2200));
  await expectAt(page, "section 01", 2);

  await showSubtitle(page, "Type a slide number to jump straight to it");
  await typeSlideNumber(page, 7, pace(3400));
  await expectAt(page, "staircase", 6);

  await showSubtitle(page, "Charts draw themselves, labelled on the chart");
  await press(page, "ArrowRight", pace(3600));
  await expectAt(page, "donut", 7);

  await showSubtitle(page, "Each click reveals the next callout");
  await press(page, "ArrowRight", pace(1600));
  await expectAt(page, "hypnogram", 8, 0);
  for (let s = 1; s <= 4; s++) {
    await press(page, "ArrowRight", pace(1500));
    await expectAt(page, `callout ${s}`, 8, s);
  }

  await showSubtitle(page, "A chart that tells its point one step at a time");
  await press(page, "ArrowRight", pace(1800));
  await expectAt(page, "chart story", 9, 0);
  await press(page, "ArrowRight", pace(1700));
  await press(page, "ArrowRight", pace(2200));
  await expectAt(page, "chart story steps", 9, 2);

  await showSubtitle(page, "Magic Move carries a number into the next slide");
  await typeSlideNumber(page, 16, pace(2400));
  await expectAt(page, "kpi", 15);
  await press(page, "ArrowRight", pace(3200));
  await expectAt(page, "stats after morph", 16);

  await showSubtitle(page, "Press O for an overview of every slide");
  await press(page, "o", pace(2400));
  if (!(await where(page)).overview) throw new Error("overview did not open");
  console.log("REHEARSAL OK: overview open");
  const target = page.locator(".deck-stage > .slide").nth(24);
  await moveTo(page, page.locator(".deck-stage > .slide").nth(6), 20);
  await page.waitForTimeout(pace(500));
  await moveTo(page, page.locator(".deck-stage > .slide").nth(17), 20);
  await page.waitForTimeout(pace(500));
  await showSubtitle(page, "Click any slide to jump there");
  await moveTo(page, target, 24);
  await page.waitForTimeout(pace(700));
  mark("click");
  await target.click();
  await showSubtitle(page, "");
  await page.waitForTimeout(pace(2800));
  await expectAt(page, "cards from overview", 24);
  await page.mouse.move(1180, 640, { steps: 16 });

  await showSubtitle(page, "Every slide passes the same design QA");
  await press(page, "End", pace(2600));
  await expectAt(page, "closing", 32);
  await showSubtitle(page, "");
  await page.waitForTimeout(pace(1600));

  if (errors.length) throw new Error("page errors: " + errors.join(" | "));
  console.log(REHEARSAL ? "REHEARSAL PASSED - all steps verified" : "RECORDING DONE");
} catch (err) {
  console.error("DEMO ERROR:", err.message);
  process.exitCode = 1;
} finally {
  await context.close();
  if (!REHEARSAL) {
    const video = page.video();
    if (video) {
      mkdirSync(OUT, { recursive: true });
      copyFileSync(await video.path(), join(OUT, "raw.webm"));
      writeFileSync(join(OUT, "timing.json"), JSON.stringify({ trimStartMs: readyAt, events }));
      console.log("Video saved:", join(OUT, "raw.webm"), "trim", readyAt, "ms");
    }
  }
  await browser.close();
  await server.close();
}
