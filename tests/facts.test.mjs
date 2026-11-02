/* Published numbers must match the product: run with `node --test tests/` */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FACTS } from "../scripts/site/facts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");

test("every manifest carries the package.json version", () => {
  const { version } = JSON.parse(read("package.json"));
  assert.equal(FACTS.version, version);
  assert.equal(JSON.parse(read(".claude-plugin/plugin.json")).version, version);
  assert.match(read("CITATION.cff"), new RegExp(`^version: ${version.replaceAll(".", "\\.")}$`, "m"));
});

test("the showcase lecture uses every tested layout", () => {
  assert.equal(FACTS.layouts, 30);
  assert.equal(FACTS.showcaseLayouts, FACTS.layouts);
});

test("the README states the real layout and theme counts", () => {
  const readme = read("README.md");
  for (const [n] of readme.matchAll(/\b\d+(?= tested (?:slide )?layouts)/g)) assert.equal(Number(n), FACTS.layouts);
  for (const [n] of readme.matchAll(/\b\d+(?= designer themes)/g)) assert.equal(Number(n), FACTS.themes);
  for (const [n] of readme.matchAll(/\b\d+(?=-slide deck)/g)) assert.equal(Number(n), FACTS.slides);
});

test("site templates take their numbers from FACTS, not literals", () => {
  // Example prompts may ask for any slide count, so only the showcase's own count is banned.
  const literal = new RegExp(`\\b${FACTS.slides}[- ]slides?\\b|\\b\\d+ (?:\\w+ ){0,2}(?:layouts?|themes?)\\b|softwareVersion: "`, "i");
  for (const file of ["home", "pages", "content", "layout"]) {
    assert.doesNotMatch(read(`scripts/site/${file}.mjs`), literal, `${file}.mjs has a hard-coded number`);
  }
});
