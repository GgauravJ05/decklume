/* =====================================================================
   DECKLUME · RUNTIME
   Scaling, navigation, builds, Magic-Move morphs (View Transitions),
   overview, presenter window, inline editing and help. No dependencies.
   ===================================================================== */
(() => {
  "use strict";

  const W = 1920;
  const H = 1080;
  const params = new URLSearchParams(location.search);
  const MODE = params.has("presenter") ? "presenter" : params.has("embed") ? "embed" : "deck";
  const root = document.documentElement;

  // Blocks that get the staggered entrance, in reading order.
  const ENTER_SELECTOR = [
    ":scope > :not(.notes, .media, .bg, [data-enter='none'])",
    ":scope > header > *",
    ".cards > *", ".stats > *", ".steps > *", ".timeline > *", ".people > *",
    ".agenda > *", ".points > *", ".flow > *", ".gallery > *", ".columns > *",
    ".contact > *", ".body > *", ".takeaway > *",
  ].join(",");

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  class Deck {
    constructor() {
      this.viewport = document.querySelector(".deck-viewport");
      this.stage = document.querySelector(".deck-stage");
      this.slides = [...this.stage.querySelectorAll(":scope > .slide")];
      this.index = 0;
      this.stepIndex = 0; // number of steps currently shown on the active slide
      this.overview = false;
      this.editing = false;
      this.presenterWin = null;
      this.channel = "BroadcastChannel" in window ? new BroadcastChannel("decklume:" + location.pathname) : null;

      this.prepareSlides();
      this.scale = this.scale.bind(this);
      window.addEventListener("resize", this.scale);
      this.scale();

      if (MODE === "embed") root.classList.add("dl-embed");
      if (MODE !== "embed") this.buildChrome();
      this.bindInput();
      this.bindMessages();

      const start = this.readHash();
      this.go(start.index, { steps: start.steps, instant: true });
      requestAnimationFrame(() => root.classList.add("dl-ready"));
    }

    /* --- Setup --------------------------------------------------------- */
    prepareSlides() {
      this.slides.forEach((slide, n) => {
        slide.setAttribute("aria-roledescription", "slide");
        slide.setAttribute("aria-label", `${n + 1} of ${this.slides.length}`);

        // Steps: explicit .step elements, ordered by data-step then DOM order.
        const steps = [...slide.querySelectorAll(".step")];
        steps.forEach((el, i) => (el.dataset.dlOrder = el.dataset.step ?? i));
        slide._steps = steps.sort((a, b) => Number(a.dataset.dlOrder) - Number(b.dataset.dlOrder));

        // Entrance choreography.
        if (slide.dataset.enter === "none") return;
        let i = 0;
        slide.querySelectorAll(ENTER_SELECTOR).forEach((el) => {
          if (el.matches(".step, [data-morph], .notes, script, style") || el.closest("[data-morph]")) return;
          if (el.classList.contains("dl-enter")) return;
          // Containers whose children animate don't animate themselves.
          if (el.matches(".cards, .stats, .steps, .timeline, .people, .agenda, .points, .flow, .gallery, .columns, .contact, .body, .takeaway, header")) return;
          el.classList.add("dl-enter");
          el.style.setProperty("--i", String(Math.min(i++, 9)));
        });
      });
    }

    scale() {
      if (this.overview) return this.layoutOverview();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = Math.min(vw / W, vh / H);
      const x = (vw - W * s) / 2;
      const y = (vh - H * s) / 2;
      this.stage.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    }

    /* --- Navigation ------------------------------------------------------ */
    next() {
      const steps = this.slides[this.index]._steps;
      if (this.stepIndex < steps.length) return this.setSteps(this.stepIndex + 1);
      if (this.index < this.slides.length - 1) this.go(this.index + 1);
    }

    prev() {
      if (this.stepIndex > 0) return this.setSteps(this.stepIndex - 1);
      if (this.index > 0) this.go(this.index - 1, { steps: Infinity });
    }

    go(target, { steps = 0, instant = false } = {}) {
      const n = Math.max(0, Math.min(target, this.slides.length - 1));
      const from = this.slides[this.index];
      const to = this.slides[n];
      const changed = from !== to || instant;

      const swap = () => {
        this.slides.forEach((s) => s.classList.toggle("is-active", s === to));
        this.index = n;
        this.setSteps(steps === Infinity ? to._steps.length : steps, { silent: true });
        if (changed) this.playEntrance(to);
        this.afterChange();
      };

      const morphs = from !== to ? this.matchMorphs(from, to) : [];
      const canVT = !instant && from !== to && document.startViewTransition && !reduceMotion && !this.overview;

      if (canVT) {
        this.nameMorphs(morphs, "from");
        root.classList.add("dl-vt");
        root.style.setProperty("--vt-dir", n > this.index ? "1" : "-1");
        const vt = document.startViewTransition(() => {
          this.clearMorphNames(morphs);
          swap();
          this.nameMorphs(morphs, "to");
        });
        vt.finished.finally(() => {
          this.clearMorphNames(morphs);
          root.classList.remove("dl-vt");
        });
      } else {
        swap();
      }
    }

    setSteps(count, { silent = false } = {}) {
      const slide = this.slides[this.index];
      const steps = slide._steps;
      this.stepIndex = Math.max(0, Math.min(count, steps.length));
      const dimPrev = slide.hasAttribute("data-dim");
      steps.forEach((el, i) => {
        el.classList.toggle("is-shown", i < this.stepIndex);
        el.classList.toggle("is-dimmed", dimPrev && i < this.stepIndex - 1);
      });
      if (!silent) this.afterChange();
    }

    playEntrance(slide) {
      if (reduceMotion || MODE === "embed") return;
      slide.classList.remove("is-entering");
      void slide.offsetWidth; // restart the animation
      slide.classList.add("is-entering");
      clearTimeout(slide._enterTimer);
      slide._enterTimer = setTimeout(() => slide.classList.remove("is-entering"), 2600);
    }

    afterChange() {
      const total = this.slides.length;
      root.style.setProperty("--dl-progress", total > 1 ? String(this.index / (total - 1)) : "1");
      if (this.countEl) this.countEl.textContent = `${this.index + 1} / ${total}`;
      if (MODE === "deck") {
        const hash = `#/${this.index + 1}`;
        if (location.hash !== hash) history.replaceState(null, "", hash);
      }
      this.broadcast();
      document.dispatchEvent(new CustomEvent("decklume:change", { detail: { index: this.index, step: this.stepIndex } }));
    }

    readHash() {
      const m = location.hash.match(/^#\/(\d+)(?:\.(\d+))?/);
      return m ? { index: Number(m[1]) - 1, steps: Number(m[2] || 0) } : { index: 0, steps: 0 };
    }

    /* --- Magic Move ---------------------------------------------------------
       Elements sharing a data-morph value on consecutive slides glide from
       one position to the other through a View Transition. */
    matchMorphs(from, to) {
      const pairs = [];
      from.querySelectorAll("[data-morph]").forEach((a) => {
        const key = a.dataset.morph;
        const b = to.querySelector(`[data-morph="${CSS.escape(key)}"]`);
        if (b) pairs.push({ key, from: a, to: b });
      });
      return pairs;
    }

    nameMorphs(pairs, side) {
      pairs.forEach((p, i) => {
        p[side].style.viewTransitionName = `dl-morph-${i}-${p.key.replace(/[^a-z0-9_-]/gi, "")}`;
      });
    }

    clearMorphNames(pairs) {
      pairs.forEach((p) => {
        p.from.style.viewTransitionName = "";
        p.to.style.viewTransitionName = "";
      });
    }

    /* --- Overview (O) --------------------------------------------------- */
    toggleOverview(force) {
      this.overview = force ?? !this.overview;
      root.classList.toggle("dl-overview", this.overview);
      if (this.overview) {
        this.layoutOverview();
        this.slides[this.index].scrollIntoView({ block: "center" });
      } else {
        this.slides.forEach((s) => (s.style.transform = ""));
        this.stage.style.height = "";
        this.scale();
      }
    }

    layoutOverview() {
      const cols = window.innerWidth < 900 ? 2 : 4;
      const gap = 120;
      this.slides.forEach((s, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        s.style.transform = `translate(${c * (W + gap)}px, ${r * (H + gap)}px)`;
      });
      const rows = Math.ceil(this.slides.length / cols);
      const fullW = cols * W + (cols - 1) * gap;
      const pad = 40;
      const s = (window.innerWidth - pad * 2) / fullW;
      this.stage.style.height = `${rows * (H + gap)}px`;
      this.stage.style.transform = `translate(${pad}px, ${pad}px) scale(${s})`;
    }

    /* --- Chrome ------------------------------------------------------------- */
    buildChrome() {
      const progress = document.createElement("div");
      progress.className = "dl-progress";
      progress.setAttribute("aria-hidden", "true");

      const hud = document.createElement("nav");
      hud.className = "dl-hud";
      hud.setAttribute("aria-label", "Slide controls");
      hud.innerHTML = `
        <button type="button" data-act="prev" aria-label="Previous slide">&#8592;</button>
        <span class="dl-count" aria-live="polite"></span>
        <button type="button" data-act="next" aria-label="Next slide">&#8594;</button>
        <button type="button" data-act="overview" aria-label="Overview (O)">&#9638;</button>
        <button type="button" data-act="presenter" aria-label="Presenter view (P)">P</button>
        <button type="button" data-act="help" aria-label="Keyboard shortcuts (?)">?</button>`;
      hud.addEventListener("click", (e) => {
        const act = e.target.closest("button")?.dataset.act;
        if (act) this.command(act);
      });
      this.countEl = hud.querySelector(".dl-count");

      const help = document.createElement("div");
      help.className = "dl-help";
      help.setAttribute("role", "dialog");
      help.setAttribute("aria-label", "Keyboard shortcuts");
      help.innerHTML = `
        <div class="dl-help-card">
          <h2>Keyboard shortcuts</h2>
          <dl>
            <dt>→ Space</dt><dd>Next step / slide</dd>
            <dt>←</dt><dd>Previous</dd>
            <dt>Home End</dt><dd>First / last slide</dd>
            <dt>12 ⏎</dt><dd>Jump to slide 12</dd>
            <dt>O</dt><dd>Overview</dd>
            <dt>P</dt><dd>Presenter window (notes, timer, next slide)</dd>
            <dt>F</dt><dd>Fullscreen</dd>
            <dt>B</dt><dd>Blackout</dd>
            <dt>E</dt><dd>Edit text · ⌘/Ctrl+S saves</dd>
            <dt>G</dt><dd>Grid overlay</dd>
          </dl>
          <p class="dl-credit">Made with <a href="https://github.com/GgauravJ05/decklume" target="_blank" rel="noopener">Decklume</a></p>
        </div>`;
      help.addEventListener("click", (e) => e.target === help && help.classList.remove("is-open"));

      const toast = document.createElement("div");
      toast.className = "dl-toast";
      toast.setAttribute("role", "status");

      document.body.append(progress, hud, help, toast);
      this.hud = hud;
      this.help = help;
      this.toastEl = toast;

      // Reveal the HUD briefly whenever the mouse moves.
      let t;
      window.addEventListener("mousemove", () => {
        hud.classList.add("is-visible");
        clearTimeout(t);
        t = setTimeout(() => hud.classList.remove("is-visible"), 1800);
      });
    }

    toast(msg) {
      if (!this.toastEl) return;
      this.toastEl.textContent = msg;
      this.toastEl.classList.add("is-visible");
      clearTimeout(this._toastT);
      this._toastT = setTimeout(() => this.toastEl.classList.remove("is-visible"), 1800);
    }

    command(act) {
      switch (act) {
        case "next": return this.next();
        case "prev": return this.prev();
        case "first": return this.go(0);
        case "last": return this.go(this.slides.length - 1);
        case "overview": return this.toggleOverview();
        case "presenter": return this.openPresenter();
        case "help": return this.help?.classList.toggle("is-open");
        case "fullscreen":
          return document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen?.();
        case "blackout": return root.classList.toggle("dl-blackout");
        case "grid": return root.classList.toggle("dl-grid-on");
        case "edit": return this.toggleEdit();
        case "save": return this.save();
      }
    }

    /* --- Input -------------------------------------------------------------- */
    bindInput() {
      if (MODE === "embed") return;
      let typed = "";

      document.addEventListener("keydown", (e) => {
        const inText = e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          return this.command("save");
        }
        if (inText) {
          if (e.key === "Escape") this.toggleEdit(false);
          return;
        }
        if (e.metaKey || e.ctrlKey || e.altKey) return;

        if (/^\d$/.test(e.key)) {
          typed += e.key;
          return;
        }
        if (e.key === "Enter" && typed) {
          this.go(Number(typed) - 1);
          if (this.overview) this.toggleOverview(false);
          typed = "";
          return;
        }
        typed = "";

        const map = {
          ArrowRight: "next", ArrowDown: "next", " ": "next", PageDown: "next", n: "next", l: "next",
          ArrowLeft: "prev", ArrowUp: "prev", PageUp: "prev", Backspace: "prev", h: "prev",
          Home: "first", End: "last",
          o: "overview", O: "overview",
          p: "presenter", P: "presenter", f: "fullscreen", F: "fullscreen", b: "blackout", B: "blackout", ".": "blackout",
          e: "edit", E: "edit", g: "grid", G: "grid", "?": "help",
        };
        if (e.key === "Escape") {
          if (this.help?.classList.contains("is-open")) return this.help.classList.remove("is-open");
          if (this.overview) return this.toggleOverview(false);
          if (this.editing) return this.toggleEdit(false);
          return;
        }
        const act = map[e.key];
        if (act) {
          e.preventDefault();
          if (this.overview && (act === "next" || act === "prev")) {
            this.go(this.index + (act === "next" ? 1 : -1));
            return;
          }
          this.command(act);
        }
      });

      // Overview: click a slide to open it.
      this.stage.addEventListener("click", (e) => {
        if (!this.overview) return;
        const slide = e.target.closest(".slide");
        if (!slide) return;
        this.go(this.slides.indexOf(slide), { instant: true });
        this.toggleOverview(false);
      });

      // Wheel / trackpad, debounced so one gesture is one move.
      let wheelLock = 0;
      window.addEventListener("wheel", (e) => {
        if (this.overview || this.editing) return;
        const now = Date.now();
        if (now < wheelLock || Math.abs(e.deltaY) < 24) return;
        wheelLock = now + 650;
        e.deltaY > 0 ? this.next() : this.prev();
      }, { passive: true });

      // Touch swipe.
      let sx = 0, sy = 0;
      window.addEventListener("touchstart", (e) => {
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
      }, { passive: true });
      window.addEventListener("touchend", (e) => {
        if (this.overview || this.editing) return;
        const dx = e.changedTouches[0].clientX - sx;
        const dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? this.next() : this.prev();
      });

      window.addEventListener("hashchange", () => {
        const h = this.readHash();
        if (h.index !== this.index) this.go(h.index, { steps: h.steps });
      });
    }

    /* --- Presenter sync --------------------------------------------------- */
    state() {
      return { type: "decklume:state", index: this.index, step: this.stepIndex };
    }

    broadcast() {
      if (this._fromRemote) return;
      const msg = this.state();
      try { this.presenterWin && !this.presenterWin.closed && this.presenterWin.postMessage(msg, "*"); } catch {}
      try { MODE === "presenter" && window.opener && window.opener.postMessage(msg, "*"); } catch {}
      try { this.channel && this.channel.postMessage(msg); } catch {}
    }

    receive(data) {
      if (!data || data.type !== "decklume:state") return;
      if (data.index === this.index && data.step === this.stepIndex) return;
      this._fromRemote = true;
      if (data.index !== this.index) this.go(data.index, { steps: data.step, instant: MODE === "embed" });
      else this.setSteps(data.step);
      this._fromRemote = false;
    }

    bindMessages() {
      window.addEventListener("message", (e) => this.receive(e.data));
      if (this.channel) this.channel.onmessage = (e) => this.receive(e.data);
    }

    openPresenter() {
      const url = location.href.split("#")[0].split("?")[0] + "?presenter#/" + (this.index + 1);
      this.presenterWin = window.open(url, "decklume-presenter", "width=1280,height=800");
      if (!this.presenterWin) this.toast("Allow pop-ups to open the presenter window");
    }

    /* --- Inline editing (E) --------------------------------------------- */
    toggleEdit(force) {
      this.editing = force ?? !this.editing;
      root.classList.toggle("dl-editing", this.editing);
      const sel = "h1, h2, h3, h4, p, li, blockquote, figcaption, td, th, .value, .label, .when, .term, .meaning, cite";
      this.stage.querySelectorAll(".slide").forEach((slide) => {
        slide.querySelectorAll(sel).forEach((el) => {
          // Only the innermost editable element, so nested markup stays intact.
          if (this.editing && !el.querySelector(sel)) el.setAttribute("contenteditable", "true");
          else el.removeAttribute("contenteditable");
        });
      });
      this.toast(this.editing ? "Editing · ⌘/Ctrl+S to save · Esc to finish" : "Editing off");
    }

    /** Clean HTML source of the deck, without runtime state. */
    serialize() {
      return serialize();
    }

    async save() {
      const was = this.editing;
      if (was) this.toggleEdit(false);
      const html = serialize();
      if (was) this.toggleEdit(true);
      const name = decodeURIComponent(location.pathname.split("/").pop() || "deck.html");
      try {
        if (window.showSaveFilePicker) {
          const handle = await window.showSaveFilePicker({ suggestedName: name, types: [{ description: "HTML", accept: { "text/html": [".html"] } }] });
          const w = await handle.createWritable();
          await w.write(html);
          await w.close();
          return this.toast("Saved");
        }
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      this.toast("Downloaded " + name);
    }
  }

  /* Serialise the document back to clean source: strip runtime state. */
  function serialize() {
    const clone = document.documentElement.cloneNode(true);
    clone.classList.remove("dl-ready", "dl-overview", "dl-editing", "dl-blackout", "dl-grid-on", "dl-vt", "dl-embed");
    if (!clone.classList.length) clone.removeAttribute("class");
    clone.style.removeProperty("--dl-progress");
    clone.style.removeProperty("--vt-dir");
    if (!clone.getAttribute("style")) clone.removeAttribute("style");
    clone.querySelectorAll(".dl-progress, .dl-hud, .dl-help, .dl-toast, [data-dl-generated]").forEach((n) => n.remove());
    const stage = clone.querySelector(".deck-stage");
    if (stage) { stage.style.transform = ""; stage.style.height = ""; if (!stage.getAttribute("style")) stage.removeAttribute("style"); }
    clone.querySelectorAll(".slide").forEach((s) => {
      s.classList.remove("is-active", "is-entering");
      s.removeAttribute("aria-roledescription");
      s.removeAttribute("aria-label");
      s.style.transform = "";
      if (!s.getAttribute("style")) s.removeAttribute("style");
    });
    clone.querySelectorAll(".dl-enter").forEach((el) => {
      el.classList.remove("dl-enter");
      el.style.removeProperty("--i");
      if (!el.getAttribute("style")) el.removeAttribute("style");
      if (!el.classList.length) el.removeAttribute("class");
    });
    clone.querySelectorAll(".step").forEach((el) => { el.classList.remove("is-shown", "is-dimmed"); delete el.dataset.dlOrder; });
    clone.querySelectorAll("[contenteditable]").forEach((el) => el.removeAttribute("contenteditable"));
    clone.querySelectorAll("[data-morph]").forEach((el) => { el.style.viewTransitionName = ""; if (!el.getAttribute("style")) el.removeAttribute("style"); });
    return "<!DOCTYPE html>\n" + clone.outerHTML + "\n";
  }

  /* =====================================================================
     PRESENTER WINDOW
     Current slide, next slide, notes, timer. Two embedded copies of the
     deck are driven by postMessage, so it works from file:// too.
     ===================================================================== */
  function presenter() {
    const slides = [...document.querySelectorAll(".deck-stage > .slide")];
    const notes = slides.map((s) => s.querySelector(".notes")?.innerHTML.trim() || "");
    const steps = slides.map((s) => s.querySelectorAll(".step").length);
    const title = document.title;
    const base = location.href.split("#")[0].split("?")[0];
    const startHash = location.hash.match(/^#\/(\d+)/);
    let index = startHash ? Number(startHash[1]) - 1 : 0;
    let step = 0;
    const startedAt = Date.now();
    let paused = 0, pausedAt = 0;

    document.body.innerHTML = `
      <div class="pv">
        <header class="pv-bar">
          <span class="pv-title"></span>
          <span class="pv-timer" title="Click to pause, double-click to reset">00:00</span>
          <span class="pv-clock"></span>
          <span class="pv-count"></span>
        </header>
        <section class="pv-current"><div class="pv-frame"><iframe title="Current slide"></iframe></div></section>
        <aside class="pv-side">
          <div class="pv-next-label">Next</div>
          <div class="pv-next pv-frame"><iframe title="Next slide"></iframe></div>
          <div class="pv-notes" aria-live="polite"></div>
        </aside>
      </div>`;
    const style = document.createElement("style");
    style.textContent = `
      html,body{overflow:hidden;background:#0d0d0f;color:#eee;font:16px/1.55 ui-sans-serif,system-ui,sans-serif;margin:0;height:100%}
      .pv{display:grid;grid-template-columns:1.7fr 1fr;grid-template-rows:auto 1fr;gap:16px;height:100%;padding:16px;box-sizing:border-box}
      .pv-bar{grid-column:1/-1;display:flex;gap:24px;align-items:center;font-variant-numeric:tabular-nums}
      .pv-title{flex:1;color:#999;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .pv-timer{font-size:28px;font-weight:600;cursor:pointer;user-select:none}
      .pv-timer.is-paused{color:#e8b04a}
      .pv-clock,.pv-count{color:#999;font-size:18px}
      .pv-frame{position:relative;aspect-ratio:16/9;background:#000;border-radius:8px;overflow:hidden}
      .pv-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none}
      .pv-current{display:grid;align-content:center;min-height:0}
      .pv-side{display:grid;grid-template-rows:auto auto 1fr;gap:10px;min-height:0}
      .pv-next-label{color:#999;font-size:13px;letter-spacing:.12em;text-transform:uppercase}
      .pv-next{opacity:.85}
      .pv-notes{overflow:auto;font-size:22px;line-height:1.5;padding:16px 4px;color:#f2f2f2}
      .pv-notes:empty::before{content:"No notes for this slide.";color:#666}
      .pv-notes p{margin:0 0 .8em}`;
    document.head.append(style);
    document.title = "Presenter · " + title;
    document.querySelector(".pv-title").textContent = title;

    const [cur, nxt] = document.querySelectorAll("iframe");
    cur.src = `${base}?embed#/${index + 1}`;
    nxt.src = `${base}?embed#/${Math.min(index + 2, slides.length)}`;

    const post = (frame, msg) => { try { frame.contentWindow.postMessage(msg, "*"); } catch {} };
    const render = (fromOpener = false) => {
      post(cur, { type: "decklume:state", index, step });
      // "Next" shows the next build step, or the next slide fully built.
      if (step < steps[index]) post(nxt, { type: "decklume:state", index, step: step + 1 });
      else post(nxt, { type: "decklume:state", index: Math.min(index + 1, slides.length - 1), step: index + 1 < slides.length ? steps[index + 1] : steps[index] });
      document.querySelector(".pv-notes").innerHTML = notes[index];
      document.querySelector(".pv-count").textContent = `${index + 1} / ${slides.length}`;
      history.replaceState(null, "", `?presenter#/${index + 1}`);
      if (!fromOpener) { try { window.opener && window.opener.postMessage({ type: "decklume:state", index, step }, "*"); } catch {} }
    };
    cur.addEventListener("load", () => render(true));
    nxt.addEventListener("load", () => render(true));

    const move = (dir) => {
      if (dir > 0) {
        if (step < steps[index]) step++;
        else if (index < slides.length - 1) { index++; step = 0; }
      } else {
        if (step > 0) step--;
        else if (index > 0) { index--; step = steps[index]; }
      }
      render();
    };

    document.addEventListener("keydown", (e) => {
      if (["ArrowRight", "ArrowDown", " ", "PageDown", "n"].includes(e.key)) { e.preventDefault(); move(1); }
      if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); move(-1); }
      if (e.key === "Home") { index = 0; step = 0; render(); }
      if (e.key === "End") { index = slides.length - 1; step = 0; render(); }
    });
    window.addEventListener("message", (e) => {
      const d = e.data;
      if (d && d.type === "decklume:state" && e.source === window.opener) { index = d.index; step = d.step; render(true); }
    });

    const timer = document.querySelector(".pv-timer");
    timer.addEventListener("click", () => {
      if (pausedAt) { paused += Date.now() - pausedAt; pausedAt = 0; } else pausedAt = Date.now();
      timer.classList.toggle("is-paused", !!pausedAt);
    });
    let resetAt = startedAt;
    timer.addEventListener("dblclick", () => { resetAt = Date.now(); paused = 0; pausedAt = 0; timer.classList.remove("is-paused"); });
    const pad = (n) => String(n).padStart(2, "0");
    setInterval(() => {
      const ms = (pausedAt || Date.now()) - resetAt - paused;
      const s = Math.max(0, Math.floor(ms / 1000));
      timer.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
      document.querySelector(".pv-clock").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }, 500);
  }

  const boot = () => {
    if (MODE === "presenter") return presenter();
    window.decklume = new Deck();
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
