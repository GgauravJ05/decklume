---
name: Decklume website
description: The contact sheet. Real slides on film-black sheets over print paper, marked up with grease pencil.
colors:
  paper: "#f1eee7"
  paper-white: "#faf8f3"
  paper-shade: "#e6e2d8"
  ink: "#0d0d0d"
  ink-2: "#3d3a35"
  ink-3: "#5c5850"
  line: "rgba(13, 13, 13, 0.14)"
  line-strong: "rgba(13, 13, 13, 0.32)"
  film: "#0d0d0d"
  film-2: "#1c1c1c"
  film-hole: "#3a3936"
  edge: "#b9b4a8"
  film-text: "#ece8df"
  film-muted: "#8f8a7f"
  red: "#e4362b"
  red-ink: "#b3261c"
  yellow: "#f2c230"
typography:
  display:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(52px, 6.6vw, 88px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(38px, 5vw, 68px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(30px, 3vw, 44px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  title-sm:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  wordmark:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.04em"
  lede:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(18px, 1.5vw, 21px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
  button:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
  mono-command:
    fontFamily: "Martian Mono, ui-monospace, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  mono-edge:
    fontFamily: "Martian Mono, ui-monospace, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.06em"
  hand:
    fontFamily: "Reenie Beanie, Bradley Hand, cursive"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: 1
rounded:
  frame: "2px"
  sheet: "3px"
  sm: "4px"
  md: "6px"
  menu: "8px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  strip-gap: "12px"
  sheet-gap: "clamp(10px, 1.2vw, 16px)"
  sheet-pad: "clamp(12px, 1.6vw, 22px)"
  band: "clamp(80px, 10vw, 144px)"
  band-head: "clamp(32px, 4vw, 56px)"
  column-gap: "clamp(24px, 3vw, 48px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.paper-shade}"
    textColor: "{colors.ink}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "8px 12px"
  nav-link-hover:
    backgroundColor: "{colors.paper-shade}"
    textColor: "{colors.ink}"
  nav-link-github:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "8px 12px"
  command:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    typography: "{typography.mono-command}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  command-copy-copied:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "9px 14px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  theme-pick:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "6px"
  theme-pick-selected:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
  contact-sheet:
    backgroundColor: "{colors.film}"
    rounded: "{rounded.sheet}"
    padding: "{spacing.sheet-pad}"
  frame-edge:
    textColor: "{colors.edge}"
    typography: "{typography.mono-edge}"
    padding: "6px 2px 0"
  print:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.frame}"
    padding: "12px 12px 8px"
  install-panel:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "clamp(28px, 5vw, 72px)"
  approve-pill:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 14px"
---

# Design System: Decklume website

## Overview

**Creative North Star: "The Contact Sheet"**

The site is a photographer's contact sheet of real slides. Print-paper ground, film-black sheets with sprocket rebates and Martian Mono edge numbers, and a grease pencil that circles the keeper. The interface is the light table around the film: achromatic paper and ink, heavy grotesk headlines, pill-shaped controls. Every hue on the page arrives either inside a frame (a real Decklume slide, rendered from the product's ten themes) or as a grease-pencil mark made by hand over the film.

Density is generous on paper and dense on film. Bands of paper open with big balanced headlines and let one dark artefact (a contact sheet, a viewer, a story stage, a QA bench) carry the section. Film carries many small frames at once; paper carries few words at a time. The slide engine and its ten themes under `skills/decklume/` are the product, not this system; their colours appear here only as pictures inside frames.

The world rejects the dark-gradient tool landing and the cream-serif editorial default: the ground is a cool-warm photo paper set in a heavy grotesk, never a serif.

**Key Characteristics:**
- Achromatic chrome: paper, ink and film; colour comes from slides in frames and from grease pencil.
- Film-black artefacts (sheets, strips, viewer, stage) with 12px sprocket rebates and mono edge numbers.
- Schibsted Grotesk at 800 with tight negative tracking for every heading.
- Grease-pencil marks: hand-drawn SVG strokes and Reenie Beanie notes in red and yellow, drawn on with a stroke animation.
- Pill controls on paper, near-square corners on film.

## Colors

Paper and ink for the chrome, film-black for the artefacts, and two grease-pencil colours used as marks, never as fills of the interface.

### Primary
- **Darkroom Ink** (`ink`): text, primary buttons, selected chips, the GitHub nav pill, rules under table heads (1.5px), install step counters. The one solid in the interface.

### Secondary
- **Grease-Pencil Red** (`red`): the circle around the keeper frame, QA finding marks, the focus ring (3px outline, 3px offset), link-hover underline colour, the text caret. A stroke colour; it never fills a button or a panel.
- **Red Ink** (`red-ink`): the legible text form of red, for hand notes on paper, failing QA results and rule names inside findings.

### Tertiary
- **Grease-Pencil Yellow** (`yellow`): marks drawn on film (the "keep this one" note and arrow on the hero sheet, terminal prompt and pass ticks in the story stage, the "approved" pill), text selection, the focus ring and link hovers inside the film-black colophon.

### Neutral
- **Print Paper** (`paper`): page ground and browser theme colour.
- **Fresh Print** (`paper-white`): raised paper surfaces: command fields, the enlargement print, the install panel, the mobile menu, selected theme picks.
- **Paper Shade** (`paper-shade`): hover fill for nav links, ghost buttons, copy buttons and player controls; inline code background; scrollbar track.
- **Ink 2 / Ink 3** (`ink-2`, `ink-3`): secondary prose and ledes; muted labels, legends, breadcrumbs, table heads.
- **Hairline / Strong Hairline** (`line`, `line-strong`): row dividers and theme-pick outlines; command borders, chip outlines, FAQ rules.
- **Film / Film 2 / Sprocket** (`film`, `film-2`, `film-hole`): sheet and viewer ground; image placeholder and dark pills; sprocket holes and dark-side dividers.
- **Edge Print** (`edge`): edge numbers, captions and table heads on film.
- **Film Text / Film Muted** (`film-text`, `film-muted`): body text on film (terminal, outline table, answers); colophon column heads and credit line.

### Named Rules
**The Colour Lives In The Frame Rule.** The chrome is achromatic. A hue appears only inside a slide frame or as a grease-pencil mark (stroke, hand note, focus ring, selection, tick). If a new component needs colour to work, it is the wrong component.

**The Red On Paper, Yellow On Film Rule.** Marks on paper use red (text form `red-ink`); marks drawn over film-black may use yellow, which is how the colophon and hero sheet keep their marks legible.

## Typography

**Display Font:** Schibsted Grotesk (with Helvetica Neue, Arial)
**Body Font:** Schibsted Grotesk (with Helvetica Neue, Arial)
**Label/Mono Font:** Martian Mono (with ui-monospace, Menlo) for commands, code and edge numbers
**Hand Font:** Reenie Beanie (with Bradley Hand) for grease-pencil notes only

**Character:** One heavy grotesk does all the speaking, from 88px headlines down to 13px labels; Martian Mono is the film's own printing, and Reenie Beanie is the hand holding the pencil.

### Hierarchy
- **Display** (800, clamp 52-88px, 0.9, -0.045em): the home hero headline, set as stacked lines. Inner page and theme heroes run the same voice at clamp(46px, 6.4vw, 92px) and clamp(56px, 7vw, 96px).
- **Headline** (800, clamp 38-68px, 0.98, -0.035em): band headings, FAQ, split bands, install panel. Closing headline scales to clamp(42px, 6vw, 88px).
- **Title** (800, clamp 30-44px): story steps, theme rows, prose h2 (to 40px); theme name in the switcher at 30px.
- **Title small** (800, 21-24px, -0.02em): audience links on film, definition terms, pager links; FAQ summaries at 700 20px.
- **Body** (400, 17px, 1.6): all running text; prose max 72ch, band intros 62ch, hero lede 54ch at clamp(18px, 1.5vw, 21px)/1.5.
- **Label** (600, 13-15px): nav (600 15px), legends, act labels, table heads, counts with tabular numerals. Sentence case throughout.
- **Mono edge** (Martian Mono 600, 11px, 0.06em; rebate 0.1em): frame edge codes (`FOLIO 01A`) and the colophon rebate, uppercase because film edge printing is.

### Named Rules
**The One Voice Rule.** Every heading is Schibsted Grotesk 800 with negative tracking and `text-wrap: balance`. No serif, no second display face.

**The Uppercase Belongs To Film Rule.** Uppercase letterspaced text exists only as edge printing in Martian Mono on film. Labels on paper are sentence case.

## Layout

A 1440px max container with a fluid gutter (clamp 16-56px). Pages are a stack of bands separated by clamp(80px, 10vw, 144px) of paper; each band has a heading block (max 780px) and one dominant artefact. Two-column splits use fractional grids with a minmax floor on the narrow column (switcher 1.65fr / min 300px, QA 1.5fr / min 300px, story 1.25fr / 1fr, FAQ 1fr / 1.6fr, docs 220px TOC / content).

Film strips are CSS grids of `--n` equal columns with a 12px gutter, a 12px sprocket rebate row above and below, and frames at 16:9. The hero sheet stacks strips at clamp(10px, 1.2vw, 16px) and seats the playable enlargement print in a 4fr / 2fr lower row.

Breakpoints: at 1100px, split layouts collapse to one column and the story stage moves above its steps as a sticky frame capped at 46vh. At 900px the nav becomes a toggle menu and hero strips become horizontal scroll-snap rows of 44% frames (72% for wide strips), with the circled keeper leading. At 560px the colophon, install steps and comparison table go single-column.

## Elevation & Depth

Paper is flat; film-black artefacts sit on it like prints on a light table. Depth comes from one long, soft print shadow under every sheet, viewer, stage and QA bench, and a stronger one under the enlargement print, which is also tilted 1deg as if taped down. Controls on paper are flat outlines (inset box-shadow rings, not borders) and only the primary button carries a small lift.

### Shadow Vocabulary
- **Print** (`box-shadow: 0 1px 2px rgba(13,13,13,0.12), 0 18px 40px -18px rgba(13,13,13,0.45)`): contact sheets, viewer, story stage, QA bench, tilted audience strip, mobile menu.
- **Enlargement** (`box-shadow: 0 2px 4px rgba(0,0,0,0.3), 0 24px 48px -16px rgba(0,0,0,0.6)`): the paper print holding the live deck.
- **Button lift** (`box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 6px 16px -8px rgba(13,13,13,0.6)`; hover `0 10px 22px -10px rgba(13,13,13,0.7)` with a 1px rise): primary button only.
- **Ring** (`box-shadow: inset 0 0 0 1.5px var(--ink)`): ghost buttons and current nav link; 1px `line` / `line-strong` rings for theme picks and chips; 2px ink ring for a selected theme pick.

### Named Rules
**The Light Table Rule.** Only film and prints cast shadows. Paper-side components are flat and separated by hairlines and rings.

## Shapes

Two corner languages, split by material. On paper, controls are pills (999px: buttons, nav links, chips, the approve pill) and fields are gently squared (6px commands and theme picks, 4px code, kbd and the install panel, 8px mobile menu). On film, everything is near-square: sheets and viewers 3px, frames and prints 2px, because photographic material does not round. Circles are reserved for icon controls (36px player buttons, 44px nav toggle), numbered step counters and the loupe. Borders are 1px hairlines for division and 1.5px ink rules for emphasis (table heads, theme info, install panel, points).

## Components

### Buttons
Tactile ink pills with a short physical response.
- **Shape:** full pill (999px), 48px tall, 22px side padding, 700 16px label with optional 20px stroke icon at a 10px gap.
- **Primary:** ink fill, paper text, button-lift shadow; hover rises 1px and deepens the shadow; active presses down 1px.
- **Ghost:** transparent with a 1.5px inset ink ring; hover fills with paper shade.
- **Focus:** global 3px red outline at 3px offset (yellow inside the colophon).
- **Disabled:** 40% opacity with a strong-hairline ring, no lift.

### Copyable command
The site's main call to action is a command, not a form.
- **Style:** fresh-print field, 1px strong-hairline border, 6px radius, Martian Mono 13px (15px in the large variant); lines break only at `/` and `@`.
- **Copy button:** attached on the right behind a hairline divider, 600 13px with a stroke icon; hover paper shade; after copying it inverts to ink with a check icon.

### Chips and theme picks
- **Chips:** pill, 9px 14px, 600 14px, 1px strong-hairline ring; selected inverts to ink on paper with no ring.
- **Theme picks:** 64px 16:9 thumbnail plus name in a 6px rounded tile with a 1px hairline ring; hover fresh-print; selected adds a 2px ink ring. State is `aria-pressed`.

### Cards / Containers
There are no generic cards. Containers are either film artefacts (contact sheet, viewer, story stage, QA bench: film ground, 3px radius, print shadow, fluid padding) or the one calm paper panel (install panel: fresh print, 1.5px ink border, 4px radius, clamp 28-72px padding). Lists are divided by hairline rows, not boxed.

### Navigation
- **Masthead:** wordmark (900 26px) left; pill links in ink 2 at 600 15px; hover paper shade; current page is an inset 1.5px ink ring; GitHub is a filled ink pill.
- **Mobile (900px and below):** a 44px ink circle toggles a fresh-print menu with a 1.5px ink border, 8px radius and print shadow.
- **Docs TOC:** sticky list with a 1.5px left rule; the current section takes an ink rule and 600 weight.
- **Colophon:** film-black footer opening with a mono rebate and a sprocket border, four columns of links in film text.

### Film strip and frame (signature)
A film-black grid of 16:9 frames between two 12px sprocket rebates (14x8px holes every 28px, `film-hole`). Each frame carries an edge caption: theme name left, frame number with "A" suffix right, in mono edge type. Linked frames scale to 1.025 and brighten 4% on hover over 0.35s. Strips may tilt (-1.5deg) when used as a standalone image beside a heading.

### Grease pencil (signature)
Hand-authored SVG paths (circle, arrow) with a 5px round stroke, non-scaling, drawn on with a `stroke-dashoffset` animation (0.7-1.1s, expo-out ease) when they enter. Paired with Reenie Beanie notes at 38-44px rotated -4 to -5deg. Used to choose (circle the keeper) and to find (QA defect marks), always `aria-hidden` and never the only carrier of meaning.

### Enlargement print and player
A fresh-print card tilted 1deg holding a 16:9 screen that swaps a poster for the live deck iframe (0.4s fade), with flat 36px circular controls, a tabular slide count and a truncated label.

### Story stage and QA bench
Film-black stages that play the product's workflow: stages cross-fade with a rise, slight scale and 6px blur (0.6-0.7s); text on film is Martian Mono in film text with yellow prompts and ticks. The QA bench pairs a specimen slide with a findings list whose rows move from hollow ring to red cross (found) to ink circle with yellow tick and strike-through (fixed).

## Do's and Don'ts

### Do:
- **Do** let real slide frames supply every colour on a page; keep chrome in paper, ink and film.
- **Do** set every heading in Schibsted Grotesk 800 with negative tracking (-0.02em to -0.045em).
- **Do** put film artefacts on the print shadow at 2-3px radius, and keep paper controls flat with inset rings.
- **Do** use grease pencil (red on paper, yellow on film) to point at a choice or a defect, drawn on once with the expo-out ease, and disabled under reduced motion.
- **Do** keep edge numbers at 11px or larger in Martian Mono 600.
- **Do** make the primary action a copyable command or an ink pill button.

### Don't:
- **Don't** fill buttons, panels or backgrounds with red or yellow; they are marks, not surfaces.
- **Don't** introduce a serif or a second display face; the world refuses the cream-serif editorial default.
- **Don't** build dark-gradient hero sections; dark appears only as film-black artefacts on paper.
- **Don't** add uppercase letterspaced labels on paper; uppercase is film edge printing only.
- **Don't** box content in generic rounded cards; divide with hairlines or put it on film.
