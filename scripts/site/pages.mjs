/* Secondary pages: themes, audiences, docs, comparison, 404. */
import { SITE, SLIDES, AUDIENCES, EXAMPLES } from "./content.mjs";
import { page, esc, icon, frame, frameSrc, command, faqHtml, faqLd, breadcrumbs, softwareLd } from "./layout.mjs";

const cap = (s) => s[0].toUpperCase() + s.slice(1);

/* A playable deck framed as an enlargement print. */
const player = (root, t, label) => `
<div class="print print-flat" data-player data-theme="${t.slug}" data-total="${SLIDES.length}" data-root="${root}">
  <div class="screen"><img class="poster" src="${frameSrc(root, t.slug, 1, 1280)}" alt="${esc(t.name)} theme title slide" width="1280" height="720" fetchpriority="high"></div>
  <div class="controls">
    <button type="button" data-act="prev" aria-label="Previous slide">${icon("prev")}</button>
    <span class="count" aria-live="polite"><b data-count>01</b> / ${SLIDES.length}</span>
    <button type="button" data-act="next" aria-label="Next slide">${icon("next")}</button>
    <span class="print-label">${esc(label)}</span>
    <a class="full" href="${root}demos/${t.slug}.html" aria-label="Open the ${esc(t.name)} demo full screen">${icon("expand")}</a>
  </div>
</div>`;

/* --- Themes index -------------------------------------------------------- */
export function themesIndex(themes) {
  const root = "../";
  const rows = themes.map((t) => `
  <article class="trow">
    <div class="trow-copy">
      <h2><a href="${t.slug}/">${esc(t.name)}</a></h2>
      <p>${esc(t.tagline)}</p>
      <p class="trow-for">Best for ${esc(t.best_for.slice(0, 3).join(", "))}.</p>
    </div>
    <div class="strip s3">${[1, 7, 15].map((n) => frame(root, t.slug, n, { themeName: t.name, href: `${t.slug}/` })).join("")}</div>
  </article>`).join("");
  return page({
    root,
    path: "themes/",
    title: "13 Free Presentation Themes for Claude Code",
    description: "Browse Decklume's thirteen free presentation themes: editorial, cinematic, Swiss, academic, consulting, product launch, brutalist, Japanese minimal, playful, chalkboard, blueprint, newspaper and clinical. Every theme covers all 26 slide layouts.",
    current: "themes/",
    jsonld: [
      breadcrumbs([["Decklume", ""], ["Themes", "themes/"]]),
      { "@type": "CollectionPage", name: "Decklume presentation themes", url: SITE.base + "themes/", hasPart: themes.map((t) => ({ "@type": "CreativeWork", name: `${t.name} presentation theme`, url: `${SITE.base}themes/${t.slug}/` })) },
    ],
    body: `
<section class="page-head">
  <h1>Thirteen themes. Every layout designed.</h1>
  <p class="lede">Each theme restyles all 27 layouts and passes the same design checks on the same 30-slide lecture. Open one to play it, or see every slide.</p>
</section>
<section class="themes-list">${rows}</section>`,
  });
}

