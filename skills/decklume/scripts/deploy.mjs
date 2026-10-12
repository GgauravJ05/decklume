#!/usr/bin/env node
/* =====================================================================
   DECKLUME · PUBLISH
   Puts a deck online with Vercel (free tier) and prints the link.

   Usage:
     node deploy.mjs talk.html          one deck + exactly the files it uses
     node deploy.mjs ./talk-folder      a folder that contains index.html
     node deploy.mjs talk.html --dry    stage only, print what would ship

   Publishing the same deck again updates the same link.
   ===================================================================== */
import { existsSync, statSync, readFileSync, mkdirSync, copyFileSync, cpSync, mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, basename, resolve, relative, sep } from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const input = args.find((a) => !a.startsWith("--"));
const say = (icon, msg) => console.log(`${icon} ${msg}`);
const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

if (!input) fail("usage: node deploy.mjs <deck.html | folder-with-index.html> [--dry]");
const src = resolve(input);
if (!existsSync(src)) fail(`Not found: ${input}`);

/* Every local file a deck points at: src/href/poster attributes and CSS url(). */
function localReferences(html) {
  const found = new Set();
  html = html.replace(/<script\b[\s\S]*?<\/script>/gi, ""); // inline runtime code is not markup
  const add = (u) => {
    const clean = u.split(/[?#]/)[0].trim();
    if (!clean || /^(?:[a-z]+:|\/\/|\/|#)/i.test(clean) || !/\.[a-z0-9]{2,5}$/i.test(clean)) return;
    found.add(decodeURIComponent(clean));
  };
  for (const m of html.matchAll(/\b(?:src|href|poster)\s*=\s*(["'])(.*?)\1/gi)) add(m[2]);
  for (const m of html.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi)) add(m[2]);
  return [...found];
}

/* --- Stage ---------------------------------------------------------------- */
const isFolder = statSync(src).isDirectory();
const name = (isFolder ? basename(src) : basename(src).replace(/\.html?$/i, ""))
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "decklume-deck";
const work = mkdtempSync(join(tmpdir(), "decklume-publish-"));
const stage = join(work, name);
mkdirSync(stage);
process.on("exit", () => rmSync(work, { recursive: true, force: true }));

{
  if (isFolder) {
    if (!existsSync(join(src, "index.html"))) fail(`${input} has no index.html`);
    cpSync(src, stage, { recursive: true });
    say("•", `Staged folder ${input}`);
  } else {
    if (!/\.html?$/i.test(src)) fail("Expected an .html deck or a folder");
    copyFileSync(src, join(stage, "index.html"));
    const base = dirname(src);
    let copied = 0;
    const missing = [];
    for (const ref of localReferences(readFileSync(src, "utf8"))) {
      const from = resolve(base, ref);
      if (!from.startsWith(base + sep)) continue; // never ship files from outside the deck folder
      if (!existsSync(from) || statSync(from).isDirectory()) { missing.push(ref); continue; }
      const to = join(stage, relative(base, from));
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(from, to);
      copied++;
    }
    say("•", `Staged deck + ${copied} asset(s)`);
    missing.forEach((m) => say("⚠", `referenced but missing: ${m}`));
  }

  if (dry) {
    const list = (d, p = "") => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? list(join(d, e.name), p + e.name + "/") : [p + e.name]));
    list(stage).forEach((f) => console.log("  " + f));
    say("✓", `Dry run: "${name}" would be published (nothing uploaded).`);
    process.exit(0);
  }

  /* --- Publish ------------------------------------------------------------ */
  const vercel = (cmdArgs, opts = {}) => spawnSync("npx", ["--yes", "vercel", ...cmdArgs], { encoding: "utf8", ...opts });
  if (vercel(["whoami"]).status !== 0) {
    console.error("✗ You're not signed in to Vercel yet.");
    console.error("  1. Create a free account: https://vercel.com/signup");
    console.error("  2. Run: npx vercel login");
    console.error("  3. Run this command again.");
    process.exit(1);
  }
  say("•", `Publishing "${name}"…`);
  const run = vercel(["deploy", "--prod", "--yes"], { cwd: stage });
  const url = (run.stdout || "").trim().split(/\s+/).reverse().find((t) => t.startsWith("https://"));
  if (run.status !== 0 || !url) fail(`Vercel didn't return a link.\n${(run.stderr || "").trim().split("\n").slice(-5).join("\n")}`);
  say("✓", `Live: ${url}`);
  console.log(`  Presenter view: ${url}/?presenter`);
  console.log("  Works on any device. Publish again to update the same link.");
}
