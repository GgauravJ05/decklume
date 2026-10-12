# Contributing to Decklume

Thanks for helping! Decklume grows best through **themes, layouts and example
decks**, and bug reports with a screenshot are gold.

## Setup

```bash
git clone https://github.com/GgauravJ05/decklume.git
cd decklume
npm test            # builds the examples and runs build + browser tests
```

Node 18+ is all you need. Playwright installs itself into `~/.cache/decklume`
the first time a browser is needed.

## Project layout

```
skills/decklume/
├── SKILL.md            # the workflow Claude follows
├── references/         # layouts, storyline, design rules, custom themes
├── engine/             # tokens, stage, base, layouts, charts, runtime (deck.js)
├── themes/<slug>/      # theme.css + meta.json
└── scripts/            # build, preview, qa, export, extract-pptx, deploy
examples/               # example decks (sources + built HTML)
site/                   # GitHub Pages landing page + live demos
tests/                  # node:test suites
```

## Adding a theme

1. Copy the closest theme folder in `skills/decklume/themes/` and rename it.
2. Edit `meta.json` (name, tagline, mood, best_for, avoid_for, fonts).
3. Set tokens in `theme.css` first; add at most two or three signature moves.
   Follow the safety rules in `references/custom-themes.md`.
4. Check it on the showcase deck. It must pass with zero errors:
   ```bash
   sed 's/^theme: folio/theme: YOUR-SLUG/' examples/sleep-and-memory/sleep-and-memory.deck.html > /tmp/t.deck.html
   cp -R examples/sleep-and-memory/assets /tmp/
   node skills/decklume/scripts/build.mjs /tmp/t.deck.html
   node skills/decklume/scripts/qa.mjs /tmp/t.html
   ```
   Then look at `/tmp/t.qa/contact-sheet.png`. Passing QA is necessary, not sufficient.
5. Add the slug to `ORDER` in `scripts/build-site.mjs` and run `npm run build:site`.
6. Open a PR with the contact sheet attached.

## Adding a layout

Layouts live in `engine/layouts.css` as `.l-NAME`. Add the class to `LAYOUTS` in
`scripts/build.mjs`, document markup and content limits in
`references/layouts.md`, use it in the showcase deck, and make sure every
theme still passes QA.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org):

```
feat(themes): add Harbor maritime theme
fix(runtime): keep embedded decks out of cross-window sync
docs(readme): add thesis defense example
```

Types: `feat`, `fix`, `perf`, `docs`, `test`, `build`, `ci`, `refactor`, `chore`.
Keep each commit to one logical change.

## Pull requests

- `npm test` passes and CI is green.
- Visual changes include before/after screenshots.
- New behaviour has a test in `tests/` where practical.
