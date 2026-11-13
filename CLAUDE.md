# Working on Decklume with Claude

Decklume is a Claude Code skill that turns a topic, notes or a PowerPoint into
one self-contained, animated HTML deck. This file is the standing brief for any
Claude session in this repo. Task briefs for planned work live in
[`docs/roadmap/`](docs/roadmap/README.md); start there when the user names a phase.

## Map

| Path | What it is |
| --- | --- |
| `skills/decklume/SKILL.md` | The workflow Claude follows when a user asks for a deck |
| `skills/decklume/references/` | Layout catalogue, design rules, motion, storyline, custom themes |
| `skills/decklume/engine/` | `tokens`, `base`, `layouts`, `stage`, `motion`, `charts` CSS + `charts.js`, `deck.js` runtime |
| `skills/decklume/themes/<slug>/` | `theme.css` + `meta.json` for each of the 13 themes |
| `skills/decklume/scripts/` | `build`, `qa`, `preview`, `export`, `extract-pptx`, `deploy`, `lib/browser.mjs` |
| `examples/` | Example decks: `*.deck.html` sources and built `*.html` |
| `examples/sleep-and-memory/` | The 33-slide showcase deck every theme is checked against |
| `scripts/` | Repo tooling: example/site builds, 13-theme QA, theme matrix, demo video |
| `scripts/site/` | Site templates; counts and version come from `facts.mjs` |
| `site/` | GitHub Pages output (built, committed) |
| `tests/` | `node:test` suites |

## Commands

```bash
npm test                 # all node:test suites (build, import, motion, runtime, qa, facts)
npm run build:examples   # rebuild every example deck
npm run qa:themes        # showcase deck in all 13 themes; must be 0 errors
npm run theme-matrix     # qa-out/theme-matrix.png: same slides across every theme
npm run build:site       # regenerate site/ (pages, demos, frames, social image)
node skills/decklume/scripts/build.mjs path/to/x.deck.html
node skills/decklume/scripts/qa.mjs path/to/x.html --out qa-out/x   # contact sheet + report
```

`npm run theme-matrix -- 1 7 8 17` picks other slides (1-based). Playwright
installs itself into `~/.cache/decklume` the first time a browser is needed.

## Git workflow (the user's standing instruction)

The user wants many small commits on `main` for their GitHub contribution graph.

1. Branch from an up-to-date `main` (`feat/…`, `fix/…`, `docs/…`, `build/…`).
2. One logical change per commit, Conventional Commits (`feat(themes): …`,
   `fix(runtime): …`, `build(site): …`). Split engine, theme, example, site
   rebuild and docs changes into separate commits.
3. Run `npm test` before each commit that touches code. Never commit on a red
   test; chained `&&` commands must actually stop on failure.
4. Push, open a PR with `gh pr create`, wait for CI, then merge with a
   **merge commit** (`gh pr merge --merge --delete-branch`), never squash, so
   every commit lands on `main`. Auto-merge is disabled on the repo.
5. `git switch main && git pull` afterwards.

Rebuilt artefacts (`examples/*.html`, `site/`) go in their own `build:` commits.

## Quality gates for any visual change

- `npm test` passes.
- `npm run qa:themes` reports **0 errors** in all 13 themes. Warnings
  (`dead-space`) should not increase; say so in the PR if they do.
- QA on every example deck: 0 errors (CI runs the same loop).
- Attach before/after `npm run theme-matrix` images to the PR.
- Look at the contact sheets yourself. Passing QA is necessary, not sufficient.
- Run `npm run build:site` when engine, theme or showcase changes would change
  the site's frames or demos, and commit the rebuild separately.

## Engine facts worth knowing

- Slides are 1920×1080. `deck.js` `fitDensity()` adds `.is-compact` to fitted
  layouts (`l-steps, l-stats, l-cards, l-timeline, l-compare, l-list, l-table,
  l-agenda, l-diagram, l-problem, l-chart`) when content would overflow; the
  compact rules sit at the end of `layouts.css`.
- QA `dead-space` warns on an empty vertical band over 194 px (18% of 1080).
  Title, section, statement, cover, bleed, closing, quote, kpi and define slides
  are exempt.
- Theme rules on cards must use `.slide.l-cards …`; a plain `.slide .card`
  rule loses on specificity.
- `<img data-themed src="x.svg">` is inlined at build time so the SVG can use
  `var(--c-*)` theme colours.
- Version and counts (themes, layouts, slides) come from
  `scripts/site/facts.mjs`; `tests/facts.test.mjs` fails on a stale number.
  Never hard-code "13 themes" or "30 layouts" in site templates.
- `references/custom-themes.md` says themes restyle and don't relayout. Phase 2
  deliberately relaxes that for five built-in themes; see its brief.

## Environment notes

- The shell is zsh: write `${var}` in strings and quote globs such as `'*.mjs'`.
- Python with numpy: `/opt/anaconda3/bin/python`. `ffmpeg` and `cwebp` are installed.
- A GateGuard hook may block the first Bash call or a new file. State the
  request and what the command does, then retry.
- `launch/`, `qa-out/`, `brag-output*/` and `.impeccable/` are git-ignored and
  local only. Don't commit launch drafts.

## Boundaries

- Ask before tagging a release, creating issues, or posting anywhere public.
  Publishing clicks (Hashnode, Reddit, Show HN, LinkedIn) stay with the user.
- Keep the user's email out of commits, requests and generated files.
