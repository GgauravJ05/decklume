# Layouts

Every slide is `<section class="slide l-NAME">`. The layout class decides the
grid. The theme decides how it looks. Copy the markup and keep to the limits.
When content exceeds a limit, **split the slide**, don't shrink it.

Shared pieces you can use inside most layouts:

| Markup | Use |
|---|---|
| `<header><p class="eyebrow">…</p><h2>…</h2></header>` | Standard slide head: a short label + the assertion headline |
| `<p class="lead">` | One larger supporting sentence |
| `<p class="muted">` | Secondary body text |
| `<p class="source">` | Source line for a number or quote |
| `<em>` in a headline | The theme's accent treatment. Use it on 1–3 words, at most once per slide |
| `<mark>` | Highlighter on a key phrase in body text |
| `class="step"` | Revealed one press at a time (`data-dim` on the slide dims earlier steps) |
| `data-morph="key"` | Magic Move: glides to the element with the same key on the next slide |
| `data-transition="push"` on a slide | How this slide arrives (see references/motion.md) |
| `data-anim="count"` | Entrance effect for one element (rise, wipe, type, count, draw…) |
| `<pre class="code" data-lines="1-3|5">` | Code walkthrough: one range focused per press |
| `<aside class="notes">` | Speaker notes (presenter view only) |
| `class="no-folio"` on a slide | Hide the page number / deck name footer |

Headline length: **≤ 8 words** on speaker-led slides, **≤ 12** on reading slides.

---

## l-title — opening slide

```html
<section class="slide l-title">
  <p class="eyebrow"><span>Course or event</span><span>Date or session</span></p>
  <h1>Title with one <em>accent</em> word</h1>
  <p class="lead">One-sentence promise of the talk.</p>
  <footer class="byline"><span>Speaker name</span><span>Role · Organisation</span></footer>
</section>
```
Limits: title ≤ 7 words; lead ≤ 20 words; byline ≤ 3 spans.

## l-section — chapter divider

```html
<section class="slide l-section">
  <p class="kicker">02</p>
  <h2>Section question or <em>claim</em></h2>
  <p class="lead">Optional one-line framing.</p>
</section>
```
Use one section slide per major part (3–5 per deck), not before every slide.

## l-statement — one big sentence

```html
<section class="slide l-statement">
  <h2 class="statement">The best study session ends with <em>going to bed.</em></h2>
</section>
```
≤ 12 words. Add `class="statement is-long"` for 13–20 words. Use for the
thesis, a turning point or the closing message.

## l-quote

```html
<section class="slide l-quote">
  <blockquote>
    <p>The quote itself, without quotation marks.</p>
    <footer><cite>Person</cite>, role or source, year</footer>
  </blockquote>
</section>
```
≤ 30 words. Only real, attributable quotes.

## l-list — heading left, points right

```html
<section class="slide l-list" data-dim>
  <header><p class="eyebrow">Label</p><h2>Assertion headline</h2></header>
  <ol class="points">              <!-- or <ul class="points"> -->
    <li class="step"><strong>Point title.</strong> One supporting sentence.</li>
  </ol>
</section>
```
Speaker-led: 3 points, ≤ 15 words each. Reading: up to 5. Add `is-stacked`
(`class="slide l-list is-stacked"`) to put the heading on top and points in two
columns (4–6 short points).

## l-cards — 2 to 4 parallel ideas

```html
<section class="slide l-cards">
  <header><p class="eyebrow">Label</p><h2>Assertion headline</h2></header>
  <div class="cards">
    <article class="card"><span class="card-index">01</span><h3>Title</h3><p>≤ 20 words.</p></article>
    <article class="card is-highlight">…</article>
  </div>
</section>
```
2–4 cards; ≤ 20 words each; at most one `is-highlight`. Optional
`<p class="card-foot">` for a metric or link at the bottom.

## l-split — image + text

```html
<section class="slide l-split">           <!-- is-reverse: image right · is-inset: framed image -->
  <figure class="media"><img src="assets/photo.jpg" alt="What it shows"></figure>
  <div class="body">
    <p class="eyebrow">Label</p>
    <h2>Assertion headline</h2>
    <p class="muted">≤ 45 words of explanation.</p>
  </div>
</section>
```
The image bleeds to the slide edge unless `is-inset`. Use a portrait or
square-ish image. Add `duotone` to `.media` for a theme-tinted treatment.

## l-bleed — full-bleed image with a caption

