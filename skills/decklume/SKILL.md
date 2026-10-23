---
name: decklume
description: Create beautiful, animated HTML presentations — lectures, pitch decks, conference talks, thesis defenses, class projects — from a topic, notes, a document or a PowerPoint (.pptx). Outlines the story first, shows the user's own slides in three visual styles side by side, builds a single-file deck with Magic-Move transitions, step-by-step builds, charts and a presenter view, then verifies it with an automated design QA pass. Use whenever someone wants to make, convert, restyle or improve slides or a presentation.
---

# Decklume

Decklume turns content into a presentation that looks designed, not generated.
It does that with constraints, not adjectives: a fixed 1920×1080 canvas, a type
scale, a 12-column grid, 28 tested layouts, curated themes and a QA gate that
fails a deck on real defects. Your job is the story and the content. The engine
handles layout, typography and motion.

`SKILL_DIR` below means the directory containing this file. Every script uses
Node ≥ 18 built-ins only. QA, preview images and PDF export use Playwright,
which installs itself once into `~/.cache/decklume` (never into the user's
project).

## Non-negotiables

1. **Write slide content, not layout CSS.** Use the layout classes in
   [references/layouts.md](references/layouts.md). Never hand-position text with
   pixel values to make something fit. If it doesn't fit, split the slide.
2. **One idea per slide, and the headline says it.** Content slides get an
   assertion headline (a short claim), not a topic label: "Half the night is
   stage N2", not "Sleep stages".
3. **Show, don't ask about taste.** People choose a style by seeing their own
   slides rendered three ways, never from a list of adjectives.
4. **Nothing ships until `qa.mjs` passes** and you have looked at the contact
   sheet yourself.
5. **No internal text on slides.** Never put theme names, "Option A", file
   names, prompts or requirement notes ("bold option", "audience: VCs") on a slide.
6. **Never invent facts.** Statistics, dates, quotes and citations come from the
   user's material or from well-established knowledge you are sure of. If a slide
   needs a number you don't have, ask, or write the slide without it. Never
   fabricate a source line.

## Phase 0 — Detect the job

| The user has… | Mode | Start at |
|---|---|---|
| A topic, notes, an essay, a doc | **New deck** | Phase 1 |
| A `.pptx` | **Convert** | Run `node SKILL_DIR/scripts/extract-pptx.mjs deck.pptx .decklume/import`, read `extracted-slides.json`, then Phase 1 with that content. Native charts arrive as ready-made `decklume_attrs`. |
| A PDF or Markdown deck | **Convert** | Read it, treat it as notes, Phase 1 |
| An existing Decklume deck (`*.deck.html`) | **Edit** | Edit the source, rebuild, Phase 5 |
| Any other HTML deck to improve | **Restyle** | Extract its content into a new source, then Phase 1 |

Working files go in `.decklume/` next to the deck. Delete it at the end
unless the user wants to keep it.

## Phase 1 — Brief (one round of questions)

Ask everything you still need **in one message** (use the structured
question tool if available). Skip anything the user already told you.

1. **Purpose and audience.** Lecture or class, pitch, conference talk,
   thesis or research defense, internal review, workshop.
2. **Mode.** *Speaker-led* (few words, big type, the speaker carries it) or
   *reading* (self-contained slides people read without a speaker).
3. **Length.** Minutes or rough slide count. Default to about one slide per
   minute for talks.
4. **Assets.** Logo, brand colours, images, data, a template to match.

If the user gives images, look at every one. Decide which are usable, what each
shows, and design the outline around them (3 product screenshots means 3 feature
slides). Never use an image you haven't looked at.

## Phase 2 — Storyline (get it approved before any design)

Read [references/storyline.md](references/storyline.md). Write
`.decklume/outline.md` as a numbered table:

| # | Layout | Headline (assertion) | Content |
|---|---|---|---|

- Choose an arc that fits the purpose (lecture, pitch, research talk,
  update; see the reference).
- Each row names one layout from the layout reference. Vary them: avoid three
  identical layouts in a row, and use section, statement, KPI or quote slides as
  breathing room.
- Respect the content limits of each layout. Split rather than cram.
- Mark build steps (`step`) where a speaker reveals points one at a time,
  and plan one or two Magic Move pairs (`morph`) where the same element should
  travel between consecutive slides (a number, a title, an image).

Show the outline to the user as a compact table and ask: *"Does this story
work? Change anything before I design it."* Revise until they're happy.

## Phase 3 — Style discovery (three directions, their own content)

1. Run `node SKILL_DIR/scripts/build.mjs --list-themes --json` and choose
   **three genuinely different** directions for this audience and mood, using
   each theme's `mood`, `formality`, `density`, `scheme`, `best_for` and `avoid_for`:
   - **A safe fit:** the theme that best matches the brief.
   - **A contrast:** a different scheme or temperament (dark vs light, serif
     vs grotesk).
   - **A wildcard:** another built-in theme, *or* a custom theme designed for
     this deck when the brief has a sharper opportunity (a brand, a subject with
     its own visual culture). See [references/custom-themes.md](references/custom-themes.md).
   - If the user named a theme or a look, honour it as one of the three.
2. Write `.decklume/sample.deck.html` with the **title slide plus the two most
   representative content slides** from the approved outline, using real
   headlines and content.
