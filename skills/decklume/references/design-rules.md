# Design rules

The engine enforces most of these. This file explains the ones that depend
on your choices of content and markup.

## Typography

- **Use the scale.** Headline sizes come from the layout. Never set a
  font size inline. If text is too long for its size, shorten or split it.
- **Accent with `<em>`, once.** One to three words per slide in the theme's
  accent treatment. Two accents on one slide cancel each other out.
- **Real typography characters:** curly quotes “ ” ‘ ’, apostrophe ’, en dash –
  for ranges (4–6), em dash — for breaks, × for multiplication, … for ellipsis,
  non-breaking space between a number and its unit when they must not split.
- **Numbers** go in `.num` / `.value` / `.big-number` for tabular, lining figures.
- No ALL-CAPS sentences. Eyebrows are already styled as small labels.
- No orphans in headlines: if a headline breaks with one word alone on the last
  line, reword it.

## Colour

- The theme has one accent. Use it for **one** thing per slide: the
  emphasised word, the highlighted bar, the winning column.
- Don't introduce new colours in deck CSS. Use tokens: `--c-ink`, `--c-ink-2`,
  `--c-ink-3`, `--c-accent`, `--c-surface`, `--c-line`.
- Text over images uses `l-bleed` (it adds a scrim) or a solid surface, never
  bare text on a busy photo.

## Layout

- Content lives inside the margins. The bottom margin holds the folio.
- Align to the grid the layout gives you. Don't nudge with `margin-top: 13px`.
- Empty space is a feature. A slide with one strong sentence beats a slide
  with five weak ones.

## Motion

Every theme defines its own motion personality (durations, easing, stagger).
You choose *what* moves:

- **Entrances** are automatic and staggered, and play once when a slide
  appears. Add `data-enter="none"` to a slide or element to keep it still.
- **Builds** (`class="step"`) are for argument order, not decoration.
- **Magic Move** (`data-morph`) is for continuity between consecutive slides.
  Keep the morphing element's text identical on both slides.
- Charts animate themselves. Everything respects `prefers-reduced-motion`.

## Charts

- One chart, one claim. The headline states what the chart proves; the
  highlight points at it.
- Prefer `bar` for comparisons, `line` for change over time, `hbar` for
  rankings or long labels, and `donut` only for parts of a whole.
- Round numbers to the precision the claim needs (31, not 30.87).
- Always include a `source` line for real-world data.

## Images

- Look at every image before using it. Check it's sharp enough for 1920×1080,
  relevant, and not watermarked.
- Crop with intent: `l-split` wants portrait or square images, `l-bleed` wants
  landscape with a calm area for text, `l-gallery` wants images of similar tone.
- Logos go on the title and closing slides only.

## Accessibility

- `alt` text on every meaningful image; `alt=""` on decorative ones.
- Contrast is checked by QA (WCAG AA). Fix failures with a different token
  or layout, not a lighter text colour.
- Don't encode meaning in colour alone. The highlighted bar also gets the
  headline that names it.

## Anti-slop checklist

Generated decks tend to share these tells. Avoid them:

- Purple-to-blue gradients, glassmorphism on everything, glowing blobs.
- Inter / Roboto / Arial / Poppins as the display face.
- Emoji as icons; rocket ships; "Unlock the power of…" headlines.
- Every slide a heading plus 3 bullets.
- Three-card grids where the cards say the same thing in different words.
- Stock phrases: "In today's fast-paced world", "Let's dive in", "game-changer".
- Decorative numbers with no source; percentages that don't add up.
