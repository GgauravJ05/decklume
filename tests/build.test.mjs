/* Build unit tests: run with `node --test tests/` */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build, parseSource, listThemes } from "../skills/decklume/scripts/build.mjs";

const tmp = () => mkdtempSync(join(tmpdir(), "decklume-"));
const deck = (front, body) => `---\n${front}\n---\n${body}`;

test("parseSource reads front matter and keeps the body", () => {
  const { meta, body } = parseSource(deck('title: "Hello: world"\ntheme: folio\nfolio: false', "<section class=\"slide l-title\"></section>"));
  assert.equal(meta.title, "Hello: world");
  assert.equal(meta.theme, "folio");
  assert.equal(meta.folio, false);
  assert.match(body, /^<section/);
});

test("parseSource tolerates a source without front matter", () => {
  const { meta, body } = parseSource("<section class=\"slide\"></section>");
  assert.deepEqual(meta, {});
  assert.match(body, /section/);
});

test("every theme ships meta.json with the required fields", () => {
  const themes = listThemes();
  assert.ok(themes.length >= 1);
  for (const t of themes) {
    for (const k of ["name", "tagline", "mood", "scheme", "best_for", "fonts", "font_families"]) assert.ok(t[k], `${t.slug} is missing ${k}`);
  }
});

test("build produces one self-contained file with SEO meta", () => {
  const dir = tmp();
  const src = join(dir, "talk.deck.html");
  writeFileSync(src, deck('title: Quarterly "Review"\ndescription: Numbers & plans', `
<section class="slide l-title"><h1>Hi</h1></section>
<section class="slide l-chart"><figure class="chart" data-type="bar" data-series="A:1,2"></figure></section>
<style>.x{color:red}</style>`));
  const r = build(src);
  const html = readFileSync(r.out, "utf8");
  assert.equal(r.slides, 2);
  assert.match(html, /^<!DOCTYPE html>/);
  assert.match(html, /<title>Quarterly &quot;Review&quot;<\/title>/);
  assert.match(html, /<meta name="description" content="Numbers &amp; plans">/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /DECKLUME · CHARTS/, "chart module is included when a chart is used");
  assert.match(html, /\.x\{color:red\}/, "author styles are kept");
  assert.match(html, /class="is-active slide l-title"/, "first slide starts active");
  assert.match(html, /--deck-name: &quot;Quarterly \\&quot;Review\\&quot;&quot;/, "folio name is escaped inside the style attribute");
  assert.doesNotMatch(html, /<link[^>]+stylesheet[^>]+\.css"/, "no external CSS besides fonts");
});

test("build omits the chart module when no chart is used", () => {
  const dir = tmp();
  const src = join(dir, "a.deck.html");
  writeFileSync(src, deck("title: A", '<section class="slide l-statement"><h2 class="statement">x</h2></section>'));
  const html = readFileSync(build(src).out, "utf8");
  assert.doesNotMatch(html, /DECKLUME · CHARTS/);
});

test("build warns about unknown layouts and missing assets", () => {
  const dir = tmp();
  const src = join(dir, "w.deck.html");
  writeFileSync(src, deck("title: W", '<section class="slide l-nope"><img src="missing.png" alt=""></section>'));
  const { warnings } = build(src);
  assert.ok(warnings.some((w) => w.includes('unknown layout "l-nope"')));
  assert.ok(warnings.some((w) => w.includes("missing asset: missing.png")));
});

test("build checks l-bento patterns and tile counts", () => {
  const dir = tmp();
  const src = join(dir, "b.deck.html");
  const tiles = (n) => '<article class="tile"><h3>T</h3></article>'.repeat(n);
  writeFileSync(src, deck("title: B", [
    `<section class="slide l-bento is-a"><div class="bento">${tiles(4)}</div></section>`,
    `<section class="slide l-bento is-c"><div class="bento">${tiles(4)}</div></section>`,
    `<section class="slide l-bento"><div class="bento">${tiles(4)}</div></section>`,
  ].join("\n")));
  const { warnings } = build(src);
  assert.ok(!warnings.some((w) => w.startsWith("slide 1:")), "is-a with 4 tiles is valid");
  assert.ok(warnings.includes("slide 2: l-bento is-c takes 5 tiles, found 4"));
  assert.ok(warnings.some((w) => w.startsWith("slide 3: l-bento needs a pattern class")));
});

test("--inline-assets embeds local images as data URIs", () => {
  const dir = tmp();
  writeFileSync(join(dir, "dot.svg"), '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
  const src = join(dir, "i.deck.html");
  writeFileSync(src, deck("title: I", '<section class="slide l-split"><figure class="media"><img src="dot.svg" alt=""></figure></section>'));
  const html = readFileSync(build(src, { inline: true }).out, "utf8");
  assert.match(html, /src="data:image\/svg\+xml;base64,/);
});

test("build rejects unknown themes and empty decks", () => {
  const dir = tmp();
  const src = join(dir, "e.deck.html");
  writeFileSync(src, deck("title: E\ntheme: does-not-exist", '<section class="slide l-title"></section>'));
  assert.throws(() => build(src), /Unknown theme/);
  writeFileSync(src, deck("title: E", "<p>no slides</p>"));
  assert.throws(() => build(src), /No <section/);
});

test("CLI scripts run when invoked through a symlinked install path", async () => {
  const { symlinkSync } = await import("node:fs");
  const { execFileSync } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const skill = join(fileURLToPath(new URL("..", import.meta.url)), "skills/decklume");
  const link = join(tmp(), "linked-skill");
  symlinkSync(skill, link, "dir");
  const themes = execFileSync(process.execPath, [join(link, "scripts/build.mjs"), "--list-themes"], { encoding: "utf8" });
  assert.ok(themes.trim().split("\n").length >= 10, "build.mjs printed the theme list");
  const imp = execFileSync(process.execPath, [join(link, "scripts/extract-pptx.mjs"), join(skill, "../../tests/fixtures/sample.pptx"), tmp()], { encoding: "utf8" });
  assert.match(imp, /Extracted 5 slides/);
});
