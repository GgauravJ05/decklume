# Custom themes

Use a custom theme for the style-discovery wildcard, a brand, or a mix the user
asked for ("A's type with C's colours"). A custom theme is a folder with the
same two files as a built-in one, and it gets the same layouts, motion and QA.

```
.decklume/themes/<slug>/
├── meta.json
└── theme.css
```

Reference it from the deck with a path: `theme: ./.decklume/themes/<slug>`.
If the user wants to keep it, move the folder next to their deck.

## 1. Start from the closest built-in theme

Copy `SKILL_DIR/themes/<closest>/` and change it. Don't start from nothing:
the built-ins already solve dozens of details (section slides, cards, tables,
code, charts).

## 2. meta.json

```json
{
  "name": "Harbor",
  "tagline": "One line a person would understand.",
  "mood": ["calm", "maritime"],
  "formality": "medium",
  "density": "medium",
  "scheme": "light",
  "motion": "calm",
  "best_for": ["…"],
  "avoid_for": ["…"],
  "fonts": "https://fonts.googleapis.com/css2?family=…&display=swap",
  "font_families": ["Display Face", "Body Face"],
  "colors": { "bg": "#…", "ink": "#…", "accent": "#…" }
}
```

## 3. theme.css: set tokens first, then add signatures

Set the tokens in `:root` (see `SKILL_DIR/engine/tokens.css` for the full list):

- **Colour:** `--c-bg`, `--c-surface`, `--c-ink`, `--c-ink-2`, `--c-ink-3`,
  `--c-line`, `--c-accent`, `--c-accent-ink`, `--c-stage`, plus `--c-chart-1…4`
  and `--c-bar` for charts. `--c-ink-3` must still pass 4.5:1 on `--c-bg`.
- **Type:** `--f-display`, `--f-body`, `--f-mono` (always with fallbacks), weights
  `--fw-*`, tracking `--tr-*`, `--display-style` (normal/italic), `--em-style`,
  `--em-color`. Change sizes only as a whole scale (see Campus).
- **Shape:** `--radius`, `--radius-lg`, `--rule`.
- **Motion:** `--dur-1…4`, `--ease-out`, `--stagger`, `--enter-from`,
  `--vt-duration`.

Then add at most **two or three signature moves**: one recognisable device
that makes the theme its own. Examples from the built-ins:
Folio's hairline running heads and paper grain, Nocturne's outlined section
numerals and focus-pull entrance, Grid's full-cobalt section slides, Campus's
navy title panel.

## Choosing fonts

Pick from Google Fonts or Fontshare. Pair a display face with character
with a highly legible body face:

| Display | Body | Feel |
|---|---|---|
| Fraunces | Instrument Sans | Editorial, warm |
| Instrument Serif | Geist | Cinematic, quiet |
| Archivo (expanded) | Archivo | Swiss, rational |
| Newsreader | Source Sans 3 | Academic, clear |
| Bricolage Grotesque | IBM Plex Sans | Characterful tech |
| Gloock | Hanken Grotesk | Bold editorial |
| Shippori Mincho | Zen Kaku Gothic New | Japanese minimal |
| Syne | Manrope | Art/creative |
| DM Serif Display | DM Sans | Friendly classic |
| Unbounded | Onest | Product launch |

Never use Inter, Roboto, Arial, Helvetica or Poppins as the display face.

## Brand themes

Given a logo or brand guide:

1. Take the brand's primary colour as `--c-accent`. If text must sit on it,
   check `--c-accent-ink` contrast.
2. Build neutrals around it: tint the background toward the brand hue by 2–4%
   and use a near-black ink with the same hue.
3. Use the brand fonts if they're on Google Fonts; otherwise pick the closest
   pairing above and say so.
4. Put the logo on the title and closing slides only:
   `<img src="assets/logo.svg" alt="Brand" style="height:56px">`.

## Rules that keep custom themes safe

- **Never redefine a token in terms of a token you also redefine on the same
  element.** For example `.l-section { --c-bg: var(--c-accent); --c-accent: #fff }`
  makes the background white. Use literal colours when flipping a slide's palette.
- Keep layout properties (grid, columns, positions) out of themes. Themes
  restyle, they don't relayout.
- Hide screen-only textures in print (`@media print { … content: none }`) to
  keep PDFs small.
- Run the preview and QA exactly as for built-in themes.
- Decorative `.slide::before` textures must exclude bleed slides
  (`.slide:not(.l-bleed)::before`). `l-bleed` uses `::before` for the scrim
  that keeps text readable over photos.
