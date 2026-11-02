/* Build the showcase lecture once per theme into qa-out/themes/. */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build, listThemes } from "../../skills/decklume/scripts/build.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = join(ROOT, "examples/sleep-and-memory/sleep-and-memory.deck.html");

export function buildThemeDecks() {
  const dir = join(ROOT, "qa-out/themes");
  mkdirSync(dir, { recursive: true });
  return listThemes().map(({ slug }) => {
    const out = join(dir, `${slug}.html`);
    build(SRC, { theme: slug, out, inline: true });
    return { slug, out };
  });
}
