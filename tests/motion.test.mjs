/* Motion system tests: transitions, presets, count-up, code walkthrough. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { build } from "../skills/decklume/scripts/build.mjs";
import { launch, serve } from "../skills/decklume/scripts/lib/browser.mjs";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "fixtures/motion.deck.html");
let browser, server, page, url, errors, buildResult;

before(async () => {
  const dir = mkdtempSync(join(tmpdir(), "decklume-motion-"));
  copyFileSync(SRC, join(dir, "motion.deck.html"));
  buildResult = build(join(dir, "motion.deck.html"));
  browser = await launch();
  server = await serve(dir);
  url = server.url(basename(buildResult.out));
  page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: "load" });
});
after(async () => { await browser?.close(); await server?.close(); });

test("build accepts the motion vocabulary without warnings", () => {
  assert.deepEqual(buildResult.warnings, []);
});

test("deck-level transition is applied and recorded during the view transition", async () => {
  const seen = await page.evaluate(async () => {
    const d = window.decklume;
    const orig = document.startViewTransition.bind(document);
    let vt = null, dir = null;
    document.startViewTransition = (cb) => { vt = document.documentElement.dataset.vt; dir = document.documentElement.dataset.vtDir; return orig(cb); };
    d.go(3, { instant: true });
    d.go(2, { instant: true });
    d.go(3); // flip, forward
    await new Promise((r) => setTimeout(r, 900));
    document.startViewTransition = orig;
    return { vt, dir, after: document.documentElement.dataset.vt ?? null };
  });
  assert.equal(seen.vt, "flip");
  assert.equal(seen.dir, "fwd");
  assert.equal(seen.after, null, "transition state is cleared afterwards");
});

test("data-transition=none switches instantly without a view transition", async () => {
  const used = await page.evaluate(async () => {
    const d = window.decklume;
    d.go(1, { instant: true });
    let used = false;
    const orig = document.startViewTransition.bind(document);
    document.startViewTransition = (cb) => { used = true; return orig(cb); };
    d.go(2);
    document.startViewTransition = orig;
    return used;
  });
  assert.equal(used, false);
});

test("auto Magic Move pairs matching headlines on a morph slide", async () => {
  const n = await page.evaluate(() => {
    const d = window.decklume;
    return d.matchMorphs(d.slides[0], d.slides[1], true).length;
  });
  assert.equal(n, 1);
});

test("count-up ends on the exact original text", async () => {
  await page.evaluate(() => window.decklume.go(1, { instant: true }));
  await page.waitForTimeout(2200);
  assert.equal((await page.textContent(".slide.is-active .big-number")).trim(), "1,250.5ms");
});

test("code walkthrough focuses one range per press", async () => {
  await page.evaluate(() => window.decklume.go(2, { instant: true }));
  const focus = () => page.evaluate(() => [...document.querySelectorAll(".slide.is-active .ln")].map((l) => (l.classList.contains("is-focus") ? 1 : 0)).join(""));
  assert.equal(await focus(), "0000");
  await page.keyboard.press("ArrowRight");
  assert.equal(await focus(), "1100");
  await page.keyboard.press("ArrowRight");
  assert.equal(await focus(), "0001");
});

test("saved source restores code and drops runtime motion state", async () => {
  const html = await page.evaluate(() => window.decklume.serialize());
  const markup = html.replace(/<script\b[\s\S]*?<\/script>/g, "").replace(/<style\b[\s\S]*?<\/style>/g, "");
  assert.match(markup, /<code>const a = 1;\nconst b = 2;\n\nconsole\.log\(a \+ b\);<\/code>/);
  for (const t of ['class="ln"', "dl-codestep", "dl-a-", "has-focus", "data-vt"]) assert.ok(!markup.includes(t), `still contains ${t}`);
});

test("no runtime errors", () => assert.deepEqual(errors, []));
