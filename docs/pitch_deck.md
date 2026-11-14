# LunarEdge — NASA Space Apps Challenge 2026
## Live Pitch Slide Deck (7 Slides Maximum · 8–10 Minutes)

> **Team:** LunarEdge (4 Members)  
> **Visual Style:** Deep space navy (`#060b16` / `#0d1528`), Electric Cyan (`#38bdf8`), Solar Gold (`#fbbf24`), Slate Gray (`#94a3b8`)  
> **Rule Compliance:** Professional space-tech styling, no cartoon rockets, strict scientific integrity, zero unverified numbers.  
> **PowerPoint File:** [docs/LunarEdge_Pitch_Deck.pptx](file:///e:/Nasa-Hackathon-2026/nasa-project/docs/LunarEdge_Pitch_Deck.pptx)

---

### Slide 1: Title & Purpose

```
┌────────────────────────────────────────────────────────────────────────┐
│  [ NASA SPACE APPS CHALLENGE 2026 · MISSION DECISION-SUPPORT ]         │
│                                                                        │
│                            LUNAREDGE                                   │
│                 Lunar Landing Site Navigator                           │
│                                                                        │
│            “Compare site + date with honest N/A.”                      │
│                                                                        │
│  Team LunarEdge: 4 Engineers · Topocentric JPL Horizons (DE441) + LOLA │
└────────────────────────────────────────────────────────────────────────┘
```

#### Visual Layout:
- Background: Minimalist deep-navy space canvas (`#060b16`) with electric cyan perimeter border.
- Header pill: `NASA SPACE APPS CHALLENGE 2026 · MISSION DECISION-SUPPORT` in bold cyan.
- Title: Clean sans-serif title in pure white (`#ffffff`).
- Tagline: Solar gold (`#fbbf24`): *“Compare site + date with honest N/A.”*
- Team line: 4 Engineers, Topocentric JPL Horizons (DE441) + NASA/GSFC LOLA.

> **Speaker Notes (34 words):**  
> *"Good morning, judges. We are team LunarEdge. We built the Lunar Landing Site Navigator to solve a critical challenge in Artemis mission planning: evaluating landing sites and launch dates with uncompromised, honest celestial physics."*

---

### Slide 2: The South Pole Problem

```
┌────────────────────────────────────────────────────────────────────────┐
│  THE SOUTH POLE IS UNFORGIVING                                         │
│                                                                        │
│  [ EXTREME SOLAR GRAZING ]       [ LIBRATING EARTH BLACKOUTS ]         │
│  • Moon axis tilt: only 1.54°    • Wobbles near local horizon          │
│  • Sun skims at 1° to 3° elev    • Multi-day comms blackouts (50–100h) │
│  • Elongated shadow traps        • Direct line-of-sight drops out      │
│  • Diminished solar power        • Requires exact schedule planning    │
│                                                                        │
│  OPERATIONAL SENSITIVITY: Shifting 5 km or 48 hours flips viability!   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Visual Layout:
- **Left Card (Sun)**: Solar gold accent (`#fbbf24`), grazing angle metrics.
- **Right Card (Earth)**: Cyan accent (`#38bdf8`), libration blackout metrics.
- **Bottom Callout Bar**: Amber border (`#f59e0b`): *Operational sensitivity warning*.

> **Speaker Notes (36 words):**  
> *"At the lunar south pole, the Sun skims the horizon at two degrees, and Earth wobbles low. A shift of just five kilometers or two days can plunge a landed mission into weeks of freezing darkness."*

---

### Slide 3: The Solution — Four Screens, One Clock

```
┌────────────────────────────────────────────────────────────────────────┐
│  THE SOLUTION: FOUR SCREENS, ONE SOUTH-POLE CLOCK                      │
│                                                                        │
│  [ CANDIDATES ]     [ MISSION RUN ]     [ COMPARE ]       [ SOURCES ]  │
│  • 6 GSFC sites     • Horizons API      • Side-by-side    • Provenance │
│  • 3D terrain mesh  • 2D/3D sky dome    • Aligned UTC     • JPL DE441  │
│  • Slope & ellipse  • 1-click CSV export• Honest N/A      • LRO LOLA   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Visual Layout:
- Four vertical cards spanning the width:
  1. **Candidates (Cyan)**: 6 GSFC Product 78 regions, 3D site terrain model, landing ellipse.
  2. **Mission Run (Gold)**: Topocentric Sun/Earth ephemeris, 2D polar & 3D hemisphere, CSV export.
  3. **Compare (Cyan)**: Side-by-side scenario matrix, aligned UTC timeline, honest `N/A`.
  4. **Sources (Emerald)**: JPL Horizons DE441 (`coord@301`), GSFC LOLA Product 78, methodology.

> **Speaker Notes (26 words):**  
> *"LunarEdge unifies four screens under one synchronized UTC clock: explore candidate sites, run topocentric horizon analyses, compare trade studies side-by-side, and verify authentic NASA data sources."*

---

### Slide 4: Mission Analysis & 3D Celestial Sky

```
┌────────────────────────────────────────────────────────────────────────┐
│  MISSION ANALYSIS & 3D CELESTIAL SKY                                   │
│                                                                        │
│  [ TOPOCENTRIC EPHEMERIS ENGINE ]   [ 3D CELESTIAL HEMISPHERE ]        │
│  • JPL Horizons DE441 (coord@301)   • 2D Polar & 3D Hemisphere toggle  │
│  • Azimuth & Elevation per hour     • 3D Artemis Lander at origin      │
│  • Gold Sun & Blue Earth tracking   • Dynamic cast ground shadow       │
│  • Interactive timeline scrubber    • Pulsing corona & comms beam      │
│  • 1-click CSV ephemeris export     • Zero-dependency 60 FPS Canvas    │
└────────────────────────────────────────────────────────────────────────┘
```

#### Visual Layout:
- Two 50/50 split cards:
  - **Left Card (Ephemeris)**: Cyan border, topocentric ephemeris precision details.
  - **Right Card (3D Visualization)**: Gold border, 3D hemisphere, lander model, dynamic shadow, telemetry beam.

> **Speaker Notes (27 words):**  
> *"Planners select a site and UTC window. In seconds, LunarEdge queries JPL Horizons, plotting celestial elevations, daylight spans, and an interactive 3D topocentric sky with dynamic shadows."*

---

### Slide 5: Trade Study Comparison: Honest N/A by Design

```
┌────────────────────────────────────────────────────────────────────────┐
│  TRADE STUDY COMPARISON: HONEST N/A BY DESIGN                          │
│                                                                        │
│  ┌──────────────────────┬───────────────────┬────────────────────────┐ │
│  │ Metric / Parameter   │ Connecting Ridge  │ de Gerlache Rim        │ │
│  ├──────────────────────┼───────────────────┼────────────────────────┤ │
│  │ Coordinates          │ 89.44° S, 222.5° E│ 88.71° S, 68.3° E      │ │
│  │ Verification Status  │ VERIFIED          │ UNVERIFIED             │ │
│  │ Daylight (72h)       │ 54 hrs continuous │ N/A (pending DTM)      │ │
│  │ Earth-in-View (72h)  │ 72 hrs continuous │ N/A (pending DTM)      │ │
│  └──────────────────────┴───────────────────┴────────────────────────┘ │
│                                                                        │
│  [ ZERO-SUBSTITUTION HAZARD ]        [ SYNCHRONIZED EVALUATION ]       │
│  Coercing N/A to 0 falsely claims    Identical UTC window eliminates   │
│  darkness or failure.                temporal skew in trade studies.   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Visual Layout:
- Structured data table with green badges for verified metrics and amber badges for honest `N/A`.
- Two bottom callout cards highlighting the zero-substitution danger and synchronized UTC evaluation.

> **Speaker Notes (29 words):**  
> *"Our trade-study engine compares sites side-by-side under the exact same UTC clock. Where terrain data is pending verification, we display an honest N/A. We never substitute zero for unknown."*

---

### Slide 6: Scientific Integrity & Non-Negotiables

```
┌────────────────────────────────────────────────────────────────────────┐
│  MANDATORY SCIENTIFIC DISCLOSURES                                      │
│  SCIENTIFIC INTEGRITY & NON-NEGOTIABLE STANDARDS                       │
│                                                                        │
│  [ NASA DISCLAIMER ]             [ N/A IS NEVER ZERO ]                 │
│  • Decision-support prototype    • Unverified metrics show N/A         │
│  • NASA does not endorse app     • Substituting 0 corrupts risk        │
│  • Not for flight operations     • Uncertainty is preserved honestly   │
│                                                                        │
│  [ GEOMETRIC HORIZON ONLY ]      [ VERIFIED GSFC CATALOGUE ]           │
│  • Line-of-sight elevation angles• Six authentic GSFC sites only       │
│  • Not electrical solar watts    • Zero synthetic coordinates          │
│  • Not RF link budget / margin   • Direct provenance to LRO data       │
└────────────────────────────────────────────────────────────────────────┘
```

#### Visual Layout:
- Four distinct high-contrast cards:
  1. **NASA Disclaimer (Amber)**: Clear prototype status and no-endorsement disclosure.
  2. **N/A $\neq$ 0 (Rose)**: Missing data integrity rule.
  3. **Geometric Horizon Only (Cyan)**: Physics scope boundary (elevation angles vs watts/RF).
  4. **Verified GSFC Catalogue (Emerald)**: Authentic Product 78 data scope.

> **Speaker Notes (30 words):**  
> *"Scientific integrity is non-negotiable: NASA does not endorse LunarEdge. We calculate geometric horizons, not watts or link budgets. Unverified sites strictly display N/A—zero is never an acceptable substitute for unknown."*

---

### Slide 7: System Architecture, Impact & Conclusion

```
┌────────────────────────────────────────────────────────────────────────┐
│  SYSTEM ARCHITECTURE, IMPACT & CONCLUSION                              │
│                                                                        │
│  [ TECHNICAL ARCHITECTURE ]          [ MISSION IMPACT & ROADMAP ]      │
│  • Next.js 16 + Tailwind CSS         • Rapid pre-mission trade studies │
│  • Zero-dependency 3D Canvas         • Immediate lighting cliff alert  │
│  • FastAPI (Python 3.12) backend     • Phase 1: 20m LOLA DTM rays      │
│  • Live JPL Horizons concurrency     • Phase 2: Diviner thermal data   │
│  • Sub-ms in-memory cache            • Team: 4 specialized engineers   │
│                                                                        │
│             FOUR SCREENS. ONE CLOCK. N/A ≠ 0.                          │
│        Thank you, judges! LunarEdge is now open for questions.         │
└────────────────────────────────────────────────────────────────────────┘
```

#### Visual Layout:
- Left Column: Modern web stack & real-time NASA ephemeris pipeline.
- Right Column: Operational Artemis impact, 2-phase roadmap, and 4-member team credit.
- Bottom Hero Banner: Closing philosophy (*"FOUR SCREENS. ONE CLOCK. N/A $\neq$ 0."*) and Q&A prompt.

> **Speaker Notes (32 words):**  
> *"Built with Next.js and FastAPI querying JPL Horizons in real time, LunarEdge provides transparent pre-mission reconnaissance. Thank you, judges—four screens, one clock, N/A never equals zero. We are ready for your questions."*

---

### Rehearsal Timing Guide (8–10 Minute Pitch)

| Slide | Subject | Spoken Word Count | Allocated Time | Cumulative Time |
|---|---|---|---|---|
| **1** | Title & Identity | 34 words | 1:00 min | 1:00 min |
| **2** | The South Pole Problem | 36 words | 1:15 min | 2:15 min |
| **3** | Four Screens, One Clock | 26 words | 1:15 min | 3:30 min |
| **4** | Mission Analysis & 3D Sky | 27 words | 1:30 min | 5:00 min |
| **5** | Trade Study Comparison | 29 words | 1:30 min | 6:30 min |
| **6** | Scientific Non-Negotiables | 30 words | 1:15 min | 7:45 min |
| **7** | Architecture, Impact & Close | 32 words | 1:15 min | 9:00 min |
| **—** | **Judges Q&A** | — | — | **9:00–10:00 min** |
