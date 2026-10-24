# Decklume roadmap: update versions

Working plan for what to build next, in priority order. Ranked by impact ÷
effort, with anything that unlocks later work or brings in users first.

Status keys: `[ ]` todo · `[~]` in progress · `[x]` done

## Where Decklume stands (as of 0.1.0 + unreleased)

- 30 layouts, 13 themes, all passing the QA gate on the 33-slide showcase.
- Already unique: themes and layouts as code, a browser QA gate, style
  discovery with the user's own slides, PowerPoint import, vector PDF.
- Runtime: presenter view, overview, edit mode, Magic Move, 4 chart types
  (bar, hbar, line, donut), deploy to a live link.

Build on those strengths; don't copy Gamma or Beautiful.ai.

---

## Step 0: Launch (hours, do first)

Nothing below matters if nobody can find or use the skill.

- [x] Make the repo public, so GitHub Pages deploys the site with all 13 themes.
- [x] Post the LinkedIn release video (`brag-output-2026-10-21-131823/`).
- [x] Check that install through the Claude Code plugin marketplace works
      (`.claude-plugin/`), and put the install line at the top of the README.

---

## v0.2 "Look": every deck looks premium and on-brand

### 1. Layout batch (1–2 days)

Raises the visual quality of every deck. Same pattern as the last batch:
CSS in `engine/layouts.css` → `LAYOUTS` in `scripts/build.mjs` → markup and
limits in `references/layouts.md` → showcase slides → QA in all themes →
update counts in README / site / tests.

- [x] **`l-bento`**: the Apple-keynote feature grid. One hero tile plus 3–4
      smaller tiles of different sizes (number, image, quote, chart). Fixed
      patterns (`is-a`, `is-b`, `is-c`) so the model never invents a grid.
- [x] **`l-annotated`**: a screenshot or diagram with numbered callouts and
      leader lines that draw in one at a time. QA checks labels don't overlap.
- [x] **`l-chart-story`**: one chart that builds across steps: baseline,
      then highlight, then an annotation pinned to an exact data point.
      Prerequisite for v0.4 source-locked numbers.
- [x] **`l-cover`**: magazine-cover opener (masthead, big image, cover lines,
      issue/date line), interpreted differently by each theme.

Later layout ideas (next batch):

| Layout | Idea |
|---|---|
| `l-hero-stat` | Full-bleed photo with one huge number on top |
| `l-before-after` | Two images with a wipe divider; draggable live, stepped in PDF |
| `l-cycle` | Flywheel: 3–6 nodes on a circle, curved arrows, active node highlighted |
| `l-kinetic` | Kinetic typography for a thesis statement; PDF shows the final state |
| `l-logos` | Logo wall, each logo normalised by visual area, not width |
| `l-index` | Magazine contents page with section numbers and links to slides |

### 2. Brand from a URL (2–3 days)

- [ ] "Make it look like example.com" / "use our website": read the site's
      colours, fonts and logo → generate `.decklume/themes/<slug>/` →
      run it through QA before use.
- [ ] Builds on `references/custom-themes.md` and the QA gate; check contrast
      of `--c-ink-3` and `--c-accent-ink` automatically.

---

## v0.3 "Share": decks travel beyond the meeting room

### 3. Deck → narrated video (3–5 days)

- [ ] One command exports an MP4: speaker notes become the voiceover, the
      motion engine drives the timing, the look follows the theme.
- [ ] Reuse the frame-perfect renderer and audio pipeline from the brag video.
- [ ] Formats: 16:9, square, vertical.

### 6. One source, three cuts (2–3 days)

- [ ] The same storyline builds a speaker deck (sparse), a reading/handout
      deck (denser, `reading` density already exists) and a 5-minute
      lightning version. Each cut passes QA.
- [ ] Mostly workflow changes in `SKILL.md`.

---

## v0.4 "Work": ready for offices, universities and research

### 4. Editable PPTX export (1–2 weeks)

- [ ] Export real, editable PowerPoint (native text boxes and shapes, not
      images). Removes the biggest adoption blocker: "I need a .pptx".
- [ ] Mirror of `scripts/extract-pptx.mjs`, which already parses PPTX.

### 5. Source-locked numbers + data import (~1 week)

- [ ] CSV / Excel → chart slides with assertion headlines.
- [ ] Every number on a slide links to its source cell; headline claims are
      checked against the data; QA flags figures without a source.
- [ ] Depends on `l-chart-story` (v0.2).

### 7. Accessibility certificate (3–4 days)

- [ ] Extend the QA gate: colour-blind simulation, reading order, alt-text
      coverage, tagged PDF. Stamp "WCAG AA" on the export.

---

## Small polish (do between bigger items)

- [ ] **8a.** Live theme switcher in the deck runtime (`T` key).
- [ ] **8b.** Rehearsal pacing in presenter view: target time per slide from
      note length, a pacing bar, optional mic practice (words per minute,
      filler words).

## Later

- [ ] **9.** Visual diff between deck versions (side-by-side contact sheet).
- [ ] **10.** Live audience mode: QR code on the slide, phone polls and quick
      quizzes, results animate onto the slide. Needs a backend and hosting,
      so it waits until users ask for it.

---

## Summary

| # | Item | Effort | Release |
|---|---|---|---|
| 0 | Launch: public repo, site, LinkedIn, marketplace | hours | now |
| 1 | Layout batch: bento, annotated, chart-story, cover | 1–2 days | v0.2 |
| 2 | Brand from a URL | 2–3 days | v0.2 |
| 3 | Deck → narrated video | 3–5 days | v0.3 |
| 4 | Editable PPTX export | 1–2 weeks | v0.4 |
| 5 | Source-locked numbers + data import | ~1 week | v0.4 |
| 6 | One source, three cuts | 2–3 days | v0.3 |
| 7 | Accessibility certificate | 3–4 days | v0.4 |
| 8 | Theme switcher, rehearsal pacing | 1–2 days | anytime |
| 9 | Visual diff between versions | 2–3 days | later |
| 10 | Live audience mode | 1–2 weeks | later |

Order of priority: **looks first** (what people screenshot and share),
**sharing second** (brings new users), **work-readiness third** (keeps them).