```html
<section class="slide l-bleed">
  <img class="bg" src="assets/photo.jpg" alt="">
  <p class="eyebrow">Label</p>
  <h2>Short line over the image</h2>
</section>
```
≤ 10 words. The image needs a darker lower third (a scrim is added automatically).

## l-compare — two options side by side

```html
<section class="slide l-compare">
  <header><p class="eyebrow">Label</p><h2>A vs. B, as a claim</h2></header>
  <div class="columns">
    <div class="col"><h3>Option A</h3><ul class="points"><li>…</li></ul></div>
    <span class="vs">vs</span>
    <div class="col is-highlight"><h3>Option B</h3><ul class="points"><li>…</li></ul></div>
  </div>
</section>
```
2–4 points per side, parallel in wording. Highlight the winner.

## l-timeline — 3 to 6 moments

```html
<section class="slide l-timeline">
  <header><p class="eyebrow">Label</p><h2>Headline</h2></header>
  <ol class="timeline">
    <li><span class="when num">1924</span><h3>Short title</h3><p>≤ 12 words.</p></li>
    <li class="is-current">…</li>
  </ol>
</section>
```

## l-steps — numbered process, 3 to 5 steps

```html
<section class="slide l-steps">
  <header><p class="eyebrow">Label</p><h2>Headline</h2></header>
  <ol class="steps">
    <li><h3>Step title</h3><p>≤ 18 words.</p></li>
  </ol>
</section>
```

## l-kpi — one big number

```html
<section class="slide l-kpi">
  <p class="eyebrow">Label</p>
  <p class="big-number num">87<span class="unit">%</span></p>
  <p class="lead">What the number means, in one sentence.</p>
  <p class="source">Source: …</p>
</section>
```
The number ≤ 6 characters. Always say what it means and where it is from.

## l-stats — 2 to 4 numbers

```html
<section class="slide l-stats">
  <header><p class="eyebrow">Label</p><h2>Headline</h2></header>
  <div class="stats">
    <div class="stat is-highlight"><p class="value num">3.2×</p><p class="label">≤ 8 words of meaning</p></div>
  </div>
</section>
```

## l-chart — a chart and its takeaway

```html
<section class="slide l-chart">          <!-- is-wide: chart spans the full width -->
  <header><p class="eyebrow">Label</p><h2>The claim the chart proves</h2></header>
  <figure class="chart" data-type="bar" data-labels="2022,2023,2024"
          data-series="Revenue:12,19,31" data-unit="M" data-prefix="$" data-highlight="2"
          aria-label="Revenue by year"></figure>
  <div class="takeaway">
    <p>The one sentence to remember.</p>
    <p class="source">Source: …</p>
  </div>
</section>
```
Types: `bar`, `hbar` (long labels, rankings), `line` (trends, up to 4 series),
`donut` (parts of a whole, ≤ 5 parts; `data-center` overrides the centre label).
Multiple series: `data-series="A:1,2,3; B:2,3,4"`. ≤ 8 categories.
`data-highlight` is the 0-based index of the bar or slice the headline is about.

## l-table

```html
<section class="slide l-table">
  <header><p class="eyebrow">Label</p><h2>Headline</h2></header>
  <table class="data">
    <thead><tr><th>Item</th><th class="n">Value</th></tr></thead>
    <tbody><tr class="is-highlight"><td>…</td><td class="n">42</td></tr></tbody>
  </table>
</section>
```
≤ 6 rows × 5 columns speaker-led; ≤ 9 rows reading. `class="n"` right-aligns numbers.

## l-code

```html
<section class="slide l-code">           <!-- is-stacked: heading above code -->
  <header><p class="eyebrow">Label</p><h2>What the code shows</h2><p class="muted">One line.</p></header>
  <pre class="code"><code>…</code></pre>
</section>
```
≤ 14 lines, ≤ 60 characters per line. Wrap a line in `<mark>` to highlight it.
Optional token colours: `<span class="tok-k">` keyword, `tok-s` string,
`tok-n` number, `tok-f` function, `tok-c` comment. Escape `<` as `&lt;`.

## l-diagram — left-to-right flow

```html
<section class="slide l-diagram">
  <header><p class="eyebrow">Label</p><h2>Headline</h2></header>
  <div class="flow">
    <div class="node"><strong>Stage</strong>≤ 6 words</div>
    <div class="node is-highlight"><strong>Key stage</strong>…</div>
  </div>
</section>
```
3–5 nodes. Arrows are drawn automatically.

## l-people — 2 to 4 people

