#!/usr/bin/env node
/* =====================================================================
   DECKLUME · POWERPOINT IMPORT
   Reads a .pptx directly (it is a zip of XML parts) with Node built-ins
   only: no Python, no packages.

   Extracts per slide, in reading order: title, subtitle, text with
   bullet levels, tables, native chart data (as Decklume chart
   attributes), images (including inside groups) with alt text, and
   speaker notes. Writes extracted-slides.json and assets/.

   Usage:
     node extract-pptx.mjs talk.pptx [out-dir]
   ===================================================================== */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { join, basename, posix } from "node:path";
import { fileURLToPath } from "node:url";

/* --- Zip ---------------------------------------------------------------
   Walk the central directory (end-of-central-directory record at the
   file's tail), then inflate each entry from its local header. */
export function readZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("Not a zip archive (is this really a .pptx?)");
  const count = buf.readUInt16LE(eocd + 10);
  let ptr = buf.readUInt32LE(eocd + 16);
  const files = new Map();
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) throw new Error("Corrupt zip central directory");
    const method = buf.readUInt16LE(ptr + 10);
    const size = buf.readUInt32LE(ptr + 20);
    const nameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const local = buf.readUInt32LE(ptr + 42);
    const name = buf.toString("utf8", ptr + 46, ptr + 46 + nameLen);
    const dataStart = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(dataStart, dataStart + size);
    files.set(name, () => (method === 0 ? raw : method === 8 ? inflateRawSync(raw) : null));
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  return {
    has: (p) => files.has(p),
    bytes: (p) => (files.has(p) ? files.get(p)() : null),
    text: (p) => (files.has(p) ? files.get(p)().toString("utf8") : null),
  };
}

/* --- Tiny XML helpers ---------------------------------------------------
   PPTX XML is regular enough for targeted, non-greedy matching. */
const decode = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, "&");
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? decode(m[1]) : null;
};

/* Split the direct children of a container into top-level elements,
   keeping nesting intact (needed for groups and graphic frames). */
function children(xml) {
  const out = [];
  const re = /<(p:sp|p:pic|p:grpSp|p:graphicFrame|p:cxnSp)\b/g;
  let m;
  while ((m = re.exec(xml))) {
    const tag = m[1];
    let depth = 0;
    const open = new RegExp(`<${tag}[\\s>/]|</${tag}>`, "g");
    open.lastIndex = m.index;
    let end = -1;
    let t;
    while ((t = open.exec(xml))) {
      if (t[0].startsWith("</")) depth--;
      else if (!xml.slice(t.index, xml.indexOf(">", t.index) + 1).endsWith("/>")) depth++;
      if (depth === 0) { end = open.lastIndex; break; }
    }
    if (end < 0) break;
    out.push({ tag, xml: xml.slice(m.index, end) });
    re.lastIndex = end;
  }
  return out;
}

const position = (xml) => {
  const off = xml.match(/<a:off\b[^>]*>/);
  return off ? { x: +attr(off[0], "x") || 0, y: +attr(off[0], "y") || 0 } : { x: 0, y: 0 };
};
const extent = (xml) => {
  const ext = xml.match(/<a:ext\b[^>]*cx="[^"]*"[^>]*>/);
  return ext ? { cx: +attr(ext[0], "cx") || 0, cy: +attr(ext[0], "cy") || 0 } : { cx: 0, cy: 0 };
};

function paragraphs(xml) {
  const out = [];
  for (const p of xml.match(/<a:p>[\s\S]*?<\/a:p>|<a:p\s[\s\S]*?<\/a:p>/g) || []) {
    const ppr = p.match(/<a:pPr\b[^>]*>/);
    const level = ppr ? +(attr(ppr[0], "lvl") || 0) : 0;
    const text = (p.match(/<a:t>([\s\S]*?)<\/a:t>|<a:t\s[^>]*>([\s\S]*?)<\/a:t>/g) || [])
      .map((t) => decode(t.replace(/<[^>]+>/g, "")))
      .join("")
      .trim();
    if (text) out.push({ text, level });
  }
  return out;
}