/* --- One theme ------------------------------------------------------------- */
export function themePage(t, themes) {
  const root = "../../";
  const i = themes.findIndex((x) => x.slug === t.slug);
  const prev = themes[(i - 1 + themes.length) % themes.length];
  const next = themes[(i + 1) % themes.length];
  const sheet = SLIDES.map((_, n) => frame(root, t.slug, n + 1, { themeName: t.name, href: `${root}demos/${t.slug}.html#/${n + 1}` })).join("");
  const sw = Object.entries(t.colors || {}).map(([k, v]) => `<li><span class="sw" style="background:${esc(v)}"></span><span>${esc(k)}</span><code>${esc(v)}</code></li>`).join("");
  return page({
    root,
    path: `themes/${t.slug}/`,
    title: `${t.name} — Free ${cap(t.mood[0])} Presentation Theme for Claude`,
    description: `${t.name}: ${t.tagline} A free Decklume theme for ${t.best_for.slice(0, 3).join(", ")}. Play the live demo and see all 30 slides.`,
    current: "themes/",
    jsonld: [
      breadcrumbs([["Decklume", ""], ["Themes", "themes/"], [t.name, `themes/${t.slug}/`]]),
      { "@type": "CreativeWork", name: `${t.name} presentation theme`, description: t.tagline, url: `${SITE.base}themes/${t.slug}/`, image: `${SITE.base}assets/frames/${t.slug}/01-1280.webp`, license: "https://opensource.org/licenses/MIT", isPartOf: { "@id": SITE.base + "#software" }, keywords: [...t.mood, ...t.best_for].join(", ") },
    ],
    body: `
<section class="theme-hero">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Themes</a> <span aria-hidden="true">/</span> <span aria-current="page">${esc(t.name)}</span></nav>
  <div class="theme-hero-grid">
    <div class="theme-copy">
      <h1>${esc(t.name)}</h1>
      <p class="lede">${esc(t.tagline)}</p>
      <dl class="facts">
        <div><dt>Best for</dt><dd>${esc(t.best_for.join(", "))}</dd></div>
        <div><dt>Avoid for</dt><dd>${esc(t.avoid_for.join(", "))}</dd></div>
        <div><dt>Typefaces</dt><dd>${esc(t.font_families.join(" · "))}</dd></div>
        <div><dt>Feel</dt><dd>${esc(t.mood.join(", "))} · ${esc(t.scheme)} · ${esc(t.motion)} motion</dd></div>
      </dl>
      <ul class="swatches">${sw}</ul>
      <p class="use-label">Ask Claude for it by name:</p>
      ${command(`Make a presentation about … in the ${t.name} theme`)}
    </div>
    ${player(root, t, `How sleep shapes memory · ${t.name}`)}
  </div>
</section>
<section class="band" aria-labelledby="all-h">
  <div class="band-head"><h2 id="all-h">All 30 slides in ${esc(t.name)}</h2><p>Every layout from the showcase lecture. Click a frame to open it in the live deck.</p></div>
  <div class="sheet sheet-full"><div class="strip s5 wrap">${sheet}</div></div>
</section>
<nav class="pager" aria-label="More themes">
  <a href="../${prev.slug}/">${icon("prev")}<span><small>Previous theme</small>${esc(prev.name)}</span></a>
  <a href="../${next.slug}/"><span><small>Next theme</small>${esc(next.name)}</span>${icon("next")}</a>
</nav>`,
  });
}

