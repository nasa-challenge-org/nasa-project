#!/usr/bin/env python3
"""Convert TEAM_BLUEPRINT.md to a shareable Word document."""

from __future__ import annotations

import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

NAVY = RGBColor(0x07, 0x11, 0x1C)
CYAN = RGBColor(0x0E, 0x74, 0x8A)
AMBER = RGBColor(0xB4, 0x53, 0x09)


def set_run_font(run, *, name="Calibri", size=11, bold=False, italic=False, color=None, mono=False):
    run.bold = bold
    run.italic = italic
    run.font.size = Pt(size)
    run.font.name = "Consolas" if mono else name
    r = run._element
    rPr = r.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = r.makeelement(qn("w:rFonts"), {})
        rPr.append(rFonts)
    font = "Consolas" if mono else name
    rFonts.set(qn("w:ascii"), font)
    rFonts.set(qn("w:hAnsi"), font)
    if color is not None:
        run.font.color.rgb = color


def add_runs_with_code(paragraph, text: str, *, size=11, color=None):
    parts = re.split(r"(`[^`]+`|\*\*[^*]+\*\*)", text)
    for part in parts:
        if not part:
            continue
        if part.startswith("`") and part.endswith("`"):
            run = paragraph.add_run(part[1:-1])
            set_run_font(run, size=size, mono=True, color=CYAN)
        elif part.startswith("**") and part.endswith("**"):
            run = paragraph.add_run(part[2:-2])
            set_run_font(run, size=size, bold=True, color=color)
        else:
            run = paragraph.add_run(part)
            set_run_font(run, size=size, color=color)


def shade_paragraph(paragraph, fill: str):
    p = paragraph._p
    pPr = p.get_or_add_pPr()
    shd = pPr.makeelement(qn("w:shd"), {qn("w:val"): "clear", qn("w:fill"): fill})
    pPr.append(shd)


def parse_table_block(lines: list[str]) -> list[list[str]]:
    rows = []
    for line in lines:
        if re.match(r"^\s*\|?\s*-{3,}", line):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        rows.append(cells)
    return rows


def add_table(doc: Document, rows: list[list[str]]):
    if not rows:
        return
    cols = max(len(r) for r in rows)
    table = doc.add_table(rows=len(rows), cols=cols)
    table.style = "Table Grid"
    for i, row in enumerate(rows):
        for j in range(cols):
            cell = table.rows[i].cells[j]
            cell.text = ""
            p = cell.paragraphs[0]
            text = row[j] if j < len(row) else ""
            add_runs_with_code(p, text, size=10)
            if i == 0:
                for run in p.runs:
                    run.bold = True


def convert(md_path: Path, docx_path: Path) -> None:
    text = md_path.read_text(encoding="utf-8")
    lines = text.splitlines()
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.9)
    section.right_margin = Inches(0.9)

    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)

    i = 0
    in_code = False
    code_lines: list[str] = []
    table_lines: list[str] = []

    def flush_table():
        nonlocal table_lines
        if table_lines:
            add_table(doc, parse_table_block(table_lines))
            table_lines = []

    while i < len(lines):
        line = lines[i]
        if line.startswith("```"):
            flush_table()
            if in_code:
                p = doc.add_paragraph()
                shade_paragraph(p, "F1F5F9")
                p.paragraph_format.space_before = Pt(6)
                p.paragraph_format.space_after = Pt(10)
                p.paragraph_format.line_spacing = 1.08
                if not code_lines:
                    run = p.add_run(" ")
                    set_run_font(run, size=9, mono=True, color=NAVY)
                else:
                    for n, cline in enumerate(code_lines):
                        if n:
                            p.add_run().add_break()
                        run = p.add_run(cline if cline != "" else " ")
                        set_run_font(run, size=9, mono=True, color=NAVY)
                code_lines = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue
        if in_code:
            code_lines.append(line)
            i += 1
            continue
        if line.strip().startswith("|"):
            table_lines.append(line)
            i += 1
            continue
        flush_table()

        if not line.strip() or line.strip() == "---":
            i += 1
            continue

        if line.startswith("# "):
            p = doc.add_heading(line[2:].strip(), level=1)
            for run in p.runs:
                run.font.color.rgb = NAVY
        elif line.startswith("## "):
            p = doc.add_heading(line[3:].strip(), level=2)
            for run in p.runs:
                run.font.color.rgb = CYAN
        elif line.startswith("### "):
            p = doc.add_heading(line[4:].strip(), level=3)
        elif re.match(r"^\d+\.\s", line.strip()):
            p = doc.add_paragraph(style="List Number")
            add_runs_with_code(p, re.sub(r"^\d+\.\s+", "", line.strip()))
        elif line.strip().startswith("- "):
            p = doc.add_paragraph(style="List Bullet")
            add_runs_with_code(p, line.strip()[2:])
        elif line.strip().startswith("| You are"):
            table_lines.append(line)
        else:
            p = doc.add_paragraph()
            add_runs_with_code(p, line.strip())
        i += 1

    flush_table()
    if in_code and code_lines:
        p = doc.add_paragraph()
        shade_paragraph(p, "F1F5F9")
        for n, cline in enumerate(code_lines):
            if n:
                p.add_run().add_break()
            run = p.add_run(cline if cline != "" else " ")
            set_run_font(run, size=9, mono=True, color=NAVY)

    footer = doc.sections[0].footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer.add_run(
        "LunarEdge blueprint v2  ·  NASA Space Apps 2026  ·  Not NASA-endorsed"
    )
    set_run_font(run, size=8, italic=True, color=RGBColor(0x64, 0x74, 0x8B))

    doc.save(docx_path)


if __name__ == "__main__":
    src = Path(sys.argv[1])
    dest = Path(sys.argv[2])
    convert(src, dest)
    print(f"Wrote {dest}")