```html
<section class="slide l-people">
  <header><p class="eyebrow">Label</p><h2>Headline</h2></header>
  <div class="people">
    <figure class="person"><img src="assets/ana.jpg" alt="Ana Ruiz"><figcaption><strong>Ana Ruiz</strong><span class="caption">Role</span></figcaption></figure>
    <figure class="person"><div class="avatar">JK</div><figcaption>…</figcaption></figure>
  </div>
</section>
```
Use `.avatar` with initials when there is no photo.

## l-agenda

```html
<section class="slide l-agenda">
  <header><p class="eyebrow">Today</p><h2>Headline</h2></header>
  <ol class="agenda">
    <li class="is-current">Topic <span class="time">5 min</span></li>
  </ol>
</section>
```
3–6 items. Repeat the agenda between sections with `is-current` moved on.

## l-define — a term and its meaning (teaching)

```html
<section class="slide l-define">
  <p class="term">Consolidation</p>
  <p class="pron">/kənˌsɒlɪˈdeɪʃən/ · noun</p>
  <p class="meaning">≤ 25-word definition.</p>
  <p class="example">“An example sentence or analogy.”</p>
</section>
```
Formulas: write native MathML (`<math display="block">…</math>`) in the meaning or example.

## l-gallery — 2 to 4 images

```html
<section class="slide l-gallery">
  <header><p class="eyebrow">Label</p><h2>Headline</h2></header>
  <div class="gallery">
    <figure><img src="assets/a.jpg" alt="…"><figcaption>≤ 10 words</figcaption></figure>
  </div>
</section>
```

## l-closing

```html
<section class="slide l-closing">
  <h2>Thank <em>you.</em></h2>
  <ul class="contact">
    <li><strong>Email</strong>name@example.com</li>
    <li><strong>Slides</strong>example.com/talk</li>
  </ul>
</section>
```
End on the call to action or key message rather than a bare "Questions?".

## l-problem — the pain, then the fix

```html
<section class="slide l-problem">
  <header><p class="eyebrow">Label</p><h2>Headline about the problem</h2></header>
  <div class="pivot">
    <div class="problem"><p class="tag">The problem</p><h3>≤ 6 words</h3><p>≤ 20 words.</p></div>
    <div class="solution"><p class="tag">The fix</p><h3>≤ 6 words</h3><p>≤ 20 words.</p></div>
  </div>
</section>
```
The problem panel is muted and dashed, the fix is filled with the accent; the
arrow is drawn automatically. Use `l-compare` instead for two neutral options.

## l-matrix — 2×2 quadrant

```html
<section class="slide l-matrix">
  <header><p class="eyebrow">Label</p><h2>Headline</h2><p class="muted">Optional one line.</p></header>
  <div class="matrix">
    <div class="quads">
      <div class="quad is-highlight"><h3>Top left</h3><p>≤ 10 words.</p></div>
      <div class="quad"><h3>Top right</h3><p>…</p></div>
      <div class="quad"><h3>Bottom left</h3><p>…</p></div>
      <div class="quad"><h3>Bottom right</h3><p>…</p></div>
    </div>
    <p class="axis-x">Horizontal axis</p>
    <p class="axis-y">Vertical axis</p>
  </div>
</section>
```
Exactly four quads, in reading order. Axes grow up and to the right, so put
the "high" ends top and right. Axis names ≤ 2 words; quad titles ≤ 4 words.
At most one `is-highlight`. Good for SWOT, effort vs. impact, positioning.

## l-tiers — 2 to 4 plans or options

```html
<section class="slide l-tiers">
  <header><p class="eyebrow">Label</p><h2>Headline</h2></header>
  <div class="tiers">
    <article class="tier">
      <h3>Plan name</h3>
      <p class="price num">$12<span class="per">/ month</span></p>
      <p>Who it is for, ≤ 8 words.</p>
      <ul class="features"><li>≤ 5 words</li></ul>
      <p class="tier-foot">Optional call to action</p>
    </article>
    <article class="tier is-featured"><span class="badge">Recommended</span>…</article>
  </div>
</section>
```
2–4 tiers; 2–4 features each, parallel across tiers. At most one
`is-featured` with a one-word `badge`. The price can be any short value
(`8<span class="per">hours</span>`), ≤ 5 characters before the unit.

## l-roadmap — lanes across phases

```html
<section class="slide l-roadmap">
  <header><p class="eyebrow">Label</p><h2>Headline</h2></header>
  <div class="roadmap">
    <ol class="phases"><li>Now</li><li class="is-current">Next</li><li>Later</li></ol>
    <div class="lane">
      <h3>Lane name</h3>
      <p class="bar at-1 span-2">≤ 5 words</p>
      <p class="bar at-3 is-highlight">…</p>
    </div>
  </div>
</section>
```
3–5 phases, 2–4 lanes, ≤ 3 bars per lane. `at-N` starts a bar in phase N and
`span-N` stretches it across N phases; bars must not overlap within a lane.
Use `l-timeline` instead for dated moments on a single line.