/* --- Audience pages ------------------------------------------------------- */
export function audiencePage(a, themes) {
  const root = "../../";
  const byslug = Object.fromEntries(themes.map((t) => [t.slug, t]));
  const rec = a.themes.map((s) => byslug[s]);
  return page({
    root,
    path: `for/${a.slug}/`,
    title: a.title,
    description: a.description,
    current: `for/${a.slug}/`,
    jsonld: [breadcrumbs([["Decklume", ""], [`For ${a.slug}`, `for/${a.slug}/`]]), softwareLd, faqLd(a.faq)],
    body: `
<section class="page-head aud-head">
  <div>
    <h1>${esc(a.h1)}</h1>
    <p class="lede">${esc(a.lede)}</p>
    <div class="head-act">${command(SITE.install[1])}<a class="btn btn-primary" href="${root}#install">How to install</a></div>
  </div>
  <div class="strip s2 tilt">${rec.slice(0, 2).map((t, i) => frame(root, t.slug, i ? 8 : 1, { themeName: t.name, href: `${root}themes/${t.slug}/` })).join("")}</div>
</section>
<section class="band" aria-labelledby="makes-h">
  <div class="band-head"><h2 id="makes-h">What you can make</h2><p>Copy a prompt, change the details, paste it into Claude Code.</p></div>
  <dl class="makes">${a.makes.map(([k, p]) => `<div><dt>${esc(k)}</dt><dd>${command(p)}</dd></div>`).join("")}</dl>
</section>
<section class="band split-band" aria-labelledby="why-h">
  <h2 id="why-h">Why it works for ${esc(a.slug)}</h2>
  <dl class="points">${a.points.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
</section>
<section class="band" aria-labelledby="rec-h">
  <div class="band-head"><h2 id="rec-h">Themes to start with</h2></div>
  <div class="strip s4 strip-wide">${rec.map((t) => `<figure class="frame aud"><a class="frame-link" href="${root}themes/${t.slug}/"><img src="${frameSrc(root, t.slug, 1)}" alt="${esc(t.name)} theme title slide" width="640" height="360" loading="lazy" decoding="async"></a><figcaption><a href="${root}themes/${t.slug}/">${esc(t.name)}</a><span>${esc(t.tagline)}</span></figcaption></figure>`).join("")}</div>
</section>
${(() => {
  const ex = EXAMPLES.find((e) => e.audience === a.slug) || EXAMPLES[0];
  return `<section class="band" aria-labelledby="ex-h"><div class="band-head"><h2 id="ex-h">See a finished example</h2><p>${esc(ex.kind)}: ${esc(ex.summary)}</p></div><div class="strip s3">${ex.frames.map((n) => exampleFrame(root, ex, n)).join("")}</div><p class="ex-cta"><a class="btn btn-primary" href="${root}examples/${ex.slug}.html">${icon("play")}<span>Play “${esc(ex.title)}”</span></a></p></section>`;
})()}
${faqHtml(a.faq)}`,
  });
}

