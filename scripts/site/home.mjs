/* Home page: the contact sheet. */
import { SITE, SLIDES, HERO_FRAMES, KEEPER_INDEX, SWITCH_SLIDES, FAQ_HOME, AUDIENCES } from "./content.mjs";
import { page, esc, icon, frame, frameSrc, command, greaseCircle, greaseArrow, faqHtml, faqLd, softwareLd } from "./layout.mjs";

const pad = (n) => String(n).padStart(2, "0");

export function home(themes) {
  const root = "";
  const byslug = Object.fromEntries(themes.map((t) => [t.slug, t]));
  const fr = (i, opts = {}) => {
    const [t, n] = HERO_FRAMES[i];
    const keeper = i === KEEPER_INDEX;
    const html = frame(root, t, n, { eager: i < 6 || keeper, themeName: byslug[t].name, href: `themes/${t}/`, ...opts });
    return keeper ? html.replace('<figure class="frame">', `<figure class="frame keeper">${greaseCircle("g-circle")}<span class="note note-mobile" aria-hidden="true">keep this one</span>`) : html;
  };

  /* --- 1. Hero: contact sheet with the keeper enlarged and playable --- */
  const hero = `
<section class="hero" aria-labelledby="hero-h">
  <div class="hero-head">
    <div class="hero-copy">
      <h1 id="hero-h">Pick the frame. <span>Ship the deck.</span></h1>
      <p class="lede">Decklume is a free Claude Code skill that turns a topic, your notes or a PowerPoint into a designed, animated presentation, and checks every slide in a real browser before you see it.</p>
    </div>
    <div class="hero-act">
      <p class="act-label">Install in Claude Code, one line at a time</p>
      ${command(SITE.install[0])}
      ${command(SITE.install[1])}
      <a class="btn btn-primary" href="#play">${icon("play")}<span>Play the demo deck</span></a>
    </div>
  </div>
  <div class="sheet" id="sheet">
    <p class="note note-keep" aria-hidden="true">keep this one</p>
    ${greaseArrow("g-arrow")}
    <div class="strip s6">${[0, 1, 2, 3, 4, 5].map((i) => fr(i)).join("")}</div>
    <div class="sheet-low">
      <div class="strips">
        <div class="strip s4">${[6, 7, 8, 9].map((i) => fr(i)).join("")}</div>
        <div class="strip s4">${[10, 11, 12, 13].map((i) => fr(i)).join("")}</div>
      </div>
      <div class="print" id="play" data-player data-theme="folio" data-total="25">
        <div class="screen">
          <img class="poster" src="${frameSrc(root, "folio", 1, 1280)}" alt="Folio theme title slide: How sleep shapes memory" width="1280" height="720" fetchpriority="high">
        </div>
        <div class="controls">
          <button type="button" data-act="prev" aria-label="Previous slide">${icon("prev")}</button>
          <span class="count" aria-live="polite"><b data-count>01</b> / 25</span>
          <button type="button" data-act="next" aria-label="Next slide">${icon("next")}</button>
          <span class="print-label">How sleep shapes memory · Folio</span>
          <a class="full" href="demos/folio.html" aria-label="Open the demo deck full screen">${icon("expand")}</a>
        </div>
      </div>
    </div>
  </div>
</section>`;

  /* --- 2. Live theme switcher ------------------------------------------ */
  const switcher = `
<section class="band switcher" id="looks" aria-labelledby="looks-h">
  <div class="band-head">
    <h2 id="looks-h">One deck. Ten looks.</h2>
    <p>The same 25-slide lecture, rebuilt in every theme. Choose a look and a slide: this is the real deck running live, not a screenshot.</p>
  </div>
  <div class="switch" data-switcher>
    <div class="viewer">
      <div class="screen">
        <img class="poster" src="${frameSrc(root, "folio", 1, 1280)}" alt="Folio theme title slide" width="1280" height="720" loading="lazy">
      </div>
    </div>
    <div class="switch-side">
      <fieldset class="pick-theme">
        <legend>Theme</legend>
        <div class="theme-grid">${themes.map((t, i) => `<button type="button" class="tpick" data-theme="${t.slug}" aria-pressed="${i === 0}">
          <img src="${frameSrc(root, t.slug, 1)}" alt="" width="640" height="360" loading="lazy" decoding="async"><span>${esc(t.name)}</span></button>`).join("")}</div>
      </fieldset>
      <fieldset class="pick-slide">
        <legend>Slide</legend>
        <div class="chips">${SWITCH_SLIDES.map(([n, label], i) => `<button type="button" class="chip" data-slide="${n}" aria-pressed="${i === 0}">${label}</button>`).join("")}</div>
      </fieldset>
      <div class="theme-info" aria-live="polite">
        ${themes.map((t, i) => `<div data-info="${t.slug}"${i ? " hidden" : ""}><p class="ti-name">${esc(t.name)}</p><p>${esc(t.tagline)}</p><p class="ti-for">Best for ${esc(t.best_for.slice(0, 3).join(", "))}.</p><a href="themes/${t.slug}/">See every slide in ${esc(t.name)} ${icon("arrow")}</a></div>`).join("")}
      </div>
    </div>
  </div>
</section>`;

  /* --- 3. Prompt → deck story ------------------------------------------- */
  const outline = [
    ["01", "l-title", "How sleep shapes memory"],
    ["07", "l-steps", "The night runs in repeating cycles"],
    ["08", "l-chart", "Half the night is stage N2"],
    ["14", "l-kpi", "1 in 3 US adults sleep under seven hours"],
    ["21", "l-statement", "The best study session ends with going to bed"],
  ];
  const story = `
<section class="band story" id="how" aria-labelledby="how-h">
  <div class="band-head">
    <h2 id="how-h">From one sentence to a finished deck.</h2>
    <p>Five steps, and you approve the two that matter: the story and the style.</p>
  </div>
  <div class="story-grid" data-story>
    <div class="story-stage" aria-hidden="true">
      <div class="stage-frame">
        <div class="stage" data-stage="1">
          <p class="term"><span class="prompt">&gt;</span> <span class="typed" data-type="Make a 15-minute lecture on how sleep shapes memory for first-year psychology students.">Make a 15-minute lecture on how sleep shapes memory for first-year psychology students.</span></p>
          <ul class="answers"><li>Lecture</li><li>Speaker-led</li><li>~25 slides</li><li>No images</li></ul>
        </div>
        <div class="stage" data-stage="2">
          <table class="outline"><thead><tr><th>#</th><th>Layout</th><th>Headline</th></tr></thead><tbody>${outline.map(([n, l, h]) => `<tr><td>${n}</td><td>${l}</td><td>${h}</td></tr>`).join("")}</tbody></table>
          <p class="approve">${icon("check")} Outline approved</p>
        </div>
        <div class="stage" data-stage="3">
          <div class="abc">${["folio", "nocturne", "grid"].map((t, i) => `<figure class="${i === 0 ? "keeper" : ""}">${i === 0 ? greaseCircle("g-circle") : ""}<img src="${frameSrc(root, t, 15)}" alt="" width="640" height="360" loading="lazy"><figcaption>${"ABC"[i]} · ${byslug[t].name}</figcaption></figure>`).join("")}</div>
        </div>
        <div class="stage" data-stage="4">
          <div class="qa-mini">${SLIDES.map((_, i) => `<span style="--i:${i}"><img src="${frameSrc(root, "folio", i + 1)}" alt="" width="640" height="360" loading="lazy"></span>`).join("")}</div>
          <p class="term pass">${icon("check")} QA passed · 25 slides · 0 errors</p>
        </div>
        <div class="stage" data-stage="5">
          <figure class="deliver"><img src="${frameSrc(root, "folio", 25)}" alt="" width="640" height="360" loading="lazy"></figure>
          <ul class="outputs"><li>sleep-and-memory.html <em>one file</em></li><li>sleep-and-memory.pdf <em>0.8 MB, vector</em></li><li>slides/01–25.png</li><li>a live link</li></ul>
        </div>
      </div>
    </div>
    <ol class="story-steps">
      <li data-step="1"><h3>Brief</h3><p>Describe the talk, or hand over notes, a document or a .pptx. Claude asks everything it needs in one round: purpose, audience, speaker-led or reading, length.</p></li>
      <li data-step="2"><h3>Storyline</h3><p>You get an outline with a claim on every slide and a layout picked for each. Change anything before a single pixel is designed.</p></li>
      <li data-step="3"><h3>Style</h3><p>Your own title and content slides, rendered in three themes side by side. Pick A, B or C, or mix them.</p></li>
      <li data-step="4"><h3>Build and check</h3><p>The deck is built as one HTML file, then every slide is rendered in a real browser and checked. Anything that fails is fixed before you see it.</p></li>
      <li data-step="5"><h3>Present and share</h3><p>Present with a notes window and timer, or export a vector PDF, PNGs or a live link.</p></li>
    </ol>
  </div>
</section>`;

  /* --- 4. QA inspector --------------------------------------------------- */
  const qa = `
<section class="band qa" id="qa" aria-labelledby="qa-h">
  <div class="band-head">
    <h2 id="qa-h">A design check that actually looks.</h2>
    <p>Most tools trust the model. Decklume renders every slide and measures it. Run the check on this broken slide.</p>
  </div>
  <div class="qa-demo" data-qa>
    <div class="qa-slide-wrap">
      <div class="qa-slide" data-qa-slide>
        <div class="qs-head">
          <p class="qs-kicker">Try this week</p>
          <h3 class="qs-h">Three small experiments to sleep on</h3>
          <span class="qs-badge">New</span>
        </div>
        <div class="qs-cards">
          <div class="qs-card"><b>Evening review</b><p>Re-read today’s notes for fifteen minutes before bed.</p></div>
          <div class="qs-card qs-over"><b>Fixed wake time</b><p>Get up at the same time every day, weekends included, even after a late night out with friends, a long weekend trip, or when the alarm feels impossible.</p></div>
          <div class="qs-card"><b>Test yourself</b><p class="qs-faint">Write down what you remember next morning.</p></div>
        </div>
        <p class="qs-source">Source: course reading pack, chapter 9.</p>
      </div>
      <div class="qa-marks" aria-hidden="true">
        <span class="mark" data-mark="overlap" style="--x:59%;--y:20%;--w:22%;--h:22%">${greaseCircle()}</span>
        <span class="mark" data-mark="overflow" style="--x:50%;--y:72%;--w:32%;--h:52%">${greaseCircle()}</span>
        <span class="mark" data-mark="contrast" style="--x:83%;--y:62%;--w:30%;--h:22%">${greaseCircle()}</span>
        <span class="mark" data-mark="type-size" style="--x:24%;--y:93%;--w:40%;--h:14%">${greaseCircle()}</span>
        <span class="loupe">${icon("loupe")}</span>
      </div>
    </div>
    <div class="qa-panel">
      <div class="qa-buttons">
        <button type="button" class="btn btn-primary" data-qa-run>${icon("loupe")}<span>Run design QA</span></button>
        <button type="button" class="btn btn-ghost" data-qa-fix disabled>${icon("check")}<span>Fix and re-run</span></button>
        <button type="button" class="btn btn-ghost btn-icon" data-qa-reset aria-label="Reset the demo">${icon("reset")}</button>
      </div>
      <ol class="findings" aria-live="polite">
        <li data-find="overlap"><code>[overlap]</code> “Three small experiments…” overlaps the badge</li>
        <li data-find="overflow"><code>[clipped]</code> text is cut off inside the second card</li>
        <li data-find="contrast"><code>[contrast]</code> 2.1:1 is below 4.5:1 for “Write down what you…”</li>
        <li data-find="type-size"><code>[type-size]</code> 14px source line is below the 18px minimum</li>
      </ol>
      <p class="qa-result" data-qa-result>Press run to inspect the slide.</p>
      <p class="qa-note">These are four of the checks <code>qa.mjs</code> runs on every slide, with the same rule names. It also checks overflow past the slide edge, web fonts, broken images, leftover placeholder text, JavaScript errors and 16:9 scaling on phones.</p>
    </div>
  </div>
</section>`;

  /* --- 5. Install: the one calm panel ---------------------------------- */
  const prompts = [
    "Make a 10-minute presentation on the causes of World War I for my history class.",
    "Turn lecture-04.pptx into a Chalk-themed deck and keep my speaker notes.",
    "Build a 20-minute thesis defense from my abstract and results.",
    "Pitch deck for our startup, 12 slides, ending with the raise.",
  ];
  const install = `
<section class="band install" id="install" aria-labelledby="install-h">
  <div class="install-panel">
    <h2 id="install-h">Install in two commands.</h2>
    <ol class="install-steps">
      <li><p>In Claude Code, add the marketplace:</p>${command(SITE.install[0], { big: true })}</li>
      <li><p>Then install the plugin:</p>${command(SITE.install[1], { big: true })}</li>
      <li><p>Now just ask, for example:</p><ul class="prompts">${prompts.map((p) => `<li>${command(p)}</li>`).join("")}</ul></li>
    </ol>
    <details class="manual"><summary>Prefer a standalone skill?</summary>${command(SITE.manual[0])}${command(SITE.manual[1])}<p>Requires Node.js 18 or newer. Design QA, previews and PDF export install Playwright once into <code>~/.cache/decklume</code>. PowerPoint import needs <code>pip install python-pptx</code>.</p></details>
  </div>
</section>`;

  /* --- 6. Made for -------------------------------------------------------- */
  const auds = [["students", "campus", 7], ["teachers", "chalk", 4], ["researchers", "atlas", 8], ["founders", "aurora", 14]];
  const made = `
<section class="band made" aria-labelledby="made-h">
  <div class="band-head"><h2 id="made-h">Made for whoever is presenting next.</h2></div>
  <div class="strip strip-wide s4">${auds.map(([a, t, n]) => `<figure class="frame aud"><a class="frame-link" href="for/${a}/"><img src="${frameSrc(root, t, n)}" alt="${esc(AUDIENCES[a].h1)}" width="640" height="360" loading="lazy" decoding="async"></a><figcaption><a href="for/${a}/">${a[0].toUpperCase() + a.slice(1)}</a><span>${esc(AUDIENCES[a].makes.map((m) => m[0]).slice(0, 2).join(" · "))}</span></figcaption></figure>`).join("")}</div>
</section>`;

  /* --- 7. Compared --------------------------------------------------------- */
  const compare = `
<section class="band compare" aria-labelledby="cmp-h">
  <div class="band-head">
    <h2 id="cmp-h">Built on frontend-slides, taken further.</h2>
    <p>Decklume started as a study of Zara Zhang’s excellent <a href="https://github.com/zarazhangrui/frontend-slides">frontend-slides</a>. Where it differs:</p>
  </div>
  <table class="ctable">
    <thead><tr><th scope="col"></th><th scope="col">frontend-slides</th><th scope="col">Decklume</th></tr></thead>
    <tbody>
      <tr><th scope="row">Style previews</th><td>Three separate title-slide files</td><td>Your title and content slides, side by side on one page</td></tr>
      <tr><th scope="row">Verification</th><td>Advice to check screenshots</td><td>Automated QA gate with a contact sheet, run in CI</td></tr>
      <tr><th scope="row">Motion</th><td>Entrance animations</td><td>Entrances, step builds and Magic Move</td></tr>
      <tr><th scope="row">Presenting</th><td>Speaker notes via host</td><td>Presenter window with notes, timer and next slide</td></tr>
      <tr><th scope="row">PDF</th><td>Screenshots, about 20 MB for 18 slides</td><td>Vector with selectable text, 0.8 MB for 25 slides</td></tr>
    </tbody>
  </table>
  <a class="more" href="compare/frontend-slides/">Read the full comparison ${icon("arrow")}</a>
</section>`;

  const close = `
<section class="closing" aria-labelledby="close-h">
  <h2 id="close-h">Your next deck is one prompt away.</h2>
  ${command(SITE.install[1], { big: true })}
  <div class="close-links"><a class="btn btn-primary" href="#install">See both install steps</a><a class="btn btn-ghost" href="${SITE.repo}">${icon("github")}<span>Star on GitHub</span></a></div>
</section>`;

  return page({
    root,
    path: "",
    title: "Decklume — Free AI Presentation Maker for Claude Code",
    description: "Decklume is a free, open-source Claude Code skill that turns any topic, notes or PowerPoint into a beautiful animated HTML presentation: story-first outline, 10 designer themes, Magic Move, presenter view, PDF export and automated design QA.",
    current: "",
    bodyClass: "home",
    jsonld: [
      softwareLd,
      { "@type": "WebSite", "@id": SITE.base + "#website", url: SITE.base, name: "Decklume", description: "AI presentation maker skill for Claude Code" },
      faqLd(FAQ_HOME),
    ],
    body: hero + switcher + story + qa + install + made + compare + faqHtml(FAQ_HOME, "Questions people ask") + close,
  });
}
