/* QA gate tests: run with `node --test tests/` */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "../skills/decklume/scripts/build.mjs";

const QA = join(dirname(fileURLToPath(import.meta.url)), "../skills/decklume/scripts/qa.mjs");
const at = (tag, top, text) => `<${tag} style="position:absolute;left:120px;top:${top}px">${text}</${tag}>`;

function runQa(slideHtml) {
  const dir = mkdtempSync(join(tmpdir(), "decklume-qa-"));
  const src = join(dir, "t.deck.html");
  writeFileSync(src, `---\ntitle: "T"\ntheme: folio\n---\n${slideHtml}`);
  const { out } = build(src);
  return new Promise((resolve) => {
    execFile("node", [QA, out, "--json", "--no-shots"], { maxBuffer: 1 << 24 }, (_err, stdout) => resolve(JSON.parse(stdout)));
  });
}
const deadSpace = (report) => report.issues.filter((i) => i.rule === "dead-space");

test("warns when a big empty band splits a slide's content", async () => {
  const report = await runQa(`<section class="slide l-free">${at("h2", 90, "Headline")}${at("p", 860, "Far below")}</section>`);
  assert.equal(deadSpace(report).length, 1);
  assert.equal(deadSpace(report)[0].level, "warn");
});

test("stays quiet when content is evenly spread", async () => {
  const report = await runQa(`<section class="slide l-free">${at("h2", 90, "Headline")}${at("p", 330, "One")}${at("p", 560, "Two")}${at("p", 790, "Three")}</section>`);
  assert.deepEqual(deadSpace(report), []);
});

test("exempts layouts that are meant to be sparse", async () => {
  const report = await runQa(`<section class="slide l-statement">${at("h2", 90, "Headline")}${at("p", 860, "Far below")}</section>`);
  assert.deepEqual(deadSpace(report), []);
});

test("counts a filled panel as occupied space", async () => {
  const panel = `<div style="position:absolute;left:120px;right:120px;top:300px;height:640px;background:#333"><p style="margin:0;color:#fff">Label</p></div>`;
  const report = await runQa(`<section class="slide l-free">${at("h2", 90, "Headline")}${panel}</section>`);
  assert.deepEqual(deadSpace(report), []);
});

test("does not count the slide's own background as occupied", async () => {
  const report = await runQa(`<section class="slide l-free" style="background:#eee"><div class="bg" style="position:absolute;inset:0;background:#ddd"></div>${at("h2", 90, "Headline")}${at("p", 860, "Far below")}</section>`);
  assert.equal(deadSpace(report).length, 1);
});
