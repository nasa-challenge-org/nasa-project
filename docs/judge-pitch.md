# LunarEdge — Judge pitch

**Team LunarEdge · NASA Space Apps 2026**  
**Lunar Landing Site Navigator**

Read this out loud. Keep it calm. Point at the screen when you name a page.

Do **not** say: NASA certified, safe to land, guaranteed comms, or spacecraft power.

---

## Opening (about 20 seconds)

Judges, the Moon’s south pole is where NASA wants to go.

The Sun sits low. Earth sits low. A few kilometres — and a few days — change everything.

We built **LunarEdge**. Four screens. One job: help people compare a landing **site** and a **date**, using real NASA data, without pretending we know more than we do.

If we do not know a number, we show **N/A**. Never zero. Never a fake crater. Never a ranking of “best landing.”

Let me walk you through the four pages.

---

## 1. Candidates

**What to click:** Candidates (the site list)

**Say this:**

This is the catalogue.

These names come from NASA/GSFC LOLA south-pole regions — places like Shackleton rim and Connecting ridge.

The sketch looks **down on 90°S**. Centre is the south pole. Up is 0° east longitude. Rings are kilometres from the pole on a simple sphere. It is a sketch, not a LOLA hillshade. Sites without verified coordinates stay **off the map**. We do not drop them at zero.

Pick a site. Open Mission. That is the whole page: choose where you are looking from.

---

## 2. Mission

**What to click:** Mission · pick a site · pick a UTC start · hours · step · Run analysis

**Say this:**

This is the heart of LunarEdge.

Left: **Local sky**. A polar plot. Up is north. The blue ring is the geometric horizon. We ask **JPL Horizons** where the Sun and Earth sit for that observer, at that UTC time. You can scrub the timeline and watch them move.

Right: the same **south pole sketch**, so you always know which GSFC site you are standing on.

Below: sunlight hours, Earth in view, time to sunset, time to Earthset. These are **geometry**, not a battery forecast, not a radio link.

If Horizons has not run yet, you see N/A. If terrain is not verified, terrain flags stay N/A. Unknown is not “blocked.”

---

## 3. Compare

**What to click:** Compare · two different sites · same UTC window · Compare

**Say this:**

Mission is one place, one clock.

Compare is **two or three places, same clock**.

You cannot pick the same site twice. That is on purpose. We want a fair trade-off.

The table lines up the same metrics. Missing values stay N/A in that column. We do not fill gaps. We do not pick a winner.

A planner can ask: this week, does Connecting ridge keep Earth longer than Shackleton rim? That is the question. Not “which landing is safe.”

---

## 4. Sources

**What to click:** Sources

**Say this:**

This is our honesty page.

**Live in the app:** JPL Horizons — Sun and Earth from the sky of the site.

**On the shelf:** NASA/GSFC LOLA 5 m DEMs. We name them. We do not invent terrain flags until the transform is verified.

Moon Trek and LROC QuickMap are for people to explore. LunarEdge does **not** query them.

The metrics table says what each number means — and what it is **not**.

If you remember one rule from this page: **null is not zero.**

---

## Close (about 15 seconds)

Four pages.

Candidates — where.  
Mission — when, and what the sky does.  
Compare — same clock, different ground.  
Sources — where the numbers come from, and where they stop.

LunarEdge is a navigator for a hard place. It does not land the spacecraft. It helps a team see the sky before they choose a window.

Thank you. We are Team LunarEdge. Questions welcome.

---

## One-line cheat sheet (if you freeze)

| Page | One line |
| --- | --- |
| Candidates | NASA/GSFC names on a south-pole sketch. Pick a place. |
| Mission | Horizons Sun and Earth in that sky, for a UTC window. |
| Compare | Two sites. Same clock. No fake winner. |
| Sources | Real links. N/A stays N/A. |

---

## Convert this file to PDF

From the repo root, with [Pandoc](https://pandoc.org/) installed:

```bash
pandoc docs/judge-pitch.md -o docs/judge-pitch.pdf --pdf-engine=xelatex
```

Or open the Markdown in VS Code / Cursor and **Print → Save as PDF**.

To Word first (same helper as the team blueprint):

```bash
python3 scripts/md_to_docx.py docs/judge-pitch.md docs/judge-pitch.docx
```

Then File → Save as PDF in Word or Pages.
