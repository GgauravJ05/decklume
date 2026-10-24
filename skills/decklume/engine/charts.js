/* =====================================================================
   DECKLUME · CHARTS
   Declarative SVG charts drawn from data attributes, coloured by theme
   tokens, animated on slide entry. Types: bar, hbar, line, donut.

   <figure class="chart" data-type="bar"
           data-labels="2022,2023,2024,2025"
           data-series="Revenue:12,19,31,48"
           data-unit="M" data-highlight="3"></figure>

   Several series: data-series="A:1,2,3; B:2,3,1".

   Inside .l-chart-story the chart starts plain and its story steps add
   highlights (data-highlight) and a note pinned to one value (data-point).
   ===================================================================== */
(() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const W = 1000;

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.append(n);
    return n;
  };

  const parse = (fig) => {
    const labels = (fig.dataset.labels || "").split(",").map((s) => s.trim()).filter(Boolean);
    const series = (fig.dataset.series || fig.dataset.values || "")
      .split(";")
      .map((chunk, i) => {
        const [name, vals] = chunk.includes(":") ? chunk.split(":") : [`Series ${i + 1}`, chunk];
        return { name: name.trim(), values: vals.split(",").map((v) => parseFloat(v)) };
      })
      .filter((s) => s.values.some((v) => !Number.isNaN(v)));
    return { labels, series };
  };

  const niceMax = (max) => {
    if (max <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(max)));
    const n = max / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  };

  const fmt = (v, unit = "", prefix = "") => {
    const s = Math.abs(v) >= 1000 ? v.toLocaleString("en-US") : String(Math.round(v * 10) / 10);
    return prefix + s + unit;
  };

  // A story chart starts plain: its steps decide what to highlight.
  const highlightOf = (fig, dflt) =>
    fig.dataset.highlight !== undefined && !fig.closest(".l-chart-story") ? Number(fig.dataset.highlight) : dflt;

  const colour = (i, highlight) => {
    if (highlight) return "var(--c-accent)";
    return ["var(--c-chart-1, var(--c-ink-2))", "var(--c-chart-2, var(--c-accent))", "var(--c-chart-3, var(--c-ink-3))", "var(--c-chart-4, var(--c-accent-2))"][i % 4];
  };

  function bar(fig, { labels, series }, horizontal) {
    const H = horizontal ? Math.max(380, labels.length * 92) : 560;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" });
    const unit = fig.dataset.unit || "";
    const prefix = fig.dataset.prefix || "";
    const hl = highlightOf(fig, -1);
    const all = series.flatMap((s) => s.values);
    const max = niceMax(Math.max(...all));
    const multi = series.length > 1;

    if (!horizontal) {
      const padL = 20, padB = 64, padT = 56;
      const plotH = H - padB - padT;
      const band = (W - padL) / labels.length;
      const barW = Math.min(120, (band * 0.62) / series.length);
      el("line", { x1: padL, x2: W, y1: H - padB, y2: H - padB, class: "dl-axis" }, svg);
      labels.forEach((lab, i) => {
        const cx = padL + band * i + band / 2;
        series.forEach((s, j) => {
          const v = s.values[i] ?? 0;
          const h = (v / max) * plotH;
          const x = cx - (barW * series.length) / 2 + j * barW;
          const isHl = !multi && (hl === i || (hl < 0 && false));
          const r = el("rect", {
            x: x + 3, y: H - padB - h, width: barW - 6, height: h,
            fill: multi ? colour(j) : isHl ? "var(--c-accent)" : "var(--c-bar, var(--c-ink-2))",
            class: "dl-bar", style: `--d:${i * 70 + j * 30}ms`, "data-i": i, "data-s": j,
          }, svg);
          r.append(Object.assign(document.createElementNS(NS, "title"), { textContent: `${lab}: ${fmt(v, unit, prefix)}` }));
          if (!multi || series.length <= 2) {
            el("text", { x: x + barW / 2, y: H - padB - h - 16, "text-anchor": "middle", class: `dl-val${isHl ? " is-hl" : ""}`, style: `--d:${i * 70 + 200}ms`, "data-i": i, "data-s": j }, svg).textContent = fmt(v, unit, prefix);
          }
        });
        el("text", { x: cx, y: H - padB + 42, "text-anchor": "middle", class: `dl-lab${hl === i ? " is-hl" : ""}`, "data-i": i }, svg).textContent = lab;
      });
    } else {
      const padL = 260, rowH = (H - 20) / labels.length;
      const barH = Math.min(52, rowH * 0.56);
      labels.forEach((lab, i) => {
        const v = series[0].values[i] ?? 0;
        const y = 10 + rowH * i + (rowH - barH) / 2;
        const w = (v / max) * (W - padL - 140);
        const isHl = hl === i;
        el("text", { x: padL - 24, y: y + barH / 2, "text-anchor": "end", "dominant-baseline": "central", class: `dl-lab${isHl ? " is-hl" : ""}`, "data-i": i }, svg).textContent = lab;
        el("rect", { x: padL, y, width: w, height: barH, fill: isHl ? "var(--c-accent)" : "var(--c-bar, var(--c-ink-2))", class: "dl-bar dl-hbar", style: `--d:${i * 70}ms`, "data-i": i, "data-s": 0 }, svg);
        el("text", { x: padL + w + 16, y: y + barH / 2, "dominant-baseline": "central", class: `dl-val${isHl ? " is-hl" : ""}`, style: `--d:${i * 70 + 200}ms`, "data-i": i, "data-s": 0 }, svg).textContent = fmt(v, unit, prefix);
      });
    }
    return svg;
  }

  function line(fig, { labels, series }) {
    const H = 560, padL = 20, padR = 140, padB = 64, padT = 40;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" });
    const unit = fig.dataset.unit || "";
    const prefix = fig.dataset.prefix || "";
    const max = niceMax(Math.max(...series.flatMap((s) => s.values)));
    const plotW = W - padL - padR, plotH = H - padB - padT;
    const x = (i) => padL + (labels.length > 1 ? (plotW * i) / (labels.length - 1) : plotW / 2);
    const y = (v) => padT + plotH - (v / max) * plotH;

    [0.25, 0.5, 0.75, 1].forEach((f) => el("line", { x1: padL, x2: W - padR, y1: y(max * f), y2: y(max * f), class: "dl-grid" }, svg));
    el("line", { x1: padL, x2: W - padR, y1: H - padB, y2: H - padB, class: "dl-axis" }, svg);
    labels.forEach((lab, i) => (el("text", { x: x(i), y: H - padB + 42, "text-anchor": "middle", class: "dl-lab" }, svg).textContent = lab));

    series.forEach((s, j) => {
      const c = series.length === 1 || j === 0 ? "var(--c-accent)" : colour(j - 1);
      const d = s.values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
      el("path", { d, fill: "none", stroke: c, "stroke-width": j === 0 ? 6 : 4, "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1, class: "dl-line", style: `--d:${j * 160}ms` }, svg);
      // One hidden marker per point: a story step can light any of them.
      s.values.forEach((v, i) => el("circle", { cx: x(i), cy: y(v), r: 11, fill: c, class: "dl-pt", "data-i": i, "data-s": j }, svg));
      const last = s.values.length - 1;
      el("circle", { cx: x(last), cy: y(s.values[last]), r: 9, fill: c, class: "dl-dot", style: `--d:${900 + j * 160}ms` }, svg);
      el("text", { x: x(last) + 22, y: y(s.values[last]), "dominant-baseline": "central", class: "dl-val is-hl", fill: c, style: `--d:${1000 + j * 160}ms` }, svg).textContent =
        series.length > 1 ? s.name : fmt(s.values[last], unit, prefix);
    });
    return svg;
  }

  function donut(fig, { labels, series }) {
    const S = 560;
    const svg = el("svg", { viewBox: `0 0 ${W} ${S}`, role: "img" });
    const vals = series[0].values;
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    const hl = highlightOf(fig, 0);
    const cx = S / 2, cy = S / 2, r = 210, sw = 74;
    let acc = 0;
    vals.forEach((v, i) => {
      const frac = v / total;
      const c = i === hl ? "var(--c-accent)" : `color-mix(in srgb, var(--c-ink) ${Math.max(12, 55 - i * 14)}%, transparent)`;
      el("circle", {
        cx, cy, r, fill: "none", stroke: c, "stroke-width": sw, pathLength: 1,
        "stroke-dasharray": `${Math.max(0, frac - 0.004)} ${1 - frac + 0.004}`,
        "stroke-dashoffset": String(-acc + 0.25), class: "dl-arc", style: `--d:${i * 120}ms`,
        transform: `rotate(0 ${cx} ${cy})`,
      }, svg);
      acc += frac;
    });
    el("text", { x: cx, y: cy, "text-anchor": "middle", "dominant-baseline": "central", class: "dl-donut-val" }, svg).textContent =
      fig.dataset.center || Math.round((vals[hl] / total) * 100) + "%";
    labels.forEach((lab, i) => {
      const ly = 120 + i * 76;
      el("rect", { x: S + 60, y: ly - 14, width: 28, height: 28, rx: 4, fill: i === hl ? "var(--c-accent)" : `color-mix(in srgb, var(--c-ink) ${Math.max(12, 55 - i * 14)}%, transparent)` }, svg);
      el("text", { x: S + 108, y: ly, "dominant-baseline": "central", class: `dl-lab${i === hl ? " is-hl" : ""}` }, svg).textContent = `${lab} · ${Math.round((vals[i] / total) * 100)}%`;
    });
    return svg;
  }

  function render(fig) {
    if (fig.querySelector("svg[data-dl-generated]")) return;
    const data = parse(fig);
    if (!data.series.length) return;
    if (!data.labels.length) data.labels = data.series[0].values.map((_, i) => String(i + 1));
    const type = fig.dataset.type || "bar";
    const svg = type === "line" ? line(fig, data) : type === "donut" ? donut(fig, data) : bar(fig, data, type === "hbar");
    svg.setAttribute("data-dl-generated", "");
    svg.setAttribute("aria-label", fig.getAttribute("aria-label") || fig.querySelector("figcaption")?.textContent || "Chart");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    fig.prepend(svg);
    if (data.series.length > 1 && type !== "line") {
      const key = document.createElement("div");
      key.className = "dl-key";
      key.setAttribute("data-dl-generated", "");
      key.innerHTML = data.series.map((s, j) => `<span><i style="background:${colour(j)}"></i>${s.name}</span>`).join("");
      fig.append(key);
    }
  }


  /* --- Chart stories ----------------------------------------------------
     <ol class="story"> items are build steps. A shown item with
     data-highlight="i" lights category i; one with data-point="Label" (or
     "Series:Label") lights that value and is itself pinned beside it on
     the chart. Item classes are watched, so presenting, QA and export
     all see the same state. */
  function story(slide) {
    const fig = slide.querySelector(".chart");
    const svg = fig?.querySelector("svg[data-dl-generated]");
    const items = [...slide.querySelectorAll(".story > li")];
    if (!svg || !items.length) return;
    const { labels, series } = parse(fig);
    const resolve = (ref) => {
      const [a, b] = ref.includes(":") ? ref.split(":").map((t) => t.trim()) : [null, ref.trim()];
      const s = a === null ? 0 : series.findIndex((x) => x.name === a);
      return { s, i: labels.indexOf(b) };
    };
    const mark = ({ s, i }) =>
      svg.querySelector(`.dl-pt[data-i="${i}"][data-s="${s}"]`) || svg.querySelector(`.dl-bar[data-i="${i}"][data-s="${s}"]`);

    const apply = () => {
      const shown = items.filter((li) => !li.classList.contains("step") || li.classList.contains("is-shown"));
      const lit = new Set();
      shown.forEach((li) => {
        if (li.dataset.highlight !== undefined) lit.add(`${li.dataset.highlight}`);
        if (li.dataset.point) lit.add(`${resolve(li.dataset.point).i}`);
      });
      svg.querySelectorAll("[data-i]").forEach((n) => n.classList.toggle("is-lit", lit.has(n.dataset.i)));
      svg.classList.toggle("has-lit", lit.size > 0);
    };

    // Pin each data-point item beside its value, toward the chart's middle.
    // Coordinates are taken in the note's own containing block, which a
    // theme may have moved from the slide to the list.
    const place = () => {
      const k = slide.getBoundingClientRect().width / slide.offsetWidth || 1;
      const fr = fig.getBoundingClientRect();
      items.filter((li) => li.dataset.point).forEach((li) => {
        const m = mark(resolve(li.dataset.point));
        const box = li.offsetParent;
        if (!m || !box) return;
        const o = box.getBoundingClientRect();
        // Read the mark's own geometry: a bar may still be growing in.
        const ctm = svg.getScreenCTM(), b = m.getBBox();
        // A column's note points just above its value label, not into it.
        const v = m.matches(".dl-bar:not(.dl-hbar)") && svg.querySelector(`.dl-val[data-i="${m.dataset.i}"][data-s="${m.dataset.s}"]`);
        if (v) { const t = v.getBBox().y - 6; b.height += b.y - t; b.y = t; }
        const at = (x, y) => new DOMPoint(x, y).matrixTransform(ctm);
        const p0 = at(b.x, b.y), p1 = at(b.x + b.width, b.y + b.height);
        const r = { left: p0.x, top: p0.y, right: p1.x, width: p1.x - p0.x, height: p1.y - p0.y };
        const px = ((m.matches(".dl-hbar") ? r.right : r.left + r.width / 2) - o.left) / k;
        const py = (r.top + (m.matches(".dl-pt") ? r.height / 2 : 0) - o.top) / k;
        // Above the value unless the chart's top edge is in the way.
        li.classList.toggle("is-left", px > (fr.left + fr.width / 2 - o.left) / k);
        li.classList.toggle("is-below", py - (fr.top - o.top) / k < li.offsetHeight + 24);
        li.style.setProperty("--dl-x", `${px}px`);
        li.style.setProperty("--dl-y", `${py}px`);
      });
    };

    apply();
    place();
    document.fonts?.ready.then(place);
    const watch = new MutationObserver(apply);
    items.forEach((li) => watch.observe(li, { attributes: true, attributeFilter: ["class"] }));
  }

  const boot = () => {
    document.querySelectorAll(".slide .chart[data-type], .slide .chart[data-series], .slide .chart[data-values]").forEach(render);
    document.querySelectorAll(".slide.l-chart-story").forEach(story);
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