## l-cover — magazine-cover opener

```html
<section class="slide l-cover">            <!-- is-split: photo right, type on the theme's background -->
  <figure class="media"><img src="assets/cover.jpg" alt=""></figure>
  <h1 class="masthead">Masthead</h1>
  <p class="issue"><span>Issue or course</span><span>Date or edition</span></p>
  <p class="feature">The cover story with one <em>accent</em> word</p>
  <ul class="coverlines">
    <li><strong>90 min</strong>One cover line, ≤ 6 words</li>
  </ul>
</section>
```
The masthead scales to fill the width: ≤ 10 characters, one word is best.
Feature ≤ 8 words; 2–4 cover lines, each a short `strong` figure or name
plus ≤ 6 words. The photo needs a calm area at the top and a darker foot (a
scrim is added); use `is-split` with a portrait image when the photo is busy.
Use it instead of `l-title` for a handout, a report or a series opener, not
as well as it. No folio is shown.

## l-bento — feature grid: one hero tile and 3–4 smaller tiles

```html
<section class="slide l-bento is-a">      <!-- pick one pattern: is-a, is-b or is-c -->
  <header><p class="eyebrow">Label</p><h2>Headline</h2></header>
  <div class="bento">
    <article class="tile"><h3>Hero title</h3><p>Hero text.</p></article>
    <article class="tile is-quote"><blockquote><p>Short quote.</p><footer>Person</footer></blockquote></article>
    <article class="tile is-number"><p class="value num">90<span class="unit">min</span></p><p class="label">≤ 5 words</p></article>
    <article class="tile is-image"><img src="assets/photo.jpg" alt="What it shows"></article>
  </div>
</section>
```
Patterns. Tiles fill the slots in source order, and **the first tile is always the hero**:

| Pattern | Tiles | Shape |
|---|---|---|
| `is-a` | 4 | Hero on the left (half width, both rows); one wide tile top right; two small tiles bottom right |
| `is-b` | 4 | Wide, short hero top left; two tiles under it; one tall tile on the right |
| `is-c` | 5 | Hero in the centre (both rows); two small tiles stacked on each side |

Tile kinds: a plain tile (`h3` + `p`), `is-number` (`.value` + `.label`),
`is-image` (the picture fills the tile; no text on it), `is-quote` and
`is-chart` (a `figure.chart` under an `h3`, **hero of `is-a` or `is-c` only**,
≤ 5 categories). Add `is-accent` to at most one tile. No eyebrows inside
tiles; the slide header carries the label.

Limits: hero title ≤ 8 words (≤ 6 in `is-b`) and text ≤ 20 words; small
tiles ≤ 4-word title and ≤ 8 words of text; numbers ≤ 5 characters before
the unit; quotes ≤ 8 words. The build warns when the tile count does not
match the pattern. Use `l-cards` instead for 2–4 equal, parallel ideas.

## l-annotated — a screenshot or diagram with numbered callouts

```html
<section class="slide l-annotated" data-dim>   <!-- is-reverse: labels on the left -->
  <header><p class="eyebrow">Label</p><h2>Headline</h2></header>
  <figure class="annotated">
    <img src="assets/screen.png" alt="What the picture shows">
    <ol class="callouts">
      <li class="step" data-at="24,40"><strong>Title.</strong> ≤ 8 words.</li>
    </ol>
  </figure>
</section>
```
`data-at="x,y"` is the point the callout explains, as percentages of the
picture (0,0 top left; 100,100 bottom right). The runtime draws a numbered
pin there and a leader line to the label; each label sits beside its pin's
height, so write the callouts in the order you want to reveal them, not by
position. With `class="step"` they appear one press at a time and the line
draws in. QA fails pins closer than 48px or lines that cross.

3–6 callouts; title ≤ 3 words plus ≤ 8 words. The image needs a real
width and height (PNG, JPG, or SVG with `width`/`height`); a landscape
picture works best. Use `l-split` instead for an image with one message.

## l-free — escape hatch

`<section class="slide l-free">` is a blank canvas with no grid. Use it only
for a genuinely custom composition (a full-slide diagram, a designed cover).
Position content with the spacing tokens (`var(--sp-6)`, `var(--m-x)`), keep
inside the margins, and expect QA to check it like any other slide.