/* --- Docs ------------------------------------------------------------------- */
const KEYS = [["→ or Space", "Next step or slide"], ["←", "Previous"], ["O", "Overview grid, click to jump"], ["P", "Presenter window: notes, timer, next slide"], ["12 then Enter", "Jump to slide 12"], ["F", "Fullscreen"], ["B", "Blackout"], ["E, then ⌘/Ctrl+S", "Edit text in the browser and save the file"], ["G", "Show the 12-column grid"], ["?", "All shortcuts"]];
const CLI = [
  ["build.mjs talk.deck.html", "Compile a deck source into one self-contained HTML file. Add --theme, --inline-assets or --watch."],
  ["build.mjs --list-themes", "List installed themes (add --json for metadata)."],
  ["preview.mjs sample.deck.html --themes folio,grid,campus --png", "Render sample slides in several themes side by side."],
  ["qa.mjs talk.html", "Run the design QA gate; writes screenshots, a contact sheet and report.json."],
  ["export.mjs talk.html", "Vector PDF. Add --png for one image per slide, --scale 2 for retina."],
  ["extract-pptx.mjs old.pptx out/", "Extract text, tables, images, notes and chart data from PowerPoint. No Python needed."],
  ["deploy.mjs talk.html", "Publish to a live URL on Vercel (add --dry to preview what ships)."],
];
export function docsPage() {
  const root = "../";
  const toc = [["install", "Install"], ["first", "Your first deck"], ["workflow", "How a deck is made"], ["present", "Presenting"], ["export", "Exporting and sharing"], ["qa", "Design QA"], ["edit", "Editing a deck"], ["themes", "Themes and custom themes"], ["cli", "Command-line tools"], ["trouble", "Troubleshooting"]];
  return page({
    root,
    path: "docs/",
    title: "How to Make Presentations with Claude Code — Decklume Docs",
    description: "Install Decklume, make your first presentation with Claude Code, present with the presenter view, export to PDF, run design QA and use the command-line tools.",
    current: "docs/",
    bodyClass: "docs",
    jsonld: [
      breadcrumbs([["Decklume", ""], ["Docs", "docs/"]]),
      { "@type": "TechArticle", headline: "How to make presentations with Claude Code using Decklume", url: SITE.base + "docs/", author: { "@type": "Person", name: SITE.author }, about: { "@id": SITE.base + "#software" }, proficiencyLevel: "Beginner" },
    ],
    body: `
<section class="page-head"><h1>Make presentations with Claude Code</h1><p class="lede">Everything you need to install Decklume, make a deck, present it and share it.</p></section>
<div class="docs-grid">
  <nav class="toc" aria-label="On this page"><ol>${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ol></nav>
  <article class="prose">
    <h2 id="install">Install</h2>
    <p>Decklume is a Claude Code plugin. Run these two commands inside Claude Code, one at a time:</p>
    ${command(SITE.install[0])}${command(SITE.install[1])}
    <p>Or install it as a standalone skill:</p>
    ${command(SITE.manual[0])}${command(SITE.manual[1])}
    <p>You need Node.js 18 or newer, and nothing else: PowerPoint import is pure Node. The first time you run design QA, a style preview or a PDF export, Decklume installs Playwright into <code>~/.cache/decklume</code>, never into your project.</p>

    <h2 id="first">Your first deck</h2>
    <p>Describe the presentation in plain language. Say who it is for and how long it should be:</p>
    ${command("Make a 15-minute lecture on how sleep shapes memory for first-year psychology students.")}
    <p>You can also point Claude at material you already have: notes, a Markdown or PDF document, or a <code>.pptx</code> file.</p>

    <h2 id="workflow">How a deck is made</h2>
    <ol>
      <li><strong>Brief.</strong> Claude asks what it still needs in one round: purpose, audience, speaker-led or reading deck, length and assets.</li>
      <li><strong>Storyline.</strong> You approve an outline with a layout and an assertion headline for every slide.</li>
      <li><strong>Style.</strong> Your title and two content slides are rendered in three themes on one page. Pick one, or ask for a mix.</li>
      <li><strong>Build.</strong> Claude writes the slide content; <code>build.mjs</code> compiles it into one HTML file.</li>
      <li><strong>QA.</strong> <code>qa.mjs</code> renders and checks every slide. The deck isn’t handed over until it passes.</li>
      <li><strong>Deliver.</strong> The deck opens in your browser, with export and sharing options.</li>
    </ol>

    <h2 id="present">Presenting</h2>
    <table class="keys"><thead><tr><th scope="col">Key</th><th scope="col">Action</th></tr></thead><tbody>${KEYS.map(([k, v]) => `<tr><td><kbd>${esc(k)}</kbd></td><td>${esc(v)}</td></tr>`).join("")}</tbody></table>
    <p>Swipe works on phones and tablets. Slides always stay 16:9 and scale as a whole, so nothing reflows on a projector.</p>

    <h2 id="export">Exporting and sharing</h2>
    <p>A deck is one HTML file you can email or open offline once its fonts are cached. For other formats, ask Claude, or run the tools yourself:</p>
    <ul><li><strong>PDF</strong>: vector, with selectable and searchable text and every build step shown. The 30-slide example lecture is 1.1 MB.</li><li><strong>PNG</strong>: one image per slide, optionally at 2× resolution.</li><li><strong>Live link</strong>: one command publishes to Vercel; the link works on any device and includes the presenter view.</li></ul>

    <h2 id="qa">Design QA</h2>
    <p>Every slide is rendered at 1920×1080 in a real browser. The check fails on text extending past the slide or clipped inside a box, text running into the footer, overlapping text, type below the minimum size, WCAG contrast failures, web fonts that did not load, placeholder text, broken images, JavaScript errors, and slides that stop being 16:9 on a phone. It warns about crowded slides, missing alt text, long headlines and common AI-slop patterns, and writes a contact sheet of every slide for review.</p>

    <h2 id="edit">Editing a deck</h2>
    <p>Ask Claude for changes (“make slide 6 punchier”, “add a slide about X”). It edits the <code>.deck.html</code> source, rebuilds and re-runs QA. For quick text fixes, press <kbd>E</kbd> in the browser, click any text, and save with <kbd>⌘/Ctrl+S</kbd>.</p>

    <h2 id="themes">Themes and custom themes</h2>
    <p>Thirteen themes ship with Decklume: <a href="../themes/">browse them all</a>. Claude can also design a custom theme for a brand, a logo or a mix of two themes. Custom themes use the same layouts and pass the same checks.</p>

    <h2 id="cli">Command-line tools</h2>
    <p>The scripts live in <code>skills/decklume/scripts/</code>, need only Node.js 18+, and can be run without Claude:</p>
    <dl class="cli">${CLI.map(([c, d]) => `<div><dt><code>${esc(c)}</code></dt><dd>${esc(d)}</dd></div>`).join("")}</dl>

    <h2 id="trouble">Troubleshooting</h2>
    <dl class="cli">
      <div><dt>The plugin command fails with an SSH error</dt><dd>Use the full HTTPS URL shown above in <code>/plugin marketplace add</code>, not the short owner/repo form.</dd></div>
      <div><dt>QA reports that a web font did not load</dt><dd>Fonts come from Google Fonts. Check your connection and re-run; QA reports the failure instead of passing with fallback fonts.</dd></div>
      <div><dt>The presenter window doesn’t open</dt><dd>Allow pop-ups for the page, then press <kbd>P</kbd> again.</dd></div>
      <div><dt>Images are missing after sharing the file</dt><dd>Rebuild with <code>--inline-assets</code> to embed images in the HTML file.</dd></div>
    </dl>
  </article>
</div>`,
  });
}

