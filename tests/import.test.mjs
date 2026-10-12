/* PowerPoint import tests: run with `npm test` */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { extractPptx } from "../skills/decklume/scripts/extract-pptx.mjs";

const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), "fixtures/sample.pptx");
const out = mkdtempSync(join(tmpdir(), "decklume-pptx-"));
const slides = extractPptx(FIXTURE, out);

test("reads every slide in presentation order", () => {
  assert.deepEqual(slides.map((s) => s.title), ["R&D <Review>", "Highlights", "Trend", "Ranking", "Nested"]);
});

test("decodes XML entities in titles, subtitles and notes", () => {
  assert.equal(slides[0].subtitle, 'Q3 "results"');
  assert.equal(slides[0].notes, "Say hello & welcome.");
});

test("keeps bullet indent levels", () => {
  assert.deepEqual(slides[1].content[0].paragraphs, [{ text: "Revenue up", level: 0 }, { text: "Driven by EU", level: 1 }]);
});

test("turns a native line chart with two series into chart attributes", () => {
  const c = slides[2].content.find((x) => x.type === "chart");
  assert.equal(c.decklume_attrs["data-type"], "line");
  assert.equal(c.decklume_attrs["data-labels"], "2023,2024");
  assert.equal(c.decklume_attrs["data-series"], "Users:1.5,4; Teams:2,3");
});

test("recognises horizontal bar charts", () => {
  assert.equal(slides[3].content.find((x) => x.type === "chart").decklume_attrs["data-type"], "hbar");
});

test("finds text and images inside nested groups", () => {
  const s = slides[4];
  assert.ok(s.content.some((c) => c.type === "text" && c.paragraphs[0].text === "Inside a group"));
  assert.equal(s.images.length, 1);
  assert.ok(existsSync(join(out, s.images[0].path)));
});

test("rejects files that are not presentations", () => {
  assert.throws(() => extractPptx(fileURLToPath(import.meta.url), out), /zip/);
});
