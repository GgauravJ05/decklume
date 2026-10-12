# Motion

Decklume's motion is declared in markup and choreographed by the engine. Every
effect starts from the finished slide, so PDF export, QA and reduced motion
always show the final state. Pick motion for meaning first, then flavour.

## Slide transitions

Set a default for the deck in front matter and override per slide:

```html
---
transition: push        # deck default
automorph: true         # optional: auto Magic Move on every slide
---
<section class="slide l-section" data-transition="rise">…</section>
```

Moving forward uses the incoming slide's transition. Moving back replays the
outgoing slide's transition in reverse.

| Value | Feels like | Use it for |
|---|---|---|
| `fade` (default) | A clean cut that softens | Almost everything |
| `push` | A filmstrip moving sideways | Sequences: steps, timelines, a story moving on |
| `rise` | A new chapter coming up | Section slides |
| `cover` | The next card dealt on top | Adding detail to the previous slide |
| `zoom` | Diving in or pulling out | Zooming from overview into detail |
| `wipe` | A hard edge sweeping across | Before/after, old vs new |
| `iris` | A circle opening | Reveals, the "aha" slide |
| `blur` | Racking focus | Changing topic or mood |
| `flip` | A card turning over | Question → answer, myth → fact |
| `morph` | Magic Move with automatic matching | Same title, number or image on consecutive slides |
| `none` | An instant cut | Rapid sequences, live demos |

**Restraint:** one deck default plus two or three deliberate overrides. A new
transition on every slide looks like a template sampler.

## Magic Move

- **Explicit:** give the same `data-morph="key"` to one element on two
  consecutive slides.
- **Automatic:** `data-transition="morph"` on the incoming slide (or
  `automorph: true` for the whole deck) pairs headings, big numbers, values,
  terms and images whose text or image source is identical.

Keep morphing text identical on both slides; change position, size or colour.

## Element entrances

Add `data-anim` to any element. It plays once when the slide appears, in
reading order with the slide's stagger:

```html
<p class="big-number num" data-anim="count">1,250<span class="unit">ms</span></p>
<h2 data-anim="type">Latency is a budget.</h2>
<svg data-anim="draw" …>…</svg>
```

| Value | Effect |
|---|---|
| `fade`, `rise`, `drop`, `left`, `right` | Fade with movement in that direction |
| `scale`, `pop` | Grow in; `pop` overshoots with a spring |
| `blur` | Comes into focus |
| `wipe` | Revealed left to right by a hard edge |
| `iris` | Revealed from the centre |
| `flip` | Swings down from the top edge |
| `type` | Typewriter, one character at a time (single lines) |
| `count` | The number counts up from zero, keeping separators, decimals and units |
| `draw` | Every stroke in an SVG traces itself |

Optional timing: `data-delay="400"` and `data-duration="900"` (milliseconds).
`data-enter="none"` on a slide or element keeps it still.

On `push`, `rise`, `cover`, `zoom`, `wipe`, `iris` and `flip` transitions the
default stagger is skipped so the slide moves as one piece. Explicit
`data-anim` effects still play.

## Step builds

Any element with `class="step"` appears on the next press. Add `data-anim` to
choose how. The values are the entrance names above (except `type`, `count`,
`draw`) plus:

| Value | Effect |
|---|---|
| `highlight` | Always visible; the press sweeps a marker over it |

`data-dim` on the slide dims earlier steps. `data-step="2"` changes the order.

## Code walkthrough

For engineering talks, step through code range by range:

```html
<pre class="code" data-lines="1-3|5|7-9"><code>…</code></pre>
```

Each press focuses the next range (`|` separates presses, `,` joins ranges,
`-` spans lines) and dims the rest. Combine it with a heading that names the
current idea, and use `l-code is-stacked` for long listings.

## Recipes

**Engineering talk.** `transition: push`. System diagrams use `l-diagram` with
`data-anim="draw"` on a custom SVG, or a `.flow`. Code uses `data-lines`
walkthroughs. Latency and throughput figures use `count`. Use `wipe` for
before/after refactors.

**Research talk.** `transition: fade`, with `rise` on section slides. Results
use `l-chart`, where charts already animate. Use `count` for the headline
effect size, `highlight` steps for the one phrase that matters in a
definition, `flip` for hypothesis → finding, and `iris` for the main result.

**Pitch.** `transition: push` with `automorph: true` so the traction number
glides from the KPI slide into the summary. Use `pop` for the logo, and
`count` for traction.

## Never

- Animate body paragraphs one word at a time.
- Use more than three entrance styles on one slide.
- Put motion on text people must read while it moves.
- Rely on motion to carry meaning. The final frame must say everything.