/* --- Comparison ------------------------------------------------------------- */
export function comparePage() {
  const root = "../../";
  const rows = [
    ["How design is controlled", "Prose guidance and style recipes the model translates by hand", "Design tokens, 27 tested layouts and themes written as code"],
    ["Story", "Asks for your content", "You approve an outline with an assertion headline per slide"],
    ["Style previews", "Three separate files, title slide only", "Your title and content slides in three themes, on one page"],
    ["Themes", "12 presets and 34 bold style recipes", "13 complete themes, every layout designed and tested"],
    ["Motion", "Entrance animations", "Entrances, step-by-step builds and Magic Move transitions"],
    ["Charts", "Not included", "Bar, horizontal bar, line and donut charts in SVG"],
    ["Verification", "Advice to review screenshots", "Automated QA gate with contact sheet, tested in CI"],
    ["Presenting", "Speaker notes passed to a host", "Presenter window with notes, timer and next slide"],
    ["PDF export", "Screenshot images; about 20 MB for 18 slides (per its docs)", "Vector with selectable text; 1.1 MB for 30 slides"],
    ["PowerPoint import", "Python script: text, images and notes", "Pure Node: adds bullet levels, tables, grouped shapes and native chart data"],
    ["Output", "One self-contained HTML file", "One self-contained HTML file"],
    ["License", "MIT", "MIT"],
  ];
  return page({
    root,
    path: "compare/frontend-slides/",
    title: "Decklume vs frontend-slides — Claude Presentation Skills Compared",
    description: "An honest comparison of Decklume and frontend-slides, two open-source Claude Code skills for HTML presentations: design control, previews, themes, motion, QA, presenter view and PDF export.",
    current: "",
    jsonld: [breadcrumbs([["Decklume", ""], ["Compare", "compare/frontend-slides/"]]), { "@type": "Article", headline: "Decklume vs frontend-slides", url: SITE.base + "compare/frontend-slides/", author: { "@type": "Person", name: SITE.author } }],
    body: `
<section class="page-head"><h1>Decklume vs frontend-slides</h1><p class="lede">Both are free, MIT-licensed Claude Code skills that output a single HTML presentation. This is where they differ.</p></section>
<section class="band">
  <table class="ctable ctable-full"><thead><tr><th scope="col"></th><th scope="col">frontend-slides</th><th scope="col">Decklume</th></tr></thead><tbody>${rows.map(([k, a, b]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody></table>
  <div class="prose narrow">
    <h2>When frontend-slides may suit you better</h2>
    <p>If you want the widest range of bold, one-off visual styles, its 34-recipe template pack is a great source of ideas, and it needs no Node scripts at all.</p>
    <h2>When Decklume may suit you better</h2>
    <p>If you want every slide type designed consistently, a story you approve first, and a deck that has been checked in a browser before you present it, Decklume is built for that.</p>
  </div>
</section>`,
  });
}

