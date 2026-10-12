# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

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
