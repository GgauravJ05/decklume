# Known issues and leftovers

Small things found during Phases 0–1 that weren't fixed. Each is a short task;
pick one up between phases. Remove the entry in the PR that fixes it.

## Hypnogram stays light on dark themes

Slide 9 (`l-annotated`) shows `examples/sleep-and-memory/assets/hypnogram.svg`,
whose colours are hard-coded (a `#f7f5ef` card, `#d9d4c7` grid lines), so it
stays a light card on Nocturne, Volt, Blueprint and Aurora. Fix: recolour it with
`var(--c-*, fallback)` like `waves-*.svg` and add `data-themed` to the `<img>`.
Watch out: inlining sets `preserveAspectRatio="xMidYMid slice"`, which may crop
the chart and shift it under the numbered callouts, so the annotated layout may
need `meet` instead. Rebuild examples and site.

## `dead-space` warnings (21 across 13 themes)

`npm run qa:themes` passes with 0 errors but 21 warnings, mostly bands of about
200 px (just over the 194 px limit) in Atlas, Grid, Aurora, Campus and Volt.
Phase 2 will reshape several of these slides in Volt, Aurora and Campus, so fix
the rest after it. Goal: 0 warnings, or a deliberate exemption with a reason in
`qa.mjs`.

## Max-content stress test isn't in the repo

During Phase 1 a stress deck (maximum items, longest text, per layout) showed a
few overflows that also fail on `main`; compact mode fixed the regressions but
not those. Add it as `tests/fixtures/stress.deck.html` plus a test that builds
it in every theme and asserts 0 overflow errors, then fix what it finds.

## `layouts.css` is one 1,738-line file

Phase 4 planned to split it by layout if the build allows. `build.mjs` inlines
engine CSS, so a split needs the build to concatenate `engine/layouts/*.css` in
a fixed order. Worth doing before many Phase 2 PRs touch it, or skip it if
Phase 2 stays inside theme files.
