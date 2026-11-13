/* Home page: slides flying through a room, then the product in sections. */
import { FACTS } from "./facts.mjs";
import { SITE, SWITCH_SLIDES, FAQ_HOME, AUDIENCES, EXAMPLES, ROOM_FRAMES } from "./content.mjs";
import { page, esc, icon, frameSrc, command, greaseCircle, faqHtml, faqLd, softwareLd } from "./layout.mjs";

const pad = (n) => String(n).padStart(2, "0");

export function home(themes) {
  const root = "";
  const byslug = Object.fromEntries(themes.map((t) => [t.slug, t]));
  const thumb = (t, n, { eager = false, alt = "" } = {}) =>
    `<img src="${frameSrc(root, t, n)}" alt="${esc(alt)}" width="640" height="360" ${eager ? "" : 'loading="lazy" '}decoding="async">`;

  /* --- 1. Hero: a room of slides, and a topic box ------------------------- */
  const walls = Object.entries(ROOM_FRAMES).map(([wall, list]) => `
    <div class="wall wall-${wall}">${list.map(([t, n], i) => `<figure class="fly" style="--i:${i};--n:${list.length};--lane:${i % 2}">${thumb(t, n, { eager: true })}</figure>`).join("")}</div>`).join("");
  const firstPrompt = "Make a presentation about how sleep shapes memory, in the Folio theme.";
  const hero = `
<section class="hero" aria-labelledby="hero-h">
  <div class="room" aria-hidden="true" data-room><div class="room-scene">${walls}</div></div>
  <div class="hero-inner">
    <p class="eyebrow"><span class="dot"></span>Free Claude Code skill · v${FACTS.version}</p>
    <h1 id="hero-h">One prompt.<br>A designed deck.</h1>
    <p class="lede">Turn a topic, your notes or a PowerPoint into an animated presentation that's checked in a real browser before you see it, <em>in one conversation</em>.</p>
    <form class="topic" id="topic-form" data-topic action="#install">
      <span class="topic-at" aria-hidden="true">${icon("spark")}</span>
      <label class="sr" for="topic-in">What is your talk about?</label>
      <input id="topic-in" name="topic" type="text" autocomplete="off" maxlength="140" placeholder="What's your talk about?">
      <label class="sr" for="topic-theme">Theme</label>
      <select id="topic-theme" name="theme">${themes.map((t) => `<option value="${t.slug}">${esc(t.name)}</option>`).join("")}</select>
    </form>
    <div class="hero-cta">
      <button type="submit" class="btn btn-primary btn-lg" form="topic-form">Get my prompt</button>
      <a class="link-arrow" href="demos/folio.html">Play the demo deck ${icon("arrow")}</a>
    </div>
    <div class="recipe" data-recipe>
      <div class="recipe-steps">
        <p class="recipe-h">Paste these into Claude Code, one at a time</p>
        <ol>
          <li>${command(SITE.install[0])}</li>
          <li>${command(SITE.install[1])}</li>
          <li data-recipe-prompt>${command(firstPrompt)}</li>
        </ol>
      </div>
      <a class="recipe-look" href="themes/folio/" data-recipe-look>
        <img src="${frameSrc(root, "folio", 1)}" alt="" width="640" height="360" loading="lazy" decoding="async">
        <span><b data-recipe-name>Folio</b> · see every slide ${icon("arrow")}</span>
      </a>
    </div>
    <a class="proof" href="themes/">
      <span class="swatches-mini" aria-hidden="true">${["folio", "nocturne", "volt", "bloom", "campus"].map((s) => `<i style="--a:${byslug[s].colors.accent};--b:${byslug[s].colors.bg}"></i>`).join("")}</span>
      <span class="proof-txt"><b>${FACTS.themes} themes, ${FACTS.layouts} layouts</b><span>Browse the themes ${icon("arrow")}</span></span>
    </a>
  </div>
</section>`;

  /* --- 2. How it works: four cards, each with a small mock ------------------ */
  const outline = [["01", "title", "How sleep shapes memory"], ["07", "steps", "The night runs in cycles"], ["08", "chart", "Half the night is N2"], ["16", "kpi", "1 in 3 adults sleep < 7 h"]];
  const how = `
<section class="band how" id="how" aria-labelledby="how-h">
  <div class="band-head center">
    <h2 id="how-h">From one sentence. <span class="soft">To a finished deck.</span></h2>
  </div>
  <ol class="how-grid">
    <li class="how-card">
      <div class="mock mock-brief" aria-hidden="true">
        <div class="mini-input"><span>&gt;</span> Make a 15-minute lecture on how sleep shapes memory</div>
        <div class="mini-card">
          <p class="mini-who">${icon("spark")} One round of questions</p>
          <div class="chips-mini"><span>Lecture</span><span>Speaker-led</span><span>~${FACTS.slides} slides</span><span>No images</span></div>
        </div>
      </div>
      <h3><span class="num">01</span> Describe the talk</h3>
      <p>Say who it's for and how long, or hand over notes, a document or a .pptx. Claude asks what it still needs, once.</p>
    </li>
    <li class="how-card">
      <div class="mock mock-outline" aria-hidden="true">
        <div class="mini-card">
          ${outline.map(([n, l, h]) => `<p class="ol-row"><span class="ol-n">${n}</span><span class="ol-l">${l}</span><span class="ol-h">${h}</span></p>`).join("")}
          <p class="mini-actions"><span class="pill">Edit</span><span class="pill pill-on">${icon("check")} Approve</span></p>
        </div>
      </div>
      <h3><span class="num">02</span> Approve the story</h3>
      <p>An outline with one claim per slide and a layout for each. Change anything before a single pixel is designed.</p>
    </li>
    <li class="how-card">
      <div class="mock mock-abc" aria-hidden="true">
        ${["nocturne", "folio", "grid"].map((t, i) => `<figure class="abc abc-${i}${i === 1 ? " is-pick" : ""}">${thumb(t, 17)}<figcaption>${"ABC"[i]} · ${byslug[t].name}</figcaption></figure>`).join("")}
      </div>
      <h3><span class="num">03</span> Pick a look</h3>
      <p>Your own title and content slides, rendered in three themes side by side. Choose one, or ask for a mix.</p>
    </li>
    <li class="how-card">
      <div class="mock mock-flow" aria-hidden="true">
        <div class="flow-row">
          <div class="node">${icon("file")}<b>deck.html</b><span>${FACTS.slides} slides</span></div>
          <div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" pathLength="1"/></svg>${icon("check")}</div>
          <div class="node">${icon("play")}<b>Present</b><span>PDF · link</span></div>
        </div>
        <p class="flow-big">0 errors</p>
        <p class="flow-sub">checked in a real browser</p>
      </div>
      <h3><span class="num">04</span> Checked, then yours</h3>
      <p>Every slide is rendered and measured, and anything that fails is fixed before you see it. Then present, export a PDF, or share a link.</p>
    </li>
  </ol>
  <p class="center-act"><a class="btn btn-primary" href="#hero-h" data-focus-topic>Try it with your topic</a></p>
</section>`;

  /* --- 3. Theme gallery: a slow marquee ------------------------------------- */
  const card = (t, dupe = false) => `<a class="tcard" href="themes/${t.slug}/"${dupe ? ' tabindex="-1"' : ""}><span class="tcard-img">${thumb(t.slug, 1, { alt: dupe ? "" : `${t.name} theme title slide` })}</span><span class="tcard-cap"><b>${esc(t.name)}</b><span>${esc(t.mood[0])}</span></span></a>`;
  const gallery = `
<section class="band gallery" aria-labelledby="gal-h">
  <div class="band-head center">
    <span class="tag tag-l" aria-hidden="true">${FACTS.themes} themes</span>
    <span class="tag tag-r" aria-hidden="true">${FACTS.layouts} layouts</span>
    <h2 id="gal-h">Start from a look<br>people actually present</h2>
    <a class="btn btn-primary" href="themes/">Browse themes</a>
  </div>
  <div class="marquee" data-marquee>
    <div class="marquee-track">${themes.map((t) => card(t)).join("")}<span class="marquee-dupe" aria-hidden="true">${themes.map((t) => card(t, true)).join("")}</span></div>
  </div>
</section>`;

  /* --- 4. Live theme switcher -------------------------------------------------- */
  const switcher = `
<section class="band switcher" id="looks" aria-labelledby="looks-h">
  <div class="band-head center">
    <h2 id="looks-h">One deck. <span class="soft">${FACTS.themes} looks.</span></h2>
    <p>The same ${FACTS.slides}-slide lecture in every theme. Pick a look and a slide: this is the real deck running live, not a screenshot.</p>
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
        ${themes.map((t, i) => `<div data-info="${t.slug}"${i ? " hidden" : ""}><p class="ti-name">${esc(t.name)}</p><p>${esc(t.tagline)}</p><a class="link-arrow" href="themes/${t.slug}/">See every slide in ${esc(t.name)} ${icon("arrow")}</a></div>`).join("")}
      </div>
    </div>
  </div>
</section>`;

  /* --- 5. Bento: everything a deck can do -------------------------------------- */
  const bento = `
<section class="band bento-band" aria-labelledby="bento-h">
  <div class="band-head center"><h2 id="bento-h">Everything a deck can be.</h2></div>
  <div class="bento">
    <article class="tile t-qa">
      <div class="tile-art" aria-hidden="true">
        <ul class="mini-finds">${["overflow", "contrast 4.5:1", "type size", "fonts loaded"].map((f, i) => `<li style="--i:${i}">${icon("check")} ${f}</li>`).join("")}</ul>
      </div>
      <h3>Design QA<span>Checked before you see it</span></h3>
      <p>Every slide rendered at 1920×1080 and measured, with a contact sheet.</p>
    </article>
    <article class="tile t-morph">
      <div class="tile-art morph-art" aria-hidden="true">${thumb("aurora", 16)}<span class="morph-arrow">${icon("arrow")}</span>${thumb("aurora", 17)}</div>
      <h3>Magic Move<span>Numbers glide across slides</span></h3>
      <p>Keynote-style transitions that carry a figure from one slide to the next.</p>
    </article>
    <article class="tile t-presenter t-dark">
      <div class="tile-art pv" aria-hidden="true">
        <div class="pv-now">${thumb("nocturne", 8)}</div>
        <div class="pv-side"><div class="pv-next">${thumb("nocturne", 9)}</div><p class="pv-clock">12:04</p></div>
      </div>
      <h3>Presenter view<span>Notes, timer, next slide</span></h3>
      <p>Press P for a second window, synced live with the deck.</p>
    </article>
    <article class="tile t-pptx t-accent">
      <div class="tile-art pptx-art" aria-hidden="true">
        <span class="file-chip">${icon("file")} lecture-04.pptx</span>
        <span class="pptx-arrow">${icon("arrow")}</span>
        <span class="pptx-stack">${thumb("chalk", 4)}${thumb("chalk", 7)}</span>
      </div>
      <h3>Bring your PowerPoint<span>Redesigned, notes kept</span></h3>
      <p>Bullet levels, tables, grouped images, speaker notes and native chart data all come across.</p>
    </article>
    <article class="tile t-charts t-dark t-wide">
      <div class="tile-art charts-art" aria-hidden="true">${thumb("volt", 8)}${thumb("campus", 10)}</div>
      <div class="tile-copy">
        <h3>Charts that draw themselves<span>Labelled on the chart, from your data</span></h3>
        <p>Bar, line and donut charts in SVG, in the theme's colours, built step by step.</p>
      </div>
    </article>
    <article class="tile t-num">
      <p class="big-num">1.1 MB</p>
      <p class="num-sub">vector PDF, all ${FACTS.slides} slides</p>
      <p>Selectable text and every build step shown. Small enough to email.</p>
    </article>
    <article class="tile t-file t-dark">
      <p class="big-num">1 file</p>
      <p class="num-sub">the whole deck, offline</p>
      <p>Opens in any browser on any computer. Nothing to install.</p>
    </article>
  </div>
</section>`;

  /* --- 6. QA inspector ------------------------------------------------------------ */
  const qa = `
<section class="band qa" id="qa" aria-labelledby="qa-h">
  <div class="band-head center">
    <h2 id="qa-h">A design check <span class="soft">that actually looks.</span></h2>
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
        <button type="button" class="btn btn-quiet" data-qa-fix disabled>${icon("check")}<span>Fix and re-run</span></button>
        <button type="button" class="btn btn-quiet btn-icon" data-qa-reset aria-label="Reset the demo">${icon("reset")}</button>
      </div>
      <ol class="findings" aria-live="polite">
        <li data-find="overlap"><code>[overlap]</code> “Three small experiments…” overlaps the badge</li>
        <li data-find="overflow"><code>[clipped]</code> text is cut off inside the second card</li>
        <li data-find="contrast"><code>[contrast]</code> 2.1:1 is below 4.5:1 for “Write down what you…”</li>
        <li data-find="type-size"><code>[type-size]</code> 14px source line is below the 18px minimum</li>
      </ol>
      <p class="qa-result" data-qa-result>Press run to inspect the slide.</p>
      <p class="qa-note">Four of the checks <code>qa.mjs</code> runs on every slide, with the same rule names. It also checks overflow past the slide edge, web fonts, broken images, placeholder text, JavaScript errors and 16:9 scaling on phones.</p>
    </div>
  </div>
</section>`;

  /* --- 7. Examples and audiences ---------------------------------------------- */
  const exCard = (ex) => `
    <article class="excard">
      <header><span class="ex-ic" style="--a:${byslug[ex.theme].colors.accent};--b:${byslug[ex.theme].colors.bg}"></span><span class="ex-t"><b>${esc(ex.title)}</b><small>${esc(ex.kind)} · ${esc(byslug[ex.theme].name)} · ${ex.slides} slides</small></span><a class="pill pill-dark" href="examples/${ex.slug}.html">Play</a></header>
      <a class="excard-img" href="examples/${ex.slug}.html" tabindex="-1"><img src="assets/examples/${ex.slug}/${pad(ex.frames[0])}.webp" alt="${esc(ex.title)}, title slide" width="640" height="360" loading="lazy" decoding="async"></a>
    </article>`;
  const auds = [["students", "campus", 7], ["teachers", "chalk", 4], ["researchers", "atlas", 8], ["founders", "aurora", 16]];
  const made = `
<section class="band made" aria-labelledby="made-h">
  <div class="made-head">
    <h2 id="made-h">Real decks you can play, <span class="soft">and one for every room.</span></h2>
    <div class="made-cols">
      <p><b>Examples.</b> Four complete presentations, from a lecture to a seed pitch. Open one and use the arrow keys; press P for the presenter view. <a class="link-arrow" href="examples/">See the examples ${icon("arrow")}</a></p>
      <p><b>Made for.</b> Students, teachers, researchers and founders each get prompts to copy and themes to start with. <a class="link-arrow" href="for/students/">Find your room ${icon("arrow")}</a></p>
    </div>
  </div>
  <div class="ex-grid">${EXAMPLES.map(exCard).join("")}</div>
  <div class="aud-row">${auds.map(([a, t, n]) => `<a class="aud-card" href="for/${a}/"><span class="aud-img">${thumb(t, n, { alt: AUDIENCES[a].h1 })}</span><b>${a[0].toUpperCase() + a.slice(1)}</b><span>${esc(AUDIENCES[a].makes.map((m) => m[0]).slice(0, 2).join(" · "))}</span></a>`).join("")}</div>
</section>`;

  /* --- 9. Install, set like a pricing table ----------------------------------------- */
  const prompts = [
    "Make a 10-minute presentation on the causes of World War I for my history class.",
    "Turn lecture-04.pptx into a Chalk-themed deck and keep my speaker notes.",
    "Pitch deck for our startup, 12 slides, ending with the raise.",
  ];
  const install = `
<section class="band install" id="install" aria-labelledby="install-h">
  <div class="band-head center">
    <h2 id="install-h" class="serif">Simply free.</h2>
    <p>No account and no subscription. Decklume is <b>MIT-licensed</b> and runs inside <b>Claude Code</b>.</p>
  </div>
  <div class="plans">
    <article class="plan plan-main">
      <p class="plan-tag">Recommended</p>
      <h3>Claude Code plugin</h3>
      <p class="plan-price">$0 <small>forever</small></p>
      <ol class="plan-steps"><li><p>Add the marketplace</p>${command(SITE.install[0])}</li><li><p>Install the plugin</p>${command(SITE.install[1])}</li></ol>
    </article>
    <article class="plan">
      <p class="plan-tag">Manual</p>
      <h3>Standalone skill</h3>
      <p class="plan-price">$0 <small>Node 18+</small></p>
      <ol class="plan-steps"><li><p>Clone the repo</p>${command(SITE.manual[0])}</li><li><p>Copy the skill</p>${command(SITE.manual[1])}</li></ol>
    </article>
    <article class="plan">
      <p class="plan-tag">Then</p>
      <h3>Just ask</h3>
      <p class="plan-price">1 <small>prompt</small></p>
      <ul class="plan-steps">${prompts.map((p) => `<li>${command(p)}</li>`).join("")}</ul>
    </article>
  </div>
  <p class="install-note">Needs Node.js 18 or newer. Design QA, previews and PDF export install Playwright once into <code>~/.cache/decklume</code>, never into your project.</p>
</section>`;

  const close = `
<section class="closing" aria-labelledby="close-h">
  <h2 id="close-h">Your next deck is <span class="serif">one prompt</span> away.</h2>
  <div class="close-links"><a class="btn btn-primary btn-lg" href="#hero-h" data-focus-topic>Get my prompt</a><a class="btn btn-quiet btn-lg" href="${SITE.repo}">${icon("star")}<span>Star on GitHub</span></a></div>
</section>`;

  return page({
    root,
    path: "",
    title: "Decklume — Free AI Presentation Maker for Claude Code",
    description: `Decklume is a free, open-source Claude Code skill that turns any topic, notes or PowerPoint into a beautiful animated HTML presentation: story-first outline, ${FACTS.themes} designer themes, Magic Move, presenter view, PDF export and automated design QA.`,
    current: "",
    bodyClass: "home",
    jsonld: [
      softwareLd,
      { "@type": "WebSite", "@id": SITE.base + "#website", url: SITE.base, name: "Decklume", description: "AI presentation maker skill for Claude Code" },
      faqLd(FAQ_HOME),
    ],
    body: hero + how + gallery + switcher + bento + qa + made + install + faqHtml(FAQ_HOME, "Questions people ask") + close,
  });
}