/* --- 404 --------------------------------------------------------------------- */
export function notFound() {
  return page({
    root: "/decklume/",
    path: "404.html",
    title: "Frame not found",
    description: "This page doesn't exist.",
    noindex: true,
    body: `
<section class="page-head lost">
  <h1>This frame didn’t develop.</h1>
  <p class="lede">The page you’re looking for doesn’t exist. Try the themes, the docs, or play the demo deck.</p>
  <div class="head-act"><a class="btn btn-primary" href="/decklume/">Back to the contact sheet</a><a class="btn btn-ghost" href="/decklume/themes/">Browse themes</a></div>
</section>`,
  });
}

/* --- Example decks ----------------------------------------------------------- */
const exampleFrame = (root, ex, n) =>
  `<figure class="frame"><a class="frame-link" href="${root}examples/${ex.slug}.html#/${n}"><img src="${root}assets/examples/${ex.slug}/${String(n).padStart(2, "0")}.webp" alt="${esc(ex.title)}, slide ${n}" width="640" height="360" loading="lazy" decoding="async"></a><figcaption class="edge" aria-hidden="true"><span>${esc(ex.theme.toUpperCase())}</span><span>${String(n).padStart(2, "0")}A</span></figcaption></figure>`;

export function examplesPage(themes) {
  const root = "../";
  const name = Object.fromEntries(themes.map((t) => [t.slug, t.name]));
  const rows = EXAMPLES.map((ex) => `
  <article class="trow ex-row" id="${ex.slug}">
    <div class="trow-copy">
      <p class="ex-kind">${esc(ex.kind)} · ${esc(name[ex.theme])} theme · ${ex.slides} slides</p>
      <h2><a href="${ex.slug}.html">${esc(ex.title)}</a></h2>
      <p>${esc(ex.summary)}</p>
      <p class="trow-for"><strong>Motion:</strong> ${esc(ex.motion)}</p>
      <a class="btn btn-primary ex-play" href="${ex.slug}.html">${icon("play")}<span>Play the deck</span></a>
    </div>
    <div class="strip s3">${ex.frames.map((n) => exampleFrame(root, ex, n)).join("")}</div>
  </article>`).join("");
  return page({
    root,
    path: "examples/",
    title: "Example Presentations Made with Claude: Lecture, Thesis Defense, Pitch, Tech Talk",
    description: "Play complete example decks made with Decklume: a university lecture, an engineering talk, a thesis defense and a startup pitch, each showing different themes, transitions and animations.",
    current: "examples/",
    jsonld: [
      breadcrumbs([["Decklume", ""], ["Examples", "examples/"]]),
      { "@type": "CollectionPage", name: "Decklume example presentations", url: SITE.base + "examples/", hasPart: EXAMPLES.map((ex) => ({ "@type": "PresentationDigitalDocument", name: ex.title, url: `${SITE.base}examples/${ex.slug}.html`, description: ex.summary })) },
    ],
    body: `
<section class="page-head">
  <h1>Real decks you can play.</h1>
  <p class="lede">Four complete presentations, each built for a different room. Open one and use the arrow keys; press P for the presenter view.</p>
</section>
<section class="themes-list">${rows}</section>`,
  });
}
