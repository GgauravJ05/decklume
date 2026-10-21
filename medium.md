# Designed, Not Generated: Why I Built Decklume

### A free, open-source Claude Code skill that turns a topic, your notes or a PowerPoint into a presentation that looks designed, and checks every slide before you see it.

![The same lecture title slide rendered in Decklume's themes](https://ggauravj05.github.io/decklume/assets/hero.jpg)

AI can write a whole presentation in seconds. Then you spend an hour fixing it.

The text spills off the bottom of slide 6. The accent colour is unreadable on the projector. Every slide is the same bullet list with a different heading. The "chart" is a paragraph of numbers. You end up rebuilding the deck by hand, and the time AI saved you is gone.

I kept running into this with student lectures, research talks and pitch decks. The model was never the problem: it writes good content. The problem is that it is asked to *design* by prompt ("make it modern and clean") and nothing checks the result.

So I built **Decklume**, a skill for Claude Code that keeps the model on the story and gives the design to code.

---

## The idea: constraints, not adjectives

Designers don't make good slides by trying harder. They work within a system: a fixed canvas, a type scale, a grid, a small set of layouts that are known to work, and a review before anything ships.

Decklume gives Claude the same system:

- **A fixed 1920×1080 canvas** that scales as one unit, so a slide looks the same on a laptop, a projector and in the PDF.
- **A type scale and a 12-column grid.** A fixed set of type sizes, and nothing on a slide sits outside them.
- **26 tested layouts**, from title and section slides to timelines, comparisons, charts, code walkthroughs, 2×2 matrices, roadmaps, pricing tiers and problem-to-fix slides.
- **13 complete themes**, each a design system written as CSS tokens plus a few signature details.
- **A QA gate** that renders every slide in a real browser and fails the deck on real defects.

The model writes the content and picks a layout for each slide. It never positions a text box by hand. If something doesn't fit, the rule is to split the slide, not shrink the type.

---

## How it works

You open Claude Code and ask for a presentation the way you'd ask a person:

> Make a 10-minute presentation on the causes of World War I for my history class, speaker-led, with notes.

Or hand it something you already have:

> Turn lecture-04.pptx into a Chalk-themed deck and keep my speaker notes.

From there Decklume runs a fixed workflow.

### 1. One round of questions

Purpose, audience, length, and whether the deck is *speaker-led* (few words, big type) or *for reading* (self-contained slides). It asks everything in one message and skips what you already said.

### 2. The story, before any design

It writes an outline as a table: one row per slide, with the layout it will use and an **assertion headline**, a short claim instead of a topic label. "Half the night is stage N2", not "Sleep stages". You approve or change the story before a single pixel is designed. Most bad decks are bad stories with nice fonts; this step fixes that first.

### 3. Pick a style by seeing your own slides

Nobody knows what "minimal but warm" means. So Decklume never asks about taste in adjectives. It renders **your** title slide and two of your real content slides in three genuinely different themes, side by side, and you point at the one you like. You can also mix them ("A's type with C's colours"), and it builds a custom theme for you.

### 4. Build

Every slide is plain HTML using a layout class. Speaker notes, step-by-step builds, charts, Magic Move transitions (an element glides from one slide to the next) and code walkthroughs are all a few attributes away.

### 5. The QA gate

This is the part I care about most. Before you ever see the deck, every slide is rendered in a headless browser and checked for:

- text that overflows its box or the slide
- text that overlaps other text
- type below the minimum readable size
- contrast below WCAG AA
- web fonts that failed to load
- placeholder or internal text that leaked onto a slide
- broken images and JavaScript errors

Errors must reach zero. The fix is always to change the content or the layout, never to hide the problem. Claude also reads the contact sheet of every slide like a designer would, looking at rhythm, alignment and awkward line breaks.

As a test, the 29-slide demo lecture is built in all 13 themes, and every one passes with 0 errors and 0 warnings.

### 6. Deliver

You get **one self-contained HTML file** that runs anywhere, with a presenter view (current slide, next slide, notes, timer), an overview grid and an edit mode for last-minute text fixes. It exports to a **vector PDF with selectable text** (the 29-slide lecture is 0.9 MB), to PNG per slide, or to a live link.

---

## Thirteen themes, every layout designed

A theme in Decklume is not a colour swap. Each one has its own type pairing, spacing, motion personality and two or three signature details, and each one is checked across every layout.

![Blueprint theme](https://ggauravj05.github.io/decklume/assets/themes/blueprint.jpg)
*Blueprint: an engineering drawing, with a drafting grid and orange redlines.*

![Broadsheet theme](https://ggauravj05.github.io/decklume/assets/themes/broadsheet.jpg)
*Broadsheet: a newspaper front page, with double rules, column lines and typewriter datelines.*

![Clinic theme](https://ggauravj05.github.io/decklume/assets/themes/clinic.jpg)
*Clinic: calm and clean, with a body typeface designed for low-vision readers.*

The full set covers editorial, cinematic, Swiss, academic, consulting, product launch, brutalist, Japanese minimal, playful, chalkboard, engineering, newspaper and clinical looks. You can play every theme live on the website, on the same lecture, slide by slide.

---

## Who it's for

- **Students:** class presentations, group project demos, lab talks, thesis and capstone defences.
- **Teachers:** lecture decks with definitions, timelines, diagrams and step-by-step builds; revision decks; existing PowerPoints restyled.
- **Researchers:** conference talks and defences with real charts and readable tables.
- **Founders:** pitch decks with pricing tiers, roadmaps and the one number that matters.

---

## A few decisions I'd make again

**Fewer, better layouts beat infinite freedom.** Every layout has content limits ("2–4 tiers, 2–4 features each"). When content exceeds them, the slide is split. That one rule removes most of the problems AI-made slides have.

**Show, don't ask.** Choosing a style from your own content takes ten seconds. Choosing from a list of adjectives takes ten minutes and still ends in the wrong place.

**Machines are good at checking.** Humans are bad at noticing that the caption on slide 23 is 2 pixels into the margin. A browser is very good at it. A design QA gate is cheap to run and catches exactly the defects that make a deck look generated.

**No dependencies in your project.** Every script uses Node built-ins only. The browser used for QA and PDF export installs itself once into a cache folder, never into your project.

---

## What's next

The roadmap, in order:

1. **More premium layouts:** bento grids, annotated screenshots with callouts, charts that build step by step with annotations pinned to the data, and magazine-style covers.
2. **Brand from a URL:** "make it look like our website" generates a custom theme from your site's colours, fonts and logo, then runs it through QA.
3. **Deck to narrated video:** your speaker notes become a voiceover and the deck becomes a shareable video.
4. **Editable PowerPoint export,** for everyone whose manager still needs a .pptx.

---

## Try it

Decklume is free and MIT-licensed. Inside Claude Code, run these one at a time:

```
/plugin marketplace add https://github.com/GgauravJ05/decklume
```

```
/plugin install decklume@decklume
```

Then ask for a presentation.

- **Live demos of every theme:** https://ggauravj05.github.io/decklume/
- **Code:** https://github.com/GgauravJ05/decklume

If you make a deck with it, I'd love to see it. And if a layout or theme you need is missing, open an issue: that's exactly what decides what I build next.
