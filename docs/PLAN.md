# Decklume: design and architecture

This document explains how Decklume is put together and why. It is meant for
contributors. For usage, see the [README](../README.md); for the workflow Claude
follows, see [`SKILL.md`](../skills/decklume/SKILL.md).

## 1. The problem

When a model is asked to make slides "beautiful", the result varies from run to
run, because elegance is requested in prose and then improvised. Decklume moves
design quality out of adjectives and into **constraints, tested components and
an automated quality gate**. A model follows a type scale, a grid and a lint
script far more reliably than it follows "make it look good".

## 2. Principles

1. **Elegance comes from constraints in code.** Typography, spacing, grid and
   motion come from tokens. The model picks from them; it does not invent values.
2. **Story before style.** The narrative (one assertion headline per slide) is
   approved before any visual design happens.
3. **Every theme is complete.** Each theme is designed and tested across every
   layout. No content slide is improvised.
4. **Nothing ships unverified.** The QA gate must pass before a deck is handed over.
5. **One file out.** The deliverable is a single self-contained HTML file.

## 3. Architecture

```
skills/decklume/
├── SKILL.md            # the six-phase workflow Claude follows
├── references/         # storyline, layouts, design rules, motion, custom themes
├── engine/
│   ├── tokens.css      # type scale, spacing, colour roles, timing tokens
│   ├── stage.css       # fixed 1920×1080 stage that scales to any screen
│   ├── base.css        # typography and shared components
│   ├── layouts.css     # the 22 layout classes (l-title … l-closing, l-free)
│   ├── motion.css      # slide transitions, entrances and builds
│   ├── charts.css/js   # SVG charts from data attributes, no library
│   └── deck.js         # navigation, builds, Magic Move, presenter, overview, edit mode
├── themes/<slug>/      # theme.css (tokens + a few signature moves) and meta.json
└── scripts/
    ├── build.mjs       # inlines engine + theme + fonts into one HTML file
    ├── preview.mjs     # renders the user's own slides in three themes side by side
    ├── qa.mjs          # the design QA gate and contact sheet
    ├── export.mjs      # vector PDF and PNG per slide
    ├── extract-pptx.mjs# PowerPoint import, pure Node
    ├── deploy.mjs      # live link on Vercel
    └── lib/browser.mjs # installs Playwright once into ~/.cache/decklume
```

**Key choice: a build step.** The model writes only slide *content* as semantic
HTML with one layout class per slide. `build.mjs` inlines the engine, the theme
and the fonts. This keeps output consistent and cheap to generate. The cost is a
Node dependency at generation time, which is acceptable because the QA gate
already needs Node and Playwright.

## 4. Workflow

| Phase | What happens |
|---|---|
| 0. Detect | New deck, convert (`.pptx`, PDF, Markdown), edit an existing Decklume deck, or restyle another HTML deck |
| 1. Brief | One round of questions: purpose, audience, speaker-led or reading deck, length, assets |
| 2. Storyline | An outline with a layout and an assertion headline for every slide; the user approves it |
| 3. Style discovery | The user's title slide and two content slides rendered in three themes on one comparison page |
| 4. Build | Content written with layout classes, then `build.mjs` |
| 5. QA gate | `qa.mjs` must pass with zero errors; Claude then reviews the contact sheet |
| 6. Deliver | Open the deck; offer PDF, PNG or a live link |

## 5. Design system

- **Type scale:** a modular scale on the 1920×1080 stage with a fixed set of
  sizes; nothing is sized outside it.
- **Grid:** 12 columns with fixed margins and safe areas, plus an overlay (`G`).
- **Typographic finish:** balanced headlines, pretty body wrapping, tabular
  figures for numbers, and a capped line length.
- **Colour:** each theme defines colour roles that are checked against WCAG AA.
- **Motion:** timing and easing tokens per theme, a stagger rule for lists, and
  full `prefers-reduced-motion` support. PDF, PNG and QA always show the
  finished state of every slide.

## 6. QA gate

`qa.mjs` renders every slide in a real browser at 1920×1080 and at a phone
viewport. It fails the deck on overflow, clipped text, overlap, type below the
minimum size, contrast below WCAG AA, fonts that fail to load, leaked
placeholder text, broken images, a broken 16:9 stage and runtime errors. It
also flags common "AI slop" patterns, such as generic display fonts and emoji
used as icons. It writes a contact sheet of every slide for visual review.

CI runs the unit and browser tests and the QA gate on every example deck.

## 7. Themes

Ten themes, spread across the mood space: Folio (editorial), Nocturne (dark
cinematic), Grid (Swiss), Campus (academic), Atlas (consulting), Aurora
(product launch), Volt (brutalist terminal), Ma (Japanese minimal), Bloom
(playful) and Chalk (blackboard). Each theme is a `theme.css` plus a
`meta.json` describing mood, best uses and fonts. New themes must pass the QA
gate on the showcase deck (`examples/sleep-and-memory`); see
[CONTRIBUTING.md](../CONTRIBUTING.md).

## 8. Not yet built

These ideas came up during planning and remain open. They are tracked on the
README [roadmap](../README.md#roadmap):

- **PowerPoint export:** a `.pptx` with speaker notes.
- **Image treatments:** Ken Burns on full-bleed images, more masks and textures.
- **Icons:** an inline subset of an open icon set, limited to the icons a deck uses.
- **Benchmark:** a published set of briefs with blind side-by-side ratings
  against other slide skills.
