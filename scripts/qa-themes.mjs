#!/usr/bin/env node
/* =====================================================================
   Run the QA gate on the showcase lecture in every theme.
   Fails on any error; warnings are listed but don't fail the run.

   Usage: node scripts/qa-themes.mjs
   ===================================================================== */
import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import { ROOT, buildThemeDecks } from "./lib/theme-decks.mjs";

const QA = join(ROOT, "skills/decklume/scripts/qa.mjs");
const run = promisify(execFile);

async function qa(deck) {
  const args = [QA, deck, "--json", "--no-shots"];
  // qa.mjs exits 1 when a deck has errors, and still prints the report.
  const { stdout } = await run(process.execPath, args, { maxBuffer: 1 << 26 }).catch((e) => {
    if (!e.stdout) throw e;
    return e;
  });
  return JSON.parse(stdout);
}

let failed = 0;
for (const { slug, out } of buildThemeDecks()) {
  const report = await qa(out);
  console.log(`${report.passed ? "✓" : "✗"} ${slug.padEnd(11)} ${report.slides} slides · ${report.errors} error(s), ${report.warnings} warning(s)`);
  for (const x of report.issues.filter((i) => i.level === "error")) {
    console.log(`    slide ${x.slide ?? "-"} [${x.rule}] ${x.msg}`);
  }
  if (!report.passed) failed++;
}
if (failed) {
  console.error(`\n✗ ${failed} theme(s) failed QA`);
  process.exit(1);
}
