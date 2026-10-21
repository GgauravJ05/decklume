/* Runtime behaviour tests: run with `node --test tests/` */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
import { build } from "../skills/decklume/scripts/build.mjs";
import { launch, serve } from "../skills/decklume/scripts/lib/browser.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "examples/sleep-and-memory/sleep-and-memory.deck.html");
let browser, server, page, url, errors;

const active = () => page.evaluate(() => window.decklume.index);
const key = async (k) => {
  await page.keyboard.press(k);
  await page.waitForTimeout(80);
};

before(async () => {
  const { out } = build(SRC);
  browser = await launch();
  server = await serve(dirname(out));
  url = server.url(basename(out));
  page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: "networkidle" });
});

after(async () => {
  await browser?.close();
  await server?.close();
});

test("starts on slide 1 and keeps the stage 16:9", async () => {
  assert.equal(await active(), 0);
  const ratio = await page.evaluate(() => {
    const r = document.querySelector(".deck-stage").getBoundingClientRect();
    return r.width / r.height;
  });
  assert.ok(Math.abs(ratio - 16 / 9) < 0.01);
});

test("arrow keys move between slides and update the hash", async () => {
  await key("ArrowRight");
  await page.waitForTimeout(700); // let the view transition settle
  assert.equal(await active(), 1);
  assert.equal(await page.evaluate(() => location.hash), "#/2");
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--dl-progress").trim()), String(1 / 28));
  await key("ArrowLeft");
  assert.equal(await active(), 0);
});

test("builds reveal one step per press, then advance", async () => {
  const idx = await page.evaluate(() => window.decklume.slides.findIndex((s) => s._steps.length === 3));
  assert.ok(idx > 0, "fixture has a slide with three steps");
  await page.evaluate((i) => window.decklume.go(i, { instant: true }), idx);
  const shown = () => page.evaluate(() => document.querySelectorAll(".slide.is-active .step.is-shown").length);
  assert.equal(await shown(), 0);
  await key("ArrowRight");
  assert.equal(await shown(), 1);
  await key("ArrowRight");
  await key("ArrowRight");
  assert.equal(await shown(), 3);
  assert.equal(await active(), idx);
  await key("ArrowRight");
  assert.equal(await active(), idx + 1);
  await key("ArrowLeft");
  assert.equal(await active(), idx, "going back lands on the fully built slide");
  assert.equal(await shown(), 3);
});

test("Magic Move pairs elements by data-morph and runs a view transition", async () => {
  const from = await page.evaluate(() => window.decklume.slides.findIndex((s) => s.querySelector('[data-morph="one-in-three"]')));
  await page.evaluate((i) => window.decklume.go(i, { instant: true }), from);
  const result = await page.evaluate(async () => {
    const d = window.decklume;
    const pairs = d.matchMorphs(d.slides[d.index], d.slides[d.index + 1]);
    let started = false;
    const orig = document.startViewTransition.bind(document);
    document.startViewTransition = (cb) => {
      started = true;
      return orig(cb);
    };
    d.next();
    await new Promise((r) => setTimeout(r, 900));
    document.startViewTransition = orig;
    return { pairs: pairs.length, started, names: [...document.querySelectorAll("[data-morph]")].filter((e) => e.style.viewTransitionName).length };
  });
  assert.equal(result.pairs, 1);
  assert.ok(result.started, "view transition started");
  assert.equal(result.names, 0, "morph names are cleaned up afterwards");
  assert.equal(await active(), from + 1);
});

test("overview opens with O and closes with Escape", async () => {
  await key("o");
  assert.ok(await page.evaluate(() => document.documentElement.classList.contains("dl-overview")));
  await key("Escape");
  assert.ok(!(await page.evaluate(() => document.documentElement.classList.contains("dl-overview"))));
});

test("jump-to-slide with digits + Enter", async () => {
  await key("1");
  await key("2");
  await key("Enter");
  assert.equal(await active(), 11);
});

test("edit mode round-trips to clean source", async () => {
  await key("e");
  const editable = await page.evaluate(() => document.querySelectorAll("[contenteditable='true']").length);
  assert.ok(editable > 50);
  await key("Escape");
  const html = await page.evaluate(() => window.decklume.serialize());
  assert.ok(html.startsWith("<!DOCTYPE html>"));
  // Inspect markup only: the inline runtime script legitimately names these.
  const markup = html.replace(/<script\b[\s\S]*?<\/script>/g, "").replace(/<style\b[\s\S]*?<\/style>/g, "");
  for (const runtime of ["contenteditable", "dl-enter", "dl-hud", "dl-progress", "is-entering", "data-dl-generated", "dl-order", "is-shown"]) {
    assert.ok(!markup.includes(runtime), `serialized markup still contains ${runtime}`);
  }
  // The saved file must boot again.
  const p2 = await browser.newPage();
  await p2.setContent(html, { waitUntil: "load" });
  assert.equal(await p2.evaluate(() => document.querySelectorAll(".slide").length), 29);
  assert.equal(await p2.evaluate(() => document.querySelectorAll(".chart svg").length), 1, "chart re-renders exactly once");
  await p2.close();
});

test("presenter view shows notes and drives the deck", async () => {
  const p = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto(url.replace(/#.*/, "") + "?presenter#/1", { waitUntil: "networkidle" });
  await p.waitForSelector(".pv-notes");
  assert.match(await p.textContent(".pv-notes"), /show of hands/);
  assert.equal(await p.textContent(".pv-count"), "1 / 29");
  await p.keyboard.press("ArrowRight");
  assert.equal(await p.textContent(".pv-count"), "2 / 29");
  await p.close();
});

test("no runtime errors", () => {
  assert.deepEqual(errors, []);
});