/* --- Relationships -------------------------------------------------------- */
function rels(zip, partPath) {
  const relPath = posix.join(posix.dirname(partPath), "_rels", posix.basename(partPath) + ".rels");
  const xml = zip.text(relPath) || "";
  const map = {};
  for (const r of xml.match(/<Relationship\b[^>]*>/g) || []) {
    const target = attr(r, "Target");
    map[attr(r, "Id")] = {
      type: (attr(r, "Type") || "").split("/").pop(),
      target: attr(r, "TargetMode") === "External" ? target : posix.normalize(posix.join(posix.dirname(partPath), target)),
    };
  }
  return map;
}

/* --- Charts ---------------------------------------------------------------- */
const CHART_KIND = { barChart: null, bar3DChart: null, lineChart: "line", line3DChart: "line", pieChart: "donut", pie3DChart: "donut", doughnutChart: "donut", areaChart: "line" };
function chart(zip, path) {
  const xml = zip.text(path);
  if (!xml) return null;
  const plot = xml.match(/<c:(barChart|bar3DChart|lineChart|line3DChart|pieChart|pie3DChart|doughnutChart|areaChart)>/);
  let kind = plot ? CHART_KIND[plot[1]] : "bar";
  if (kind === null) kind = /<c:barDir val="bar"/.test(xml) ? "hbar" : "bar";
  const values = (part) => (part.match(/<c:pt\b[^>]*>[\s\S]*?<c:v>([\s\S]*?)<\/c:v>/g) || []).map((v) => decode(v.match(/<c:v>([\s\S]*?)<\/c:v>/)[1]));
  const series = [];
  let labels = [];
  for (const ser of xml.match(/<c:ser>[\s\S]*?<\/c:ser>/g) || []) {
    const name = (ser.match(/<c:tx>[\s\S]*?<c:v>([\s\S]*?)<\/c:v>/) || [])[1];
    const cat = ser.match(/<c:cat>[\s\S]*?<\/c:cat>/);
    const val = ser.match(/<c:val>[\s\S]*?<\/c:val>/);
    if (cat && !labels.length) labels = values(cat[0]);
    series.push({ name: name ? decode(name) : "Series", values: val ? values(val[0]).map(Number) : [] });
  }
  const title = (xml.match(/<c:title>[\s\S]*?<\/c:title>/) || [""])[0];
  const fmt = (n) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(4)));
  return {
    type: "chart",
    title: paragraphs(title).map((p) => p.text).join(" "),
    labels,
    series,
    decklume_attrs: {
      "data-type": kind,
      "data-labels": labels.join(","),
      "data-series": series.map((s) => `${s.name}:${s.values.map(fmt).join(",")}`).join("; "),
    },
  };
}

