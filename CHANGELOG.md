# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] — 2026-10-24

Eight new layouts (30 in total) and three new themes (13 in total). The
showcase lecture grows to 33 slides and passes QA in every theme.

### Added
- Four layouts: `l-matrix` (2×2 quadrant on named axes), `l-tiers` (2–4
  plans with one recommended), `l-roadmap` (lanes across phases, bars placed
  with `at-N` / `span-N`) and `l-problem` (the pain, an arrow, the fix).
- Three themes: Blueprint (engineering drawing on a drafting grid),
  Broadsheet (newspaper front page) and Clinic (clean healthcare look with
  Atkinson Hyperlegible body text).
- The showcase lecture gains four slides (29 in total) covering the new layouts.
- `l-cover`: a magazine-cover opener with a masthead that scales to fill the
  width, an issue line, a cover story and 2–4 cover lines over a full-bleed
  photo; `is-split` puts the photo on the right. The showcase gains a
  take-home cover (30 slides).
- `l-bento`: a feature grid of one hero tile and 3–4 smaller tiles (text,
  number, image, quote, chart) in three fixed patterns (`is-a`, `is-b`,
  `is-c`). The build warns when the tile count does not match the pattern.
  The showcase gains a recap slide (31 slides).
- `l-annotated`: a screenshot or diagram with 3–6 numbered callouts. Pins
  sit at `data-at="x,y"` on the picture; each label is placed beside its
  pin's height and joined by a leader line that draws in with its build
  step. QA fails pins that touch and lines that cross; the build checks
  callout counts and points. The showcase gains a hypnogram slide
  (32 slides).
- `l-chart-story`: one bar, hbar or line chart beside 2–4 story steps.
  The chart starts plain; each step lights a category (`data-highlight`)
  and fades the rest, and one step can pin itself to an exact value
  (`data-point="Label"` or `"Series:Label"`) with a leader and dot. The
  build checks the chart type, step count, indexes and labels. The
  showcase gains a REM-per-cycle slide (33 slides).

### Fixed
- Edit-mode saves no longer write the cover masthead's fitted size into
  the source.
- The home page player counted 29 slides after the showcase grew; it now
  follows the slide list.

## [0.1.0] — 2026-10-12

First public release.

### Skill
- `SKILL.md` workflow: one-round brief → storyline approval with assertion
  headlines → side-by-side style discovery using the user's own slides →
  build → mandatory design QA gate → delivery with export and sharing.
- References for storyline, all layouts, design rules, motion and custom themes.
- Packaged as a Claude Code plugin marketplace; also installable as a
  standalone skill. Verified end to end with `/plugin marketplace add` and
  `/plugin install` in a clean environment.

### Engine
- Fixed 1920×1080 canvas that centres itself and scales as one unit.
- Design tokens, 22 slide layouts, SVG charts (bar, horizontal bar, line, donut).
- Ten themes: Folio, Nocturne, Grid, Campus, Atlas, Aurora, Volt, Ma, Bloom, Chalk.

### Motion
- Slide transitions: fade, push, rise, cover, zoom, wipe, iris, blur, flip,
  morph and none; per deck or per slide, reversed when navigating back.
- Magic Move, explicit (`data-morph`) or automatic (`data-transition="morph"`,
  `automorph: true`).
- Entrance presets including typewriter, count-up and SVG stroke drawing.
- Step builds with any entrance effect plus a highlight sweep.
- Code walkthroughs with `<pre data-lines="1-3|5">`.

### Presenting
- Keyboard, touch and deep-link navigation; overview; blackout; grid overlay.
- Presenter window with notes, timer and next slide.
- In-browser text editing that saves clean HTML.

### Tools (Node 18+, no other dependencies)
- `build.mjs`: compile a deck source into one self-contained HTML file.
- `qa.mjs`: automated design QA with a contact sheet (overflow, clipping,
  folio collisions, overlap, type size, WCAG contrast, fonts, placeholder
  text, images, JS errors, 16:9 on phones, AI-slop patterns).
- `preview.mjs`: side-by-side style comparison page.
- `export.mjs`: vector PDF with selectable text, or PNG per slide.
- `extract-pptx.mjs`: pure-Node PowerPoint import (text with bullet levels,
  tables, images, notes and native chart data).
- `deploy.mjs`: publish to Vercel, with a `--dry` preview.

### Examples and website
- Four example decks: a university lecture, an engineering talk, a thesis
  defense (fictional study, labelled) and a seed pitch (fictional company,
  labelled).
- Website with live demos of every theme and example, audience pages, docs and
  a comparison page, built as static HTML with structured data and a sitemap.

### Quality
- 33 automated tests (build, PowerPoint import, browser runtime, motion);
  CI runs builds, tests and design QA on every push.
