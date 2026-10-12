# Plan: Decklume, a presentation skill built for design quality

Working name: **`atelier-slides`** (rename freely, it's only the folder and the `name:` field).

## 1. What we're competing with

`zarazhangrui/frontend-slides` (MIT) is about 3,000 lines across these parts:

| Part | What it does | Where it falls short |
|---|---|---|
| `SKILL.md` (380 lines) | 6-phase workflow: detect mode, discovery questions, 3 style previews, generate, PPTX convert, deploy/PDF | Elegance is mostly *asked for in prose* ("avoid AI slop", "be distinctive"). It sets few hard constraints, so quality varies from run to run. |
| `STYLE_PRESETS.md` + 34-template "bold pack" | Style recipes in Markdown (`design.md`, ~550 lines each) | Templates are written in `vw` units and the model must translate them to a 1920×1080 stage by hand, which is lossy. Only the title slide gets previewed, and every other slide type is improvised. |
| `viewport-base.css` | Fixed 16:9 stage that scales to fit | Solid baseline idea. |
| `animation-patterns.md` (110 lines) | Fade/slide/blur reveals, gradient/noise backgrounds | Entrance animations only. No transitions between slides, no shared-element morph, no step-by-step builds, no timing system. |
| `scripts/` | PPTX extraction, Vercel deploy, PDF via screenshots | The PDF is raster: big files with no selectable text. QA is "take screenshots" with no automated checks. |
| `deck-stage.js` | Speaker notes via JSON, keyboard nav | No presenter window, timer, next-slide preview or overview grid. |

**Where we can beat it:** move elegance out of adjectives and into **constraints, tested components and an automated quality gate**. A model follows a type scale, a grid and a lint script much more reliably than it follows "make it beautiful".

## 2. Design principles for our skill

1. **Elegance comes from constraints in code.** Typography, spacing, grid and motion come from tokens. The model picks values from those tokens and does not invent them.
2. **Story before style.** Lock the narrative (an assertion headline per slide) before any visuals are designed.
3. **Every theme is complete.** Fewer themes, each fully built for every slide archetype. No improvised content slides.
4. **Nothing ships unverified.** A Playwright QA pass must come back green before the deck is handed over.
5. **One file out.** The deliverable stays a single self-contained HTML file with no build step (same as the original, because it's a real strength).

## 3. Feature set (what "greater elegance" means concretely)

### 3.1 Design system core (`engine/tokens.css`)
- **Type scale:** a modular ratio (1.25 or 1.333, chosen per theme) at 1920×1080, with 6 sizes and nothing outside them.
- **Baseline grid** at 8px with a 12-column grid, fixed margins and safe areas, plus a debug overlay (press `G`).
- **Typographic finish:** `text-wrap: balance` on headlines and `pretty` on body text, hanging punctuation, curly quotes and real dashes, tabular figures for numbers, optical kerning, and a maximum line length of about 60 characters.
- **Colour:** each theme defines 1 dominant colour, 1 accent and a neutral ramp, all checked against WCAG AA. Light and dark variants are generated from the same tokens.
- **Curated font pairings:** about 15 vetted pairings from Google Fonts/Fontshare, each with a fallback stack and a metrics-matched `size-adjust` so text doesn't jump while fonts load.

### 3.2 Slide archetype library (`engine/archetypes/`)
About 20 tested HTML partials that every theme styles: title, section break, big statement, quote, image-full-bleed, image + text split, 2/3/4-up cards, comparison, timeline, process/steps, big number/KPI, chart, table, code, diagram, team/people, agenda, Q&A, closing/CTA. Each one documents its content limits (for example "max 4 cards, 18 words each"). The generator splits slides that go over those limits instead of shrinking the text.

### 3.3 Motion system (`engine/motion.js`, ~10 KB vanilla JS)
- **Timing tokens:** `--dur-1..4` and three named easings, with a stagger rule (≤ 6 items, 60–90 ms apart).
- **Slide-to-slide transitions** with the View Transitions API, including a **Magic-Move-style morph**: an element with the same `view-transition-name` on consecutive slides glides between them. This is the biggest visible upgrade over the original.
- **Builds/fragments:** bullets, chart series and diagram nodes reveal step by step on arrow press.
- **Per-theme motion personality** (calm, crisp, playful, cinematic) mapped to tokens.
- Full `prefers-reduced-motion` support: everything falls back to crossfades.

### 3.4 Visual kit
- **Charts:** a small SVG chart module (bar, line, donut, big-number sparkline) that reads theme tokens and animates on build. No chart library dependency.
- **Diagrams:** boxes, arrows and flows made from SVG primitives, auto-laid-out for simple flows.
- **Image treatments:** duotone, grain, masks/clip shapes, and Ken Burns on full-bleed images.
- **Icons:** an inline subset of an open icon set (Lucide or Phosphor), tree-shaken to the icons the deck uses.
- **Atmosphere:** grain, gradient mesh and pattern layers per theme, used sparingly.

### 3.5 Presenter experience (`engine/presenter.js`)
- **Presenter window** (`P`): current slide, next slide, notes, timer and clock, kept in sync with `BroadcastChannel`.
- **Overview grid** (`O`), jump to slide by number, deep links (`#/7`), and a progress bar.
- **Inline edit mode** (`E`), kept from the original.

### 3.6 Export
- **Vector PDF** through print CSS plus Playwright `page.pdf()`: selectable text and small files, with each build step's final state baked in. Keep screenshot PDF as a fallback.
- **PPTX export** (stretch goal): images with real speaker notes, for people who must hand over a `.pptx`.
- Deploy script kept (Vercel), plus an option for GitHub Pages.

## 4. Workflow (the `SKILL.md` phases)

| Phase | What happens | Improvement over the original |
|---|---|---|
| 0. Detect mode | New / convert PPTX/PDF/Markdown / enhance existing | Adds Markdown and PDF input |
| 1. Brief | One batch of questions: purpose, audience, length, density, brand assets | Same, plus brand assets |
| 2. **Storyline** | The model writes an outline: one assertion headline per slide plus the archetype it uses. The user approves it. | **New.** Content gets fixed before visuals. |
| 3. Style discovery | 3 directions shown on **one comparison page**, each as a title slide plus one content slide, using the user's real headlines | One page to compare instead of 3 tabs, and content slides are previewed too |
| 4. Generate | Assemble from engine + theme + archetypes. The model writes content and picks variants; it doesn't hand-write layout CSS. | Consistency comes from code |
| 5. **QA gate** | `scripts/qa.mjs` runs; fix and re-run until green; produce a contact sheet the model inspects visually | **New**, automated |
| 6. Deliver and export | Open the deck, list the shortcuts, offer PDF/URL/PPTX | Vector PDF |

**Brand mode:** if the user gives a logo or URL, extract its palette and fonts and generate a fourth "on-brand" direction.

## 5. QA gate (`scripts/qa.mjs`, Playwright)

The script checks every slide at 1920×1080 and at a phone viewport. It fails on:
- text overflowing its container, or elements overlapping (bounding-box intersection, not only `scrollHeight`)
- any font size below the theme minimum (24px for speaker-led decks, 20px for reading decks)
- contrast below WCAG AA
- web fonts failing to load (falling back to system fonts)
- leaked internal text ("template", "Option A", file paths, lorem ipsum)
- **slop lint:** banned fonts (Inter/Roboto/Arial as display faces), purple-on-white gradients, more than 3 accent colours, emoji used as icons

It outputs `qa-report.json` and `contact-sheet.png`, a grid of all slides for the model to review.

## 6. Themes

Start with **10 hand-built themes**, each complete across all 20 archetypes, rather than 34 prose recipes. Spread them across the mood space:

1. Editorial serif (magazine)
2. Swiss grid (precise, corporate)
3. Dark cinematic (keynote)
4. Warm paper (teaching, calm)
5. Brutalist mono (tech, dev)
6. Soft gradient glass (product launch)
7. Academic (research, dense data)
8. Bold colour-field (manifesto)
9. Japanese minimal (ma, whitespace)
10. Playful collage (workshops)

Each theme is a folder containing `theme.css` (tokens plus archetype overrides), `meta.json` (mood, formality, density, best_for/avoid_for) and `showcase.html` (all archetypes on one page, which also serves as the theme's test fixture).

## 7. Repo layout

```
atelier-slides/
├── SKILL.md                 # workflow; under ~300 lines, points to references
├── references/
│   ├── typography.md        # rules + pairings
│   ├── storyline.md         # assertion-evidence, narrative arcs
│   ├── motion.md            # tokens, morph usage, builds
│   └── archetypes.md        # content limits per archetype
├── engine/
│   ├── stage.css            # fixed 16:9 stage
│   ├── tokens.css
│   ├── archetypes/*.html
│   ├── motion.js
│   ├── presenter.js
│   └── charts.js
├── themes/<slug>/{theme.css, meta.json, showcase.html}
├── themes/index.json        # compact selection index
├── scripts/
│   ├── build.mjs            # inline engine+theme+content → single HTML
│   ├── qa.mjs
│   ├── export-pdf.mjs
│   ├── extract-pptx.mjs
│   └── deploy.mjs
├── evals/                   # benchmark briefs + results
└── docs/PLAN.md
```

**Key architectural choice:** `scripts/build.mjs` inlines the engine and the theme. The model writes only the slide *content markup* using archetype classes. That keeps output consistent and token-cheap. The trade-off is a Node dependency at generation time, which is acceptable because Playwright already needs Node.

## 8. Milestones

| # | Milestone | Done when |
|---|---|---|
| M1 | Engine skeleton: stage, tokens, nav, 6 core archetypes, 1 theme, `build.mjs` | A hand-written content file builds into a working deck |
| M2 | QA gate: `qa.mjs` + contact sheet | Catches seeded overflow, overlap, contrast and font failures |
| M3 | `SKILL.md` v1: brief → storyline → 3-way preview → generate → QA | End-to-end run on 3 test briefs |
| M4 | Motion: View Transitions morph, builds, reduced motion | Morph works in Chrome/Safari and degrades in Firefox |
| M5 | Full archetype set (20) + charts/diagrams kit | All archetypes pass QA in the base theme |
| M6 | 10 themes with showcases | Every theme's showcase passes QA |
| M7 | Presenter window, overview, edit mode | Works across two windows |
| M8 | Export: vector PDF, PPTX conversion in, deploy | PDF text is selectable and the file is under 3 MB for 15 slides |
| M9 | **Evaluation** (below) | Our skill wins the majority of blind comparisons |
| M10 | Polish: README with GIFs, gallery page, release | Installable with one command |

## 9. How we prove it's better (evaluation)

1. Write **12 benchmark briefs** covering pitch, lecture, conference talk, internal report, data-heavy, image-heavy, a PPTX conversion and a brand-provided deck.
2. Run both skills on each brief with the same model.
3. **Automated:** run our `qa.mjs` on *both* outputs and compare failure counts.
4. **Blind human rating:** show slides side by side with the origin hidden (randomise left/right). Score typography, layout, consistency, motion and overall preference. Aim for 3 or more raters.
5. Record results in `evals/RESULTS.md`, including the losses. That evidence is what makes "more elegant" a credible claim in the README.

## 10. Open decisions

- **Name:** keep `atelier-slides`?
- **Build step:** use a Node `build.mjs` (recommended, more consistent) or keep it pure "model writes the whole HTML" like the original (zero dependencies, but more variance)?
- **Originality:** every file is written for Decklume; no code is reused from other projects.
- **Scope of v1:** M1–M3 + M5 + 4 themes is a credible first release. Morph transitions (M4) are the headline feature, so bring them forward if a demo is needed early.
