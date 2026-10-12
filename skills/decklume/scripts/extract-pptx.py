#!/usr/bin/env python3
"""
Decklume · PowerPoint extractor

Pulls everything a redesign needs out of a .pptx: titles, bullet text
with indent levels, tables, native chart data, images (including inside
groups) and speaker notes. Writes extracted-slides.json plus assets/.

Native charts come out as Decklume chart attributes, so a bar chart in
PowerPoint becomes  data-type="bar" data-labels="..." data-series="..."

Usage:
    python3 extract-pptx.py <input.pptx> [output_dir]

Requires: pip install python-pptx

Based on frontend-slides/scripts/extract-pptx.py (MIT © 2025 Zara Zhang),
extended with group recursion, bullet levels, tables, charts and alt text.
"""

import json
import os
import sys

try:
    from pptx import Presentation
    from pptx.enum.shapes import MSO_SHAPE_TYPE, PP_PLACEHOLDER
except ImportError:
    sys.exit("python-pptx is required:  pip install python-pptx")


CHART_TYPES = {
    "BAR": "hbar",
    "COLUMN": "bar",
    "LINE": "line",
    "PIE": "donut",
    "DOUGHNUT": "donut",
}


def chart_kind(chart):
    name = str(chart.chart_type).split(".")[-1].split(" ")[0].upper()
    for key, kind in CHART_TYPES.items():
        if name.startswith(key):
            return kind
    return "bar"


def extract_chart(chart):
    plot = chart.plots[0]
    labels = [str(c) for c in plot.categories]
    series = []
    for s in plot.series:
        values = [v if v is not None else 0 for v in s.values]
        series.append({"name": s.name or "Series", "values": values})
    attrs = {
        "data-type": chart_kind(chart),
        "data-labels": ",".join(labels),
        "data-series": "; ".join(
            f"{s['name']}:{','.join(f'{v:g}' for v in s['values'])}" for s in series
        ),
    }
    title = chart.chart_title.text_frame.text if chart.has_title else ""
    return {"type": "chart", "title": title, "labels": labels, "series": series, "decklume_attrs": attrs}


def extract_table(table):
    rows = []
    for row in table.rows:
        rows.append([cell.text.strip() for cell in row.cells])
    return {"type": "table", "rows": rows}


def extract_text(shape):
    paragraphs = []
    for p in shape.text_frame.paragraphs:
        text = "".join(run.text for run in p.runs).strip()
        if text:
            paragraphs.append({"text": text, "level": p.level})
    return paragraphs


def is_title(shape):
    if not shape.is_placeholder:
        return False
    try:
        return shape.placeholder_format.type in (
            PP_PLACEHOLDER.TITLE,
            PP_PLACEHOLDER.CENTER_TITLE,
            PP_PLACEHOLDER.VERTICAL_TITLE,
        )
    except ValueError:
        return False


def is_subtitle(shape):
    if not shape.is_placeholder:
        return False
    try:
        return shape.placeholder_format.type == PP_PLACEHOLDER.SUBTITLE
    except ValueError:
        return False


def walk(shapes, slide_data, slide_num, assets_dir):
    """Visit shapes in reading order (top-to-bottom, left-to-right)."""
    ordered = sorted(shapes, key=lambda s: ((s.top or 0) // 20000, s.left or 0))
    for shape in ordered:
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            walk(shape.shapes, slide_data, slide_num, assets_dir)
            continue

        if getattr(shape, "has_chart", False) and shape.has_chart:
            slide_data["content"].append(extract_chart(shape.chart))
            continue

        if getattr(shape, "has_table", False) and shape.has_table:
            slide_data["content"].append(extract_table(shape.table))
            continue

        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE or (
            shape.is_placeholder and hasattr(shape, "image")
        ):
            try:
                image = shape.image
            except (AttributeError, ValueError):
                image = None
            if image is not None:
                idx = len(slide_data["images"]) + 1
                name = f"slide{slide_num:02d}_img{idx}.{image.ext}"
                with open(os.path.join(assets_dir, name), "wb") as f:
                    f.write(image.blob)
                alt = ""
                try:
                    alt = shape._element.xpath("./*[1]/p:cNvPr/@descr")[0]
                except (IndexError, AttributeError):
                    pass
                slide_data["images"].append(
                    {
                        "path": f"assets/{name}",
                        "alt": alt,
                        "width_ratio": round((shape.width or 0) / slide_data["_w"], 3),
                        "height_ratio": round((shape.height or 0) / slide_data["_h"], 3),
                    }
                )
                continue

        if shape.has_text_frame and shape.text_frame.text.strip():
            if is_title(shape) and not slide_data["title"]:
                slide_data["title"] = shape.text_frame.text.strip()
            elif is_subtitle(shape) and not slide_data["subtitle"]:
                slide_data["subtitle"] = shape.text_frame.text.strip()
            else:
                slide_data["content"].append({"type": "text", "paragraphs": extract_text(shape)})


def extract_pptx(file_path, output_dir="."):
    prs = Presentation(file_path)
    assets_dir = os.path.join(output_dir, "assets")
    os.makedirs(assets_dir, exist_ok=True)

    slides = []
    for n, slide in enumerate(prs.slides, start=1):
        data = {
            "number": n,
            "layout": slide.slide_layout.name,
            "title": "",
            "subtitle": "",
            "content": [],
            "images": [],
            "notes": "",
            "_w": prs.slide_width or 1,
            "_h": prs.slide_height or 1,
        }
        walk(slide.shapes, data, n, assets_dir)
        if slide.has_notes_slide:
            data["notes"] = slide.notes_slide.notes_text_frame.text.strip()
        del data["_w"], data["_h"]
        slides.append(data)
    return slides


def summary(slide):
    kinds = {}
    for c in slide["content"]:
        kinds[c["type"]] = kinds.get(c["type"], 0) + 1
    parts = [f"{v} {k}" for k, v in kinds.items()]
    if slide["images"]:
        parts.append(f"{len(slide['images'])} image(s)")
    if slide["notes"]:
        parts.append("notes")
    return ", ".join(parts) or "empty"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else "."
    os.makedirs(out, exist_ok=True)

    slides = extract_pptx(src, out)
    path = os.path.join(out, "extracted-slides.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"source": os.path.basename(src), "slides": slides}, f, indent=2, ensure_ascii=False)

    print(f"Extracted {len(slides)} slides → {path}")
    for s in slides:
        print(f"  {s['number']:>2}. {s['title'] or '(no title)'} — {summary(s)}")
