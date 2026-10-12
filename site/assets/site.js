/* =====================================================================
   Decklume website behaviour. Progressive enhancement only: every
   section reads and works as plain HTML before this runs.
   ===================================================================== */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const pad = (n) => String(n).padStart(2, "0");
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const ROOT = (() => {
    const css = $('link[href$="assets/site.css"]');
    return css ? css.getAttribute("href").replace(/assets\/site\.css$/, "") : "";
  })();

  /* --- Copy commands ---------------------------------------------------- */
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".cmd-copy");
    if (!btn) return;
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    const label = $(".cmd-label", btn);
    btn.classList.add("is-copied");
    label.textContent = "Copied";
    btn.setAttribute("aria-label", "Copied to clipboard");
    clearTimeout(btn._t);
    btn._t = setTimeout(() => {
      btn.classList.remove("is-copied");
      label.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy command");
    }, 1800);
  });

  /* --- Mobile navigation ----------------------------------------------- */
  const toggle = $(".nav-toggle");
  if (toggle) {
    const list = $("#nav-list");
    const set = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      list.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => e.key === "Escape" && set(false));
    document.addEventListener("click", (e) => !e.target.closest(".masthead nav") && set(false));
  }

  /* --- Deck frames: load a live demo deck into a .screen ------------------ */
  function mountDeck(screen, theme, slide, onReady) {
    const frame = document.createElement("iframe");
    frame.src = `${ROOT}demos/${theme}.html#/${slide}`;
    frame.title = `Playable demo deck in the ${theme} theme`;
    frame.setAttribute("allow", "fullscreen");
    frame.addEventListener("load", () => {
      let deck = null;
      try { deck = frame.contentWindow.decklume; } catch {}
      frame.classList.add("is-live");
      onReady && onReady(frame, deck);
    });
    screen.append(frame);
    return frame;
  }

  const whenNear = (el, fn) => {
    if (!("IntersectionObserver" in window)) return fn();
    const io = new IntersectionObserver((entries) => {
      if (entries.some((x) => x.isIntersecting)) {
        io.disconnect();
        (window.requestIdleCallback || setTimeout)(fn, { timeout: 1200 });
      }
    }, { rootMargin: "200px" });
    io.observe(el);
  };

  /* --- Playable prints (hero and theme pages) ------------------------- */
  $$("[data-player]").forEach((el) => {
    const screen = $(".screen", el);
    const count = $("[data-count]", el);
    let ready = null;
    const show = (i) => (count.textContent = pad(i + 1));
    // One shared promise, so a press during loading waits instead of vanishing.
    const load = () =>
      (ready ||= new Promise((resolve) => {
        mountDeck(screen, el.dataset.theme, 1, (f, d) => {
          if (d) f.contentDocument.addEventListener("decklume:change", (e) => show(e.detail.index));
          resolve(d);
        });
      }));
    whenNear(el, load);
    el.addEventListener("click", async (e) => {
      const act = e.target.closest("[data-act]")?.dataset.act;
      if (!act) return;
      const d = await load();
      if (d) act === "next" ? d.next() : d.prev();
    });
  });

  /* --- Theme switcher --------------------------------------------------- */
  const sw = $("[data-switcher]");
  if (sw) {
    const screen = $(".screen", sw);
    const poster = $(".poster", screen);
    let theme = "folio";
    let slide = 1;
    let current = null;
    let token = 0;
    const render = () => {
      const my = ++token;
      $$(".tpick", sw).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.theme === theme)));
      $$(".chip", sw).forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.slide) === slide)));
      $$("[data-info]", sw).forEach((d) => (d.hidden = d.dataset.info !== theme));
      poster.src = `${ROOT}assets/frames/${theme}/${pad(slide)}${slide === 1 ? "-1280" : ""}.webp`;
      poster.alt = `${theme} theme, slide ${slide}`;
      const next = mountDeck(screen, theme, slide, () => {
        if (my !== token) return next.remove();
        if (current) {
          const old = current;
          setTimeout(() => old.remove(), 450);
        }
        current = next;
      });
    };
    sw.addEventListener("click", (e) => {
      const t = e.target.closest(".tpick");
      const c = e.target.closest(".chip");
      if (t && t.dataset.theme !== theme) { theme = t.dataset.theme; render(); }
      if (c && Number(c.dataset.slide) !== slide) {
        slide = Number(c.dataset.slide);
        // Same theme: drive the running deck instead of reloading it.
        let deck = null;
        try { deck = current && current.contentWindow.decklume; } catch {}
        if (deck) {
          deck.go(slide - 1, { steps: Infinity });
          $$(".chip", sw).forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.slide) === slide)));
        } else render();
      }
    });
    whenNear(sw, () => { if (!current) render(); });
  }

  /* --- Prompt → deck story --------------------------------------------- */
  const story = $("[data-story]");
  if (story) {
    story.classList.add("is-ready");
    const stages = $$(".stage", story);
    const steps = $$("[data-step]", story);
    const typed = $(".typed", story);
    let typedDone = false;
    const typeOut = async () => {
      if (typedDone || reduce || !typed) return;
      typedDone = true;
      const text = typed.dataset.type;
      typed.textContent = "";
      for (let i = 1; i <= text.length; i++) {
        typed.textContent = text.slice(0, i);
        await wait(18);
      }
    };
    const activate = (n) => {
      steps.forEach((s) => s.classList.toggle("is-active", s.dataset.step === n));
      stages.forEach((s) => s.classList.toggle("is-active", s.dataset.stage === n));
      if (n === "1") typeOut();
    };
    activate("1");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.isIntersecting && activate(en.target.dataset.step));
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach((s) => io.observe(s));
  }

  /* --- QA inspector ------------------------------------------------------ */
  const qa = $("[data-qa]");
  if (qa) {
    const slide = $("[data-qa-slide]", qa);
    const marks = $$(".mark", qa);
    const finds = $$("[data-find]", qa);
    const loupe = $(".loupe", qa);
    const run = $("[data-qa-run]", qa);
    const fix = $("[data-qa-fix]", qa);
    const reset = $("[data-qa-reset]", qa);
    const result = $("[data-qa-result]", qa);
    const box = $(".qa-marks", qa);
    let busy = false;
    // Circle the real defects: measure each target inside the slide.
    const targets = { overlap: ".qs-badge", overflow: ".qs-over", contrast: ".qs-faint", "type-size": ".qs-source" };
    const placeMarks = () => {
      const b = box.getBoundingClientRect();
      marks.forEach((m) => {
        const t = $(targets[m.dataset.mark], slide);
        if (!t || !b.width) return;
        const r = t.getBoundingClientRect();
        const padX = Math.max(14, r.width * 0.12), padY = Math.max(12, r.height * 0.35);
        m.style.left = `${((r.left - b.left - padX) / b.width) * 100}%`;
        m.style.top = `${((r.top - b.top - padY) / b.height) * 100}%`;
        m.style.width = `${((r.width + padX * 2) / b.width) * 100}%`;
        m.style.height = `${((r.height + padY * 2) / b.height) * 100}%`;
      });
    };
    placeMarks();
    new ResizeObserver(() => !slide.classList.contains("is-fixed") && placeMarks()).observe(slide);
    const moveLoupe = (mark) => {
      const b = box.getBoundingClientRect();
      const m = mark.getBoundingClientRect();
      loupe.style.setProperty("--lx", `${m.left - b.left + m.width / 2}px`);
      loupe.style.setProperty("--ly", `${m.top - b.top + m.height / 2}px`);
    };
    const MARK = {
      "is-fail": '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6.5c4 3.6 8 7.4 12 11M17.5 6c-3.8 4-7.6 8-11.5 12"/></svg>',
      "is-pass": '<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12.8c1.8 1.4 3.3 3 4.6 4.7C12 12.6 15.3 8.4 19.5 5.5"/></svg>',
    };
    const setResult = (text, cls = "") => {
      result.innerHTML = (MARK[cls] || "") + "<span></span>";
      result.lastChild.textContent = text;
      result.className = "qa-result" + (cls ? " " + cls : "");
    };
    const clear = () => {
      qa.classList.remove("is-running", "is-fixed");
      slide.classList.remove("is-fixed");
      marks.forEach((m) => m.classList.remove("is-found"));
      finds.forEach((f) => f.classList.remove("is-found", "is-fixed"));
      fix.disabled = true;
      run.disabled = false;
      setResult("Press run to inspect the slide.");
    };
    run.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      clear();
      placeMarks();
      run.disabled = true;
      qa.classList.add("is-running");
      setResult("Rendering slide 03 at 1920×1080…");
      await wait(500);
      for (const [i, mark] of marks.entries()) {
        moveLoupe(mark);
        await wait(650);
        mark.classList.add("is-found");
        finds[i].classList.add("is-found");
        setResult(`${i + 1} error${i ? "s" : ""} found`, "is-fail");
        await wait(350);
      }
      qa.classList.remove("is-running");
      setResult("Failed · 4 errors · this deck would not be delivered", "is-fail");
      fix.disabled = false;
      busy = false;
    });
    fix.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      fix.disabled = true;
      setResult("Applying fixes and re-running QA…");
      qa.classList.add("is-fixed");
      slide.classList.add("is-fixed");
      for (const f of finds) {
        await wait(260);
        f.classList.add("is-fixed");
      }
      await wait(300);
      setResult("Passed · 0 errors · ready to present", "is-pass");
      run.disabled = false;
      busy = false;
    });
    reset.addEventListener("click", () => !busy && clear());
  }

  /* --- Docs: highlight the current section ------------------------------- */
  const toc = $(".toc");
  if (toc) {
    const links = $$("a", toc);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "0px 0px -70% 0px" });
    $$(".prose h2[id]").forEach((h) => io.observe(h));
  }
})();
