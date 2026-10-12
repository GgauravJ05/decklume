#!/usr/bin/env bash
# =====================================================================
# DECKLUME · DEPLOY
# Publish a deck to a public URL on Vercel (free tier).
#
#   bash deploy.sh talk.html          # single deck + the assets it uses
#   bash deploy.sh ./talk-folder/     # a folder containing index.html
#
# Re-running on the same deck updates the same URL.
# Adapted from frontend-slides/scripts/deploy.sh (MIT © 2025 Zara Zhang).
# =====================================================================
set -euo pipefail

ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }
info() { printf '\033[36m•\033[0m %s\n' "$*"; }
err()  { printf '\033[31m✗\033[0m %s\n' "$*" >&2; }

if [[ $# -lt 1 ]]; then
  err "usage: bash deploy.sh <deck.html | folder-with-index.html>"
  exit 1
fi

command -v node >/dev/null || { err "Node.js is required: https://nodejs.org"; exit 1; }

INPUT="$1"
ROOT_TMP="$(mktemp -d)"
STAGE="$ROOT_TMP/stage"
mkdir -p "$STAGE"
trap 'rm -rf "$ROOT_TMP"' EXIT

if [[ -f "$INPUT" && "$INPUT" == *.html ]]; then
  NAME="$(basename "$INPUT" .html)"
  SRC_DIR="$(cd "$(dirname "$INPUT")" && pwd)"
  cp "$INPUT" "$STAGE/index.html"
  # Copy every local file the deck references (src/href/poster/url()).
  node -e '
    const fs = require("fs"), path = require("path");
    const [file, srcDir, stage] = process.argv.slice(1);
    const html = fs.readFileSync(file, "utf8");
    const refs = new Set();
    for (const m of html.matchAll(/(?:src|href|poster)=["\x27]([^"\x27#?]+)/g)) refs.add(m[1]);
    for (const m of html.matchAll(/url\(["\x27]?([^"\x27)#?]+)/g)) refs.add(m[1]);
    let n = 0;
    for (const r of refs) {
      if (/^(https?:|data:|mailto:|\/)/.test(r)) continue;
      const from = path.join(srcDir, decodeURIComponent(r));
      if (!fs.existsSync(from) || fs.statSync(from).isDirectory()) continue;
      const to = path.join(stage, decodeURIComponent(r));
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      n++;
    }
    console.log(n);
  ' "$INPUT" "$SRC_DIR" "$STAGE" | { read -r n; info "Staged deck + $n asset(s)"; }
elif [[ -d "$INPUT" && -f "$INPUT/index.html" ]]; then
  NAME="$(basename "$(cd "$INPUT" && pwd)")"
  cp -R "$INPUT"/. "$STAGE/"
  info "Staged folder $INPUT"
else
  err "Expected an .html file or a folder containing index.html"
  exit 1
fi

# Vercel project names: lowercase letters, digits and dashes.
PROJECT="$(printf '%s' "$NAME" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g' | cut -c1-80)"
[[ -n "$PROJECT" ]] || PROJECT="decklume-deck"

if ! npx --yes vercel whoami >/dev/null 2>&1; then
  err "Not logged in to Vercel."
  echo "  1. Create a free account at https://vercel.com/signup"
  echo "  2. Run:  npx vercel login"
  echo "  3. Re-run this script."
  exit 1
fi

# Vercel names the project after the folder it deploys.
mv "$STAGE" "$ROOT_TMP/$PROJECT"
info "Deploying \"$PROJECT\" to Vercel…"
URL="$(cd "$ROOT_TMP/$PROJECT" && npx --yes vercel deploy --prod --yes 2>/dev/null | tail -1)"
if [[ "$URL" != https://* ]]; then
  err "Deploy failed. Run 'npx vercel deploy' in a folder with the deck to see the full error."
  exit 1
fi
ok "Live: $URL"
echo "  Presenter view: $URL/?presenter"
echo "  Works on any device. Re-run this script to update the same link."
