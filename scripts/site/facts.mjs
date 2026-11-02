/* Published numbers, read from the product so copy can't drift from it. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LAYOUTS, listThemes, parseSource } from "../../skills/decklume/scripts/build.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const { body } = parseSource(readFileSync(join(ROOT, "examples/sleep-and-memory/sleep-and-memory.deck.html"), "utf8"));
const slideClasses = [...body.matchAll(/<section\b[^>]*\bclass="([^"]*)"/g)]
  .map((m) => m[1].split(/\s+/))
  .filter((classes) => classes.includes("slide"));

export const FACTS = {
  version: JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version,
  themes: listThemes().length,
  // l-free is the escape hatch for hand-placed slides, not a tested layout.
  layouts: LAYOUTS.filter((l) => l !== "l-free").length,
  slides: slideClasses.length,
  showcaseLayouts: new Set(slideClasses.flat().filter((c) => LAYOUTS.includes(c))).size,
};
