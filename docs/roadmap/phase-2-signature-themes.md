# Phase 2: signature compositions for five themes

## Goal

Five themes become recognisable from their composition alone, with the colours
removed. Today most themes are reskins: elements sit in the same place in nearly
every theme, which contradicts what the README and site promise ("a theme is not
a colour swap"). Each of the five gets its own arrangement of the slides people
see most, tuned for one audience.

| Theme | Audience | Direction |
| --- | --- | --- |
| **Folio** | Students | Magazine: off-centre layouts, large serif type, captions in a margin column |
| **Chalk** | Teachers | Real blackboard: circled numbers, hand-drawn underlines, no card boxes |
| **Campus** | Researchers | Academic paper: "Fig. 1" captions, citation-style footnotes, a section rail |
| **Volt** | Developers | Terminal: prompt-style headings, stats as readouts, tile grid |
| **Aurora** | Founders | One giant number per metric slide, built for pitch rooms |

## Scope per theme

Each theme overrides these layouts and leaves the rest to the engine:

- `l-title` and `l-section`
- `l-stats` (and `l-kpi` where the direction calls for it)
- `l-cards`
- `l-chart` and `l-chart-story`

Showcase slides to check them on: 1 (title), 3 (section), 7 (steps), 8 (donut),
17 (stats), 25 (cards). Use `npm run theme-matrix -- 1 3 7 8 17 25`.

## Context a newcomer gets wrong

- **The "themes don't relayout" rule.** `skills/decklume/references/custom-themes.md`
  says to keep grid, columns and positions out of themes. That rule protects
  user-made themes. This phase relaxes it for these five built-ins only, under
  three conditions: the rules are scoped to the layouts listed above, the
  `.is-compact` fallback still works (test with maximum content), and all 13
  themes still pass QA. Update `custom-themes.md` in the first PR to say this
  plainly, so users know a signature theme may move things and their own themes
  should still not.
- **Specificity.** Engine rules like `.slide.l-cards .card` beat `.slide .card`.
  Match or exceed the engine selector rather than using `!important`.
- **Compact mode.** `deck.js` adds `.is-compact` when content overflows. A
  composition that fills the slide nicely at 3 cards can overflow at 4 cards
  with long text. Every override needs a `.is-compact` counterpart or must
  provably fit.
- **Decorative pseudo-elements.** `l-bleed` uses `::before` for its scrim.
  Theme textures must use `.slide:not(.l-bleed)::before`. Hide screen-only
  textures in `@media print`.
- **Fonts.** A theme may only use the families listed in its `meta.json`. If a
  direction needs a new face (Chalk's handwriting, Campus's serif), add it to
  `fonts` and `font_families` and check the PDF export.
- **Accessibility.** Hand-drawn or decorative marks are `aria-hidden` pseudo
  content; never put meaning only in decoration. Contrast must still pass QA.
- **Reduced motion.** Any new animation (Chalk's underline drawing on, Volt's
  cursor blink) must stop under `prefers-reduced-motion: reduce`.

## Work, per theme (one PR each, several commits)

1. Capture a "before" matrix: `npm run theme-matrix -- 1 3 7 8 17 25`, then copy
   `qa-out/theme-matrix.png` to `qa-out/<slug>-before.png`.
2. Sketch the composition for each of the five layouts in the PR description
   (a sentence each: what moves where and why it suits the audience). Show the
   user before writing CSS if the direction isn't obvious.
3. `feat(themes): <slug> title and section composition`
4. `feat(themes): <slug> stats composition`
5. `feat(themes): <slug> cards composition`
6. `feat(themes): <slug> chart composition`
7. Fix QA findings in their own `fix(themes): …` commits.
8. Build a max-content check: copy the showcase deck, give the stats, cards and
   chart slides their maximum item count with long text, build and QA it in this
   theme. It must reach 0 errors through compact mode.
9. `build: rebuild the example decks` and `build(site): …` for the theme page,
   demo and frames.
10. Update `meta.json` `tagline` if the new look changes what the theme is for,
    and add a line to the CHANGELOG's Unreleased section.

Order: Folio first (it is the site's default demo and the showcase theme), then
Volt, Aurora, Campus, Chalk.

## Acceptance

- [ ] With colours stripped (`filter: grayscale(1)` on the matrix), each of the
      five themes is distinguishable from the other twelve on slides 1, 17 and 25.
- [ ] `npm run qa:themes`: 0 errors in all 13 themes; `dead-space` warnings for
      the theme don't increase.
- [ ] The max-content deck passes QA with 0 errors in the theme.
- [ ] `npm test` passes; QA on every example deck has 0 errors.
- [ ] Checked by eye at 1920×1080, on a phone-width viewport, with keyboard
      navigation, with reduced motion, and as a PDF export.
- [ ] Before and after matrix images are in the PR.
- [ ] `custom-themes.md` explains the built-in exception (first PR only).

## Prompt

> Read `CLAUDE.md` and `docs/roadmap/phase-2-signature-themes.md`. Do the
> **Folio** signature composition. Start by capturing the before matrix and
> proposing the five compositions in a sentence each; wait for my OK, then
> implement with small commits, open a PR with before/after images, and merge
> it with a merge commit once CI is green.