/* --- One slide ----------------------------------------------------------------- */
const PH_TITLE = new Set(["title", "ctrTitle", "vertTitle"]);
function readSlide(zip, path, number, size, assetsDir) {
  const xml = zip.text(path);
  const rel = rels(zip, path);
  const slide = { number, title: "", subtitle: "", content: [], images: [], notes: "" };

  const visit = (container) => {
    const kids = children(container).map((k) => ({ ...k, pos: position(k.xml) }));
    kids.sort((a, b) => Math.round(a.pos.y / 20000) - Math.round(b.pos.y / 20000) || a.pos.x - b.pos.x);
    for (const k of kids) {
      if (k.tag === "p:grpSp") { visit(k.xml.replace(/^<p:grpSp\b[^>]*>/, "")); continue; }
      const cNv = (k.xml.match(/<p:cNvPr\b[^>]*>/) || [""])[0];

      if (k.tag === "p:graphicFrame") {
        const chartRef = k.xml.match(/<c:chart\b[^>]*r:id="([^"]+)"/);
        if (chartRef && rel[chartRef[1]]) { const c = chart(zip, rel[chartRef[1]].target); if (c) slide.content.push(c); continue; }
        const tbl = k.xml.match(/<a:tbl>[\s\S]*?<\/a:tbl>/);
        if (tbl) {
          const rows = (tbl[0].match(/<a:tr\b[\s\S]*?<\/a:tr>/g) || []).map((tr) =>
            (tr.match(/<a:tc\b[\s\S]*?<\/a:tc>/g) || []).map((tc) => paragraphs(tc).map((p) => p.text).join(" "))
          );
          slide.content.push({ type: "table", rows });
        }
        continue;
      }

      if (k.tag === "p:pic") {
        const blip = k.xml.match(/<a:blip\b[^>]*r:embed="([^"]+)"/);
        const target = blip && rel[blip[1]] && rel[blip[1]].target;
        const bytes = target && zip.bytes(target);
        if (bytes) {
          const ext = posix.extname(target).slice(1).toLowerCase() || "bin";
          const name = `slide${String(number).padStart(2, "0")}_img${slide.images.length + 1}.${ext}`;
          writeFileSync(join(assetsDir, name), bytes);
          const e = extent(k.xml);
          slide.images.push({ path: `assets/${name}`, alt: attr(cNv, "descr") || "", width_ratio: +(e.cx / size.cx).toFixed(3), height_ratio: +(e.cy / size.cy).toFixed(3) });
        }
        continue;
      }

      if (k.tag === "p:sp") {
        const body = k.xml.match(/<p:txBody>[\s\S]*?<\/p:txBody>/);
        if (!body) continue;
        const paras = paragraphs(body[0]);
        if (!paras.length) continue;
        const ph = k.xml.match(/<p:ph\b[^>]*>/);
        const phType = ph ? attr(ph[0], "type") || "body" : null;
        const joined = paras.map((p) => p.text).join("\n");
        if (phType && PH_TITLE.has(phType) && !slide.title) slide.title = joined;
        else if (phType === "subTitle" && !slide.subtitle) slide.subtitle = joined;
        else if (!["sldNum", "dt", "ftr"].includes(phType)) slide.content.push({ type: "text", paragraphs: paras });
      }
    }
  };

  const tree = xml.match(/<p:spTree>[\s\S]*<\/p:spTree>/);
  if (tree) visit(tree[0].replace(/^<p:spTree>/, ""));

  const notesRel = Object.values(rel).find((r) => r.type === "notesSlide");
  if (notesRel) {
    const notes = zip.text(notesRel.target) || "";
    const bodies = (notes.match(/<p:sp>[\s\S]*?<\/p:sp>/g) || []).filter((sp) => /<p:ph\b[^>]*type="body"/.test(sp));
    slide.notes = bodies.flatMap((b) => paragraphs(b).map((p) => p.text)).join("\n");
  }
  return slide;
}

/* --- Whole deck ------------------------------------------------------------------ */
export function extractPptx(file, outDir = ".") {
  const zip = readZip(readFileSync(file));
  const pres = zip.text("ppt/presentation.xml");
  if (!pres) throw new Error("No ppt/presentation.xml: this file is not a PowerPoint presentation");
  const presRels = rels(zip, "ppt/presentation.xml");
  const sz = pres.match(/<p:sldSz\b[^>]*>/);
  const size = { cx: sz ? +attr(sz[0], "cx") : 12192000, cy: sz ? +attr(sz[0], "cy") : 6858000 };
  const order = (pres.match(/<p:sldId\b[^>]*>/g) || []).map((t) => presRels[attr(t, "r:id")]?.target).filter(Boolean);
  const assetsDir = join(outDir, "assets");
  mkdirSync(assetsDir, { recursive: true });
  return order.map((path, i) => readSlide(zip, path, i + 1, size, assetsDir));
}

const summary = (s) => {
  const counts = {};
  s.content.forEach((c) => (counts[c.type] = (counts[c.type] || 0) + 1));
  const parts = Object.entries(counts).map(([k, v]) => `${v} ${k}`);
  if (s.images.length) parts.push(`${s.images.length} image(s)`);
  if (s.notes) parts.push("notes");
  return parts.join(", ") || "empty";
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [src, out = "."] = process.argv.slice(2);
  if (!src) {
    console.error("usage: node extract-pptx.mjs <talk.pptx> [out-dir]");
    process.exit(2);
  }
  try {
    mkdirSync(out, { recursive: true });
    const slides = extractPptx(src, out);
    const json = join(out, "extracted-slides.json");
    writeFileSync(json, JSON.stringify({ source: basename(src), slides }, null, 2));
    console.log(`Extracted ${slides.length} slides → ${json}`);
    slides.forEach((s) => console.log(`  ${String(s.number).padStart(2)}. ${s.title || "(no title)"} — ${summary(s)}`));
  } catch (e) {
    console.error("✗ " + e.message);
    process.exit(1);
  }
}