3. Render the comparison:
   ```bash
   node SKILL_DIR/scripts/preview.mjs .decklume/sample.deck.html --themes a,b,c --png
   ```
   Look at `.decklume/preview/index.png` yourself. If a direction looks weak
   with this content, swap it before showing the user.
4. Open `.decklume/preview/index.html` for the user (`open` on macOS,
   `xdg-open` on Linux, `start` on Windows) and ask which direction they want:
   A, B, C, or a mix ("A's type with C's colours"). For a mix, create a custom
   theme from the closest one.

## Phase 4 — Build the deck

Write `<name>.deck.html` (front matter + slides) next to where the user wants
the deck, following [references/layouts.md](references/layouts.md) exactly.

```html
---
title: How Sleep Shapes Memory
description: One sentence for link previews and search.
author: Name
theme: folio
---
<section class="slide l-title">…</section>
<section class="slide l-list" data-dim>…</section>
```

- **Speaker notes:** `<aside class="notes">…</aside>` inside any slide. Write
  them for speaker-led decks. They appear in the presenter view.
- **Builds:** add `class="step"` to elements revealed one press at a time;
  `data-dim` on the slide dims earlier steps.
- **Magic Move:** give the same `data-morph="name"` to an element on two
  consecutive slides, or set `data-transition="morph"` to pair matching
  titles, numbers and images automatically.
- **Motion:** set a deck `transition:` in front matter (fade, push, rise,
  cover, zoom, wipe, iris, blur, flip, morph, none) and override it per slide
  with `data-transition`. Use `data-anim` for element entrances (rise, wipe,
  type, count, draw…), `data-anim` on `.step` for build effects (including
  `highlight`), and `<pre class="code" data-lines="1-3|5">` for code
  walkthroughs. Read [references/motion.md](references/motion.md); one deck
  default plus a few deliberate overrides.
- **Charts:** `<figure class="chart" data-type="bar|hbar|line|donut" data-labels="…" data-series="Name:1,2,3" data-highlight="2">`.
  Highlight the one data point the headline is about.
- **Images:** relative paths only (`assets/photo.jpg`). Every `<img>` gets
  meaningful `alt` text (`alt=""` for pure decoration).
- **Deck-specific CSS** is allowed in a `<style>` block for small touches
  that use theme tokens (`var(--c-accent)`). If you're writing a lot of it,
  use a different layout or a custom theme instead.

Then build:

```bash
node SKILL_DIR/scripts/build.mjs <name>.deck.html          # → <name>.html
```

Fix every build warning (unknown layout, missing asset, absolute path).

## Phase 5 — QA gate (mandatory)

```bash
node SKILL_DIR/scripts/qa.mjs <name>.html [--density reading]
```

- **Errors must reach zero.** They cover overflow, clipped text, safe-area
  collisions, overlapping text, type below the minimum size, WCAG contrast
  failures, web fonts that didn't load, leaked placeholder text, broken
  images, JS errors and non-16:9 scaling.
  Fix the cause: split the slide, shorten copy, change layout. Don't
  shrink type and don't hide the problem with `overflow: hidden`.
- **Read the contact sheet** (`<name>.qa/contact-sheet.png`) and look at it
  like a designer. Check rhythm and variety across slides, alignment, empty or
  overloaded slides, awkward line breaks in headlines, and widows. Open
  individual slides from `<name>.qa/slides/` where something looks off.
- Treat warnings as design feedback: crowding, missing alt text, long
  headlines and slop patterns.
- Rebuild and re-run until it passes. Delete the `.qa` folder afterwards.

## Phase 6 — Deliver

Open the deck for the user and tell them briefly:

- the file, its theme and slide count;
- **controls:** → / Space next, ← back, `O` overview, `P` presenter window
  (notes, timer, next slide), `F` fullscreen, `B` blackout, `E` edit text
  in the browser (⌘/Ctrl+S saves), `?` all shortcuts;
- that the deck is one self-contained HTML file. It works offline once fonts are
  cached and runs on any device. Use `--inline-assets` at build time to bake
  images into the file for easy sharing.

Then offer the next steps:

- **PDF** (vector, selectable text): `node SKILL_DIR/scripts/export.mjs <name>.html`
- **PNG per slide:** `node SKILL_DIR/scripts/export.mjs <name>.html --png`
- **Live link:** `node SKILL_DIR/scripts/deploy.mjs <name>.html` (Vercel), or
  any static host (GitHub Pages, Netlify Drop).

## Editing later

Users come back with "make slide 6 punchier" or "add a slide about X". Edit the
`.deck.html` source (never the built `.html`), rebuild, re-run QA. If the user
edited text in the browser with `E` and saved, their saved `.html` is now the
newest version. Copy those text changes back into the source before rebuilding.

## Reference files

| File | Read when |
|---|---|
| [references/storyline.md](references/storyline.md) | Phase 2: arcs, assertion headlines, pacing |
| [references/layouts.md](references/layouts.md) | Phases 2–4: every layout's markup and content limits |
| [references/design-rules.md](references/design-rules.md) | Phase 4: typography, colour, motion, charts, anti-slop |
| [references/motion.md](references/motion.md) | Phase 4: transitions, entrances, builds, code walkthroughs, recipes |
| [references/custom-themes.md](references/custom-themes.md) | Designing a wildcard, brand or mixed theme |
