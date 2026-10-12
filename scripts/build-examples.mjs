#!/usr/bin/env node
/* Build every examples/<name>/<name>.deck.html (and its theme variants). */
import { readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "../skills/decklume/scripts/build.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EX = join(ROOT, "examples");
let failed = 0;
for (const dir of readdirSync(EX, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  for (const f of readdirSync(join(EX, dir.name)).filter((f) => f.endsWith(".deck.html"))) {
    try {
      const r = build(join(EX, dir.name, f));
      console.log(`✓ ${dir.name}/${f} → ${r.slides} slides (${r.theme})`);
      r.warnings.forEach((w) => console.warn("  ⚠ " + w));
    } catch (e) {
      failed++;
      console.error(`✗ ${dir.name}/${f}: ${e.message}`);
    }
  }
}
process.exit(failed ? 1 : 0);
