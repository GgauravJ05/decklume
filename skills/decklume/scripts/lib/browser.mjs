/* =====================================================================
   DECKLUME · BROWSER HELPER
   Finds Playwright, or installs it once into ~/.cache/decklume so user
   projects never get a node_modules folder. Also serves a deck over a
   tiny local HTTP server so fonts and relative assets resolve.
   ===================================================================== */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { join, resolve, extname, normalize, sep } from "node:path";
import { pathToFileURL } from "node:url";

const CACHE = process.env.DECKLUME_CACHE || join(homedir(), ".cache", "decklume");
const PW_VERSION = process.env.DECKLUME_PLAYWRIGHT || "1.64.0";

const unwrap = (mod) => (mod.chromium ? mod : mod.default);

async function importPlaywright() {
  // 1. Already resolvable (project or global install).
  try {
    return unwrap(await import("playwright"));
  } catch {}
  // 2. Our cache.
  const pkg = join(CACHE, "node_modules", "playwright", "package.json");
  if (!existsSync(pkg)) {
    mkdirSync(CACHE, { recursive: true });
    console.error(`• Installing Playwright ${PW_VERSION} into ${CACHE} (one time)…`);
    execFileSync("npm", ["install", "--prefix", CACHE, `playwright@${PW_VERSION}`, "--no-audit", "--no-fund", "--loglevel=error"], { stdio: "inherit" });
  }
  const req = createRequire(join(CACHE, "package.json"));
  return unwrap(await import(pathToFileURL(req.resolve("playwright")).href));
}

export async function launch() {
  const pw = await importPlaywright();
  try {
    return await pw.chromium.launch();
  } catch (e) {
    if (!/Executable doesn't exist|install/i.test(String(e.message))) throw e;
    console.error("• Downloading Chromium for Playwright (one time, ~150 MB)…");
    const cli = createRequire(join(CACHE, "package.json")).resolve("playwright/cli");
    execFileSync(process.execPath, [cli, "install", "chromium"], { stdio: "inherit" });
    return await pw.chromium.launch();
  }
}

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".gif": "image/gif", ".avif": "image/avif", ".woff2": "font/woff2", ".mp4": "video/mp4",
};

/** Serve `dir` on a random localhost port. Returns { url(file), close() }. */
export function serve(dir) {
  const root = resolve(dir);
  const server = createServer((req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
      const file = normalize(join(root, path));
      if (!file.startsWith(root + sep) && file !== root) throw new Error("outside root");
      if (!existsSync(file) || statSync(file).isDirectory()) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, { "content-type": TYPES[extname(file).toLowerCase()] || "application/octet-stream" });
      res.end(readFileSync(file));
    } catch {
      res.writeHead(400).end();
    }
  });
  return new Promise((ok) =>
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      ok({
        url: (rel) => `http://127.0.0.1:${port}/${rel.split(sep).map(encodeURIComponent).join("/")}`,
        close: () => new Promise((r) => server.close(r)),
      });
    })
  );
}

/** Put the deck in a static, final-state mode for capture. */
export async function freeze(page) {
  await page.addStyleTag({
    content: `.slide { transition: none !important; }
              .slide *, .slide *::before, .slide *::after { animation: none !important; transition: none !important; }
              .slide .step { opacity: 1 !important; transform: none !important; }
              .dl-hud, .dl-progress, .dl-toast { display: none !important; }`,
  });
  await page.evaluate(() => document.documentElement.classList.add("dl-static"));
}

/** Wait for web fonts, but never forever: a stalled font request must
 *  surface as a QA font error, not a hung process. */
export async function waitForFonts(page, timeoutMs = 15000) {
  await page.evaluate(
    (ms) => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, ms))]),
    timeoutMs
  );
}

/** Navigate and settle: load event, then a bounded wait for network idle. */
export async function open(page, url) {
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
}
