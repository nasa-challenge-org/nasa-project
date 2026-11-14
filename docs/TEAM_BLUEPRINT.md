# LUNAREDGE
# Lunar Landing Site Navigator
## Team blueprint v2 — corrected for the existing repository

**NASA Space Apps Challenge 2026** | Official challenge: Lunar Landing Site Navigator  
Team: LunarEdge | Size: 4 | Delivery: hackathon MVP

**This is the document to send to teammates and to paste into AI agents.**  
Version 1 of the implementation plan had contract gaps and unverified example coordinates. Version 2 matches the repository Member 1 already scaffolded and the frozen decisions below.

Do not use the old `.docx` examples of `latitude_deg: -89`, `longitude_east_deg: 0` as real landing coordinates.

---

# 0. How to use this file with an AI coding agent (required)

The Git repository **already exists**. Member 1 created `/frontend`, `/backend`, `/docs`, and `/supabase`. Agents must inspect that repo and extend it. They must not generate a second app.

## Two-message workflow

Give the agent **two separate messages**, in this order.

### Message 1 — Base context (every teammate, every new chat)

1. Open this document.
2. Copy **Section 8.1 Shared context prompt** in full.
3. Paste it as the first message.
4. Wait until the agent reports the current repository structure and restates the frozen rules.
5. If it starts creating a new Next.js/FastAPI app from scratch, **stop it**. Re-send Message 1 and tell it the repo already exists.

### Message 2 — Your work package only

After Message 1 is acknowledged, paste **only your** member prompt:

| You are | Paste this second |
| --- | --- |
| Member 1 — integration / lead | Section 8.2 |
| Member 2 — frontend dashboard | Section 8.3 |
| Member 3 — horizon / 3D | Section 8.4 |
| Member 4 — Horizons / LOLA | Section 8.5 |

Do **not** paste all four member prompts into one chat.  
Do **not** skip Message 1.  
Do **not** change `frontend/lib/types.ts` or the API JSON field names without Member 1.

Optional extra context for Message 1 if the agent cannot see this whole file: also attach or `@`-mention `docs/api-contract.md` and `docs/ownership.md` in the repo.

## What the agent is allowed to do

- Read the repo first.
- Work only in that member’s owned files.
- Add tests, loading/error states, and provenance labels for their feature.
- Flag uncertain science and stop instead of guessing coordinates or Horizons syntax.

## What the agent is not allowed to do

- Invent NASA coordinates, ephemeris, metrics, or “verified” terrain visibility.
- Convert `null` to `0`.
- Mix DEMO / MOCK values with live JPL/LOLA results without a visible **DEMO / MOCK** badge.
- Rewrite another member’s files.
- Put `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*` or commit `.env` files.
- Claim NASA certification, landing safety, guaranteed comms, or electrical power.

---

# 1. Frozen decisions (gap fixes vs version 1)

These override the original plan wherever they conflict.

| ID | Decision |
| --- | --- |
| D1 | Monorepo is already created: `/frontend`, `/backend`, `/docs`, `/supabase`. |
| D2 | Package manager is **npm** (lockfile in `frontend/`). |
| D3 | Public `site_id` is the catalogue **slug** (e.g. `connecting-ridge`). Database UUID is internal only. |
| D4 | Observer `latitude_deg`, `longitude_east_deg`, `altitude_km` are **nullable** until verified. They are currently **null** in the catalogue. |
| D5 | Do **not** default `altitude_km` to 0. Zero would be a fake height. |
| D6 | RLS enabled. Anonymous **SELECT** only on `landing_sites`. No public writes. |
| D7 | Scientific analysis must run if Supabase is unavailable. |
| D8 | `POST /api/v1/compare` body is `{ "scenarios": [ { "label"?, "request": AnalysisRequest }, ... ] }` with length 2 or 3. Response includes `aligned_metrics` whose `values` may be null. |
| D9 | `ENABLE_DEMO_ANALYSIS` defaults to false. Frontend `NEXT_PUBLIC_ALLOW_DEMO_FIXTURE=true` may show a labelled DEMO envelope only. |
| D10 | No authentication in the MVP. |
| D11 | Target Python 3.11–3.12 (local machines may be newer). Node 20+. |
| D12 | CORS is an allow-list from `CORS_ORIGINS`. Default: `http://localhost:3000`. Add the Vercel origin at deploy time. Never use `*`. |
| D13 | Official challenge name: **Lunar Landing Site Navigator** (not “CLPS Lunar Mission Browser”). |
| D14 | Azimuth convention is **unverified** until Member 4 inspects a real Horizons observer table. Do not assume 0° = north in the 3D scene yet. |
| D15 | `POST /api/v1/analysis` is a **stub** (`501 ANALYSIS_NOT_IMPLEMENTED`) until Member 4 lands a verified Horizons adapter. Compare still returns a typed envelope with null metrics. |
| D16 | Member 1 owns `frontend/lib/types.ts` and `frontend/lib/api.ts`. Member 2 consumes them. Member 3 consumes visualization props from those types. |

Catalogue sites (names and DEM product IDs only; coordinates not seeded):

- `connecting-ridge` — GSFC Site01 Connecting ridge — `Site01_final_adj_5mpp_surf.tif`
- `shackleton-rim` — GSFC Site04 Shackleton rim — `Site04_final_adj_5mpp_surf.tif`
- `peak-near-shackleton` — GSFC Site07 Peak near Shackleton — `Site07_final_adj_5mpp_surf.tif`
- `de-gerlache-rim` — GSFC Site11 de Gerlache rim — `Site11_final_adj_5mpp_surf.tif`
- `leibnitz-beta-plateau` — GSFC Site20 Leibnitz beta plateau — `Site20_final_adj_5mpp_surf.tif`
- `malapert-massif` — GSFC Site23 Malapert massif — `Site23_final_adj_5mpp_surf.tif`

Source: https://pgda.gsfc.nasa.gov/products/78 and https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/

Member 4 may fill coordinates only after documenting the exact product README / GeoTIFF metadata / ROI shapefile used. Set `verification_status` to `verified` only then.

---

# 2. Product definition and MVP

## 2.1 Problem

South-pole lighting and Earth visibility change with location and date. LunarEdge lets planners, educators, and the public compare candidate sites and UTC windows in one web app.

This is a **decision-support prototype**, not a certified landing-safety, flight-dynamics, or spacecraft power tool. NASA does not endorse LunarEdge.

## 2.2 User journey

1. Open the dashboard and choose a curated GSFC-named site.
2. Select UTC start, duration (hours), sample step (minutes).
3. Run analysis. Backend will retrieve JPL Horizons Sun/Earth observer ephemerides (Member 4).
4. View horizon (Member 3) plus time-series (Member 2).
5. Review metrics: sunlight hours, Earth visibility hours, longest Earth blackout, mean solar elevation, relative solar incidence. Null → N/A.
6. Compare two or three scenarios.
7. Optionally save a scenario in Supabase later (P1, no public writes).

## 2.3 Must work (P0)

- At least 3 catalogue records with source URL and coordinate-reference documentation (names exist; coordinates pending verification).
- UTC start, duration, step with validation.
- JPL Horizons integration (Member 4) with provenance retained.
- Time series: timestamps, az/el degrees, quality flags.
- Horizon view labelled geometric vs terrain-aware.
- Metrics from samples; null if not computed.
- Compare ≥ 2 scenarios with the same metric keys.
- NASA/JPL/LOLA provenance in UI and README.

## 2.4 P1 / P2

P1: terrain-aware horizon for one verified site; 3D scene with 2D fallback; save scenario.  
P2: custom coordinates (`options.custom_observer: true`); CSV export; auth.

## 2.5 Out of scope

Certified hazard assessment; ingesting the 3.3 GB south-pole mosaic in the browser; electrical power simulation; atmospheric refraction; Kubernetes; scraping Moon Trek / QuickMap.

---

# 3. Architecture (matches the repo)

| Layer | Technology | Notes |
| --- | --- | --- |
| Web | Next.js App Router, TypeScript, Tailwind, shadcn/ui, Recharts | `frontend/` |
| 3D | Three.js / React Three Fiber | Only `frontend/components/visualization` and `horizon` |
| API | Python FastAPI, Pydantic, httpx, NumPy | `backend/` prefix `/api/v1` |
| Geospatial | Rasterio / pyproj when Member 4 verifies CRS | Do not assume Earth EPSG codes |
| DB | Supabase PostgreSQL | App metadata only |
| Deploy | Vercel + Render (or other Python host) | Separate origins; CORS allow-list |

NASA data stays at NASA/JPL/LOLA. Cache ephemeris as files, not SQL rows. Do not commit DEM GeoTIFFs.

Current analysis path: UI → FastAPI → stub (501) or, later, HorizonsClient. Compare always normalizes 2–3 results and keeps nulls.

---

# 4. NASA data rules

## 4.1 JPL Horizons

Docs: https://ssd-api.jpl.nasa.gov/doc/horizons.html  
Manual: https://ssd.jpl.nasa.gov/horizons/manual.html  
Endpoint: https://ssd.jpl.nasa.gov/api/horizons.api  

Intended setup (Member 4 must **verify** before using in the API):

- `EPHEM_TYPE=OBSERVER`
- Targets: Sun `10`, Earth `399`
- Observer on the Moon. Investigate `CENTER` + `SITE_COORD` (version 1 suggested `coord@301`; confirm against current docs)
- Quantities: parse **labels**, not column indexes. Quantity `4` is commonly azimuth/elevation; confirm.
- Timescale UTC; public API timestamps ISO-8601 with `Z`

First action for Member 4: one small query, inspect the raw payload, confirm it is a **lunar surface observer**, save a fixture. Do not treat `SITE_COORD 0,-89,0` as a catalogue site. `scripts/test_horizons_query.py` is an unverified probe only.

## 4.2 LOLA

https://pgda.gsfc.nasa.gov/products/78  
5 m/px GeoTIFFs, south-polar stereographic X/Y metres, MOON_ME / DE421 context. Not lat/lon rasters. If the transform cannot be verified, keep `terrain_visible: null` and `quality.terrain` geometric_only or unavailable.

## 4.3 Quality labels

| Label | Meaning |
| --- | --- |
| NASA ephemeris — geometric | Horizons az/el, no DEM obstruction |
| Terrain-aware estimate | Horizons vs verified LOLA horizon inside DEM coverage |
| Earth-centre visibility | Not a telecom link budget |
| DEMO / MOCK | Synthetic UI fixture only |

Relative solar incidence = `max(0, sin(elevation))` for a horizontal surface once real elevations exist. **Not watts.**

---

# 5. Data model (corrected SQL)

Enable RLS on every table. Public read of curated sites only. Writes via service role on the backend later. Never put the service-role key in the browser.

Coordinates may be null. `verification_status` is `unverified` | `verified` | `rejected`. A row cannot be `verified` without lat and lon.

Canonical migrations live in `supabase/migrations/`. Do not re-introduce `altitude_km default 0`. Do not store ephemeris samples or rasters in PostgreSQL.

---

# 6. Shared API contract (frozen)

Base: `{API_ORIGIN}/api/v1`  
Types: `frontend/lib/types.ts` and `backend/app/schemas/`  
Full text: `docs/api-contract.md`

Timestamps: ISO-8601 UTC with `Z`.  
Angles: degrees; fields end in `_deg`.  
Durations: hours. Steps: 5, 10, 15, 30, 60 minutes.  
`null` = unknown. Never coerce to 0.

## Endpoints

| Method | Path | Owner after scaffold |
| --- | --- | --- |
| GET | `/health` | Member 1 (done) |
| GET | `/sites` | Member 1 (done); Member 4 updates verified coords |
| GET | `/sites/{site_id}` | same; `site_id` = slug |
| POST | `/analysis` | Member 4 (currently 501 stub) |
| POST | `/compare` | Member 1 orchestration (done; calls analysis) |
| GET | `/analysis/{id}` | P2, currently 501 |
| GET | `/analysis/{id}/export.csv` | P2, currently 501 |

Error envelope:

```json
{
  "error": {
    "code": "ANALYSIS_NOT_IMPLEMENTED",
    "message": "Scientific analysis is not implemented yet.",
    "details": "Member 4 will implement JPL Horizons observer queries.",
    "request_id": "trace-id"
  }
}
```

Codes: `VALIDATION_ERROR`, `SITE_NOT_FOUND`, `SITE_COORDINATES_UNVERIFIED`, `ANALYSIS_NOT_IMPLEMENTED`, `HORIZONS_UPSTREAM_ERROR`, `UPSTREAM_TIMEOUT`, `NOT_IMPLEMENTED`.

## Analysis request

```json
{
  "site_id": "connecting-ridge",
  "observer": {
    "latitude_deg": null,
    "longitude_east_deg": null,
    "altitude_km": null,
    "coordinate_reference": "MOON_ME_PENDING_VERIFICATION"
  },
  "time": {
    "start_utc": "2027-01-01T00:00:00Z",
    "duration_hours": 72,
    "step_minutes": 30
  },
  "options": {
    "include_terrain": false,
    "earth_visibility_mode": "center",
    "solar_array_tilt_deg": 0,
    "custom_observer": false
  }
}
```

`observer` may be omitted. Custom coordinates require `options.custom_observer: true` (P2). `earth_visibility_mode` is `center` only in the MVP.

## Analysis response (shape)

`analysis_id`, `status` (`complete` | `partial` | `not_implemented` | `error`), `site` (id, name, nullable lat/lon), `time` (start_utc, end_utc, step_minutes, sample_count), `quality` (ephemeris, terrain, earth_visibility, warnings[]), `summary` (all numeric fields nullable), `samples[]` (`time_utc`, `sun`, `earth` body samples), `provenance`.

`quality.ephemeris`: `jpl_horizons` | `unavailable` | `demo_mock`  
`quality.terrain`: `geometric_only` | `terrain_aware` | `unavailable`  
`sun.geometric_visible` / `earth.geometric_visible`: boolean or null  
`*.terrain_visible`: boolean or null (null until LOLA verified)

## Compare request

```json
{
  "scenarios": [
    { "label": "Connecting ridge", "request": { "site_id": "connecting-ridge", "time": { "start_utc": "2027-01-01T00:00:00Z", "duration_hours": 72, "step_minutes": 30 } } },
    { "label": "Shackleton rim", "request": { "site_id": "shackleton-rim", "time": { "start_utc": "2027-01-01T00:00:00Z", "duration_hours": 72, "step_minutes": 30 } } }
  ]
}
```

## Compare response

`comparison_id`, `status`, `scenarios[]` (`index`, `label`, `analysis` or null, `error` or null), `aligned_metrics[]` (`key`, `unit`, `values` as array of number|null), `warnings[]`.

UI must render null as N/A. Do not average nulls.

---

# 7. File ownership (do not cross without asking Member 1)

| Path | Owner |
| --- | --- |
| Root README, `.gitignore`, `.env.example`, `docs/**`, `supabase/**` | Member 1 |
| `backend/app/main.py`, `core/**`, `api/v1/**`, `schemas/**` | Member 1 contract/routes; Member 4 fills analysis science inside the stub |
| `backend/app/services/site_catalogue.py`, `analysis_stub.py`, `compare.py` | Member 1 |
| `backend/app/services/horizons_client.py`, `ephemeris_parser.py`, `solar_metrics.py`, `terrain_loader.py`, `horizon_profile.py` | Member 4 |
| `backend/data/site_catalogue.json` | Member 1 names; Member 4 verified coordinates |
| `frontend/lib/types.ts`, `frontend/lib/api.ts` | Member 1 |
| `frontend/app/**`, `frontend/components/ui/**`, `frontend/components/charts/**` | Member 2 |
| `frontend/components/shared/**` | Member 1 scaffold; Member 2 may extend |
| `frontend/components/visualization/**`, `frontend/components/horizon/**` | Member 3 |

Branches: `feat/frontend-dashboard`, `feat/horizon-visualization`, `feat/horizons-lola-backend`. Do not push to `main`. Do not commit `.env`, DEM rasters, or caches.

Existing UI routes: `/` home, `/dashboard`, `/compare`, `/methodology`. HorizonViewer is a placeholder that already accepts `sample` and `qualityLabel`.

---

# 8. Copy/paste AI prompts

Copy **one grey prompt box at a time**. Keep the line breaks. Do not paste all roles into one chat.

Message 1 = section 8.1. Message 2 = only 8.3 or 8.4 or 8.5 (or 8.2 for the lead).

## 8.1 Shared context prompt — Message 1 for every agent

Copy everything in the following block.

```
You are a senior engineer on LunarEdge, a four-person NASA Space Apps Challenge 2026 team.

Product: Lunar Landing Site Navigator — a web app that compares lunar south-pole
landing site/date scenarios using JPL Horizons Sun/Earth observer ephemerides
and NASA/GSFC LOLA terrain products. NASA does not endorse this app. It is a
decision-support prototype, not a certified landing, comms, or power tool.

Open the EXISTING project folder (NASA-Project). The repository ALREADY EXISTS.
Inspect it before editing. Do not scaffold a second Next.js or FastAPI app.
Do not dump a rewrite of the whole product.

Fixed architecture (already in the repo):
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts.
- 3D: Three.js / React Three Fiber ONLY in visualization/horizon components.
- Backend: Python FastAPI, Pydantic, httpx, NumPy; Rasterio/pyproj only after
  LOLA CRS is verified. Do not assume Earth EPSG codes.
- Database: Supabase PostgreSQL only for app-owned metadata and saved scenarios.
- NASA data stays sourced from NASA/JPL/LOLA. Do not copy rasters or ephemeris
  samples into Supabase. Do not commit DEM GeoTIFFs or cache files.

Current layout:
- /frontend  Next.js app (dashboard, compare, methodology already stubbed)
- /backend   FastAPI /api/v1 (health + sites live; analysis is a 501 stub)
- /docs      api-contract.md, ownership.md, TEAM_BLUEPRINT.md
- /supabase  migrations with RLS (anon SELECT on landing_sites only)
- /scripts   unverified Horizons probe only

Frozen rules:
- API prefix /api/v1. Public timestamps ISO-8601 UTC with Z.
- Angles in degrees; field names end in _deg. Durations in hours.
- Public site_id is the catalogue slug (connecting-ridge, shackleton-rim, …).
  Database UUID is internal only.
- Catalogue coordinates are currently null / unverified. Do not invent
  lat/lon/altitude or treat -89, 0 as a landing site.
- Do not default unknown altitude or metrics to 0. null means unknown.
  UI shows N/A.
- Distinguish geometric visibility from terrain-aware visibility.
- terrain_visible stays null until LOLA CRS transform is verified.
- Azimuth convention is unverified. Do not assume 0° = north until Member 4
  documents the Horizons output convention.
- POST /api/v1/analysis is 501 until Member 4 implements Horizons.
- POST /api/v1/compare accepts 2 or 3 scenarios; aligned_metrics values may
  be null. Never average nulls or convert them to zero.
- DEMO / MOCK data must stay labelled. quality.ephemeris = demo_mock for
  fixtures. Never mix mock values with live NASA claims.
- Never put SUPABASE_SERVICE_ROLE_KEY in NEXT_PUBLIC_* or commit .env files.
- Do not change frontend/lib/types.ts or backend schema field names without
  Member 1 approval.
- Work only in your assigned files. Ask before touching another member's files.
- If a scientific input is uncertain, stop and flag it. Do not guess.

Engineering:
1. First response: summarize understanding, list current repo files you will
   touch, identify blockers, propose a small sequence. Then wait unless the
   user said to implement.
2. Reuse existing components and dependencies. No broad rewrites.
3. Add validation, errors, loading states and tests for your work.
4. Before finishing: run relevant tests/build/lint and report exact
   commands/results.
5. List changed files, assumptions, unresolved issues, manual steps.

Read docs/api-contract.md, docs/ownership.md, and docs/TEAM_BLUEPRINT.md.
Match backend Pydantic schemas and frontend/lib/types.ts exactly.
```

## 8.2 Member 1 — integration (usually already done for foundation)

```
You are Member 1, technical lead / integration engineer.

The foundation already exists. Do not recreate the monorepo unless the user
asks to fix a specific integration bug.

You own: root config, docs, supabase, frontend/lib/types.ts, frontend/lib/api.ts,
compare orchestration, CORS, deploy docs, QA.

You do not own Horizons math or the 3D scene.

Only change the API contract after stating the diff and getting approval.

If asked to continue: keep Supabase optional, keep analysis independent of the
database, keep RLS without public writes, keep null metrics as null.
```

## 8.3 Member 2 — frontend dashboard — Message 2

```
You are Member 2, frontend engineer for LunarEdge.

Stack: Next.js App Router, TypeScript, Tailwind, existing shadcn-style components
in frontend/components/ui, Recharts.

Consume frontend/lib/types.ts and frontend/lib/api.ts. Do not rename API fields.
Do not implement Horizons math or the 3D scene.

Existing routes to extend (do not delete):
- frontend/app/page.tsx
- frontend/app/dashboard/page.tsx
- frontend/app/compare/page.tsx
- frontend/app/methodology/page.tsx

Import HorizonViewer from frontend/components/visualization/HorizonViewer.tsx.
Pass selected sample + quality labels. Member 3 will replace the placeholder.

Build / polish:
1. Mission-control visual style (navy/charcoal, cyan highlights, amber Sun, blue Earth).
2. Site selector from GET /api/v1/sites. Show verification_status and
   "Coordinates unverified" when lat/lon are null.
3. UTC start, duration 1–336 hours, step 5/10/15/30/60, terrain toggle, Run Analysis.
   Treat datetime-local as UTC (already labelled). Do not silently convert local TZ
   in a way that mislabels timestamps.
4. Metric cards: sunlight_hours, earth_visibility_hours,
   longest_earth_blackout_hours, mean_solar_elevation_deg,
   relative_solar_incidence_mean, terrain_slope_mean_deg.
   Render null as N/A, never 0.
5. Recharts: Sun and Earth elevation vs UTC. Gaps for null samples.
6. Visibility legend: geometric vs terrain-aware vs unknown.
7. Timeline slider selecting sample index; pass that sample to HorizonViewer.
8. Comparison page: 2–3 scenarios, aligned metrics, quality labels, null-safe table.
9. Loading, empty, partial, validation, and ApiClientError states.
10. Methodology page: Horizons, LOLA, Moon Trek, QuickMap links and caveats.
    Moon Trek and QuickMap are exploration tools, not our API.

If analysis returns 501, show the error clearly. You may fall back to
frontend/lib/fixtures/demo-analysis.ts ONLY when NEXT_PUBLIC_ALLOW_DEMO_FIXTURE=true
and the DEMO / MOCK banner is visible.

Rules:
- All angles show °, times are UTC, durations show hours.
- Controls must be keyboard accessible, labelled, and usable on mobile.
- Keep components small. Do not build one giant page file.
- Avoid new dependencies unless justified.
- Never claim a site is safe, NASA-approved, or mission-ready.
- Never call Earth visibility a guaranteed communications link.
- Never call relative solar incidence watts or spacecraft power.
- Put charts in frontend/components/charts/. Do not implement 3D math.

Acceptance:
- npm run lint and npm run build pass.
- Desktop and a mobile width work.
- User can select a site/date, run analysis, and see live or labelled DEMO data.
- Timeline selection updates the current sample and charts.
- Null metrics stay N/A on dashboard and compare.
- Source/quality labels remain visible.
- Report files changed and any contract gaps to Member 1 instead of editing types.ts.
```

## 8.4 Member 3 — visualization — Message 2

```
You are Member 3, visualization engineer for LunarEdge.

Work only in:
- frontend/components/visualization/
- frontend/components/horizon/

Do not rewrite dashboard layout, API types, or backend math.

Replace the HorizonViewer placeholder. Keep the exported name HorizonViewer
and accept at least:
- selected sample time
- sun azimuth_deg / elevation_deg / geometric_visible / terrain_visible
- earth azimuth_deg / elevation_deg / geometric_visible / terrain_visible
- quality/method labels
- optional terrain horizon profile later (may be absent)

Rules:
- Backend samples are authoritative. Do not invent planetary positions
  or calculate ephemeris.
- Show a horizon plane/line, cardinal directions, observer marker, Sun
  marker, and Earth marker.
- Map elevation to vertical position and azimuth to horizontal direction
  in one documented system.
- Azimuth convention is UNVERIFIED. Document the mapping you use as
  provisional. Coordinate with Member 4 before claiming 0° = north.
- Unknown visibility is not blocked. Use a distinct visual for null vs false.
- Provide a 2D SVG/canvas fallback if WebGL fails.
- Optional terrain patch only if Member 4 supplies a correctly georeferenced
  downsampled mesh or height grid. Do not load multi-GB GeoTIFFs in the browser.
- Synchronize only through props from the dashboard timeline. No independent
  fabricated timer.
- Add a legend, units, and a visible geometric-only / terrain-aware label.
- Do not imply the scene is to scale unless explicitly calibrated.
- Keep performance appropriate for ordinary laptops.

Acceptance:
- Renders a real or DEMO sample without fake ephemeris.
- Changing selected sample updates Sun/Earth markers.
- Mapping is documented in a short README in the visualization folder.
- 2D fallback works.
- No console errors or runaway animation loops.
- Report the props API you need if the placeholder is insufficient.
```

## 8.5 Member 4 — Horizons and LOLA — Message 2

```
You are Member 4, scientific backend engineer for LunarEdge.

Do not invent scientific values. Do not change the public JSON field names
in backend/app/schemas or frontend/lib/types.ts. If a field is missing, ask
Member 1.

Keep GET /api/v1/health, GET /api/v1/sites, and GET /api/v1/sites/{id} working.
Validate UTC times, duration 1–336, step 5/10/15/30/60, coordinates, and
supported site IDs. Return the shared error envelope
{ "error": { "code", "message", "details", "request_id" } }.

Implement inside existing stubs (keep signatures unless you must extend them
with optional verified metadata):
- backend/app/services/horizons_client.py
- backend/app/services/ephemeris_parser.py
- backend/app/services/solar_metrics.py
- backend/app/services/terrain_loader.py
- backend/app/services/horizon_profile.py
- POST /api/v1/analysis via replacing the 501 path in analysis_stub / routes
  without breaking compare orchestration

Part A — verify Horizons first:
- Official docs: https://ssd-api.jpl.nasa.gov/doc/horizons.html
  and https://ssd.jpl.nasa.gov/horizons/manual.html
- scripts/test_horizons_query.py uses UNVERIFIED parameters. Do not copy
  SITE_COORD 0,-89,0 into the site catalogue.
- Confirm lunar surface observer (not Moon center, not Earth).
- Confirm CENTER, SITE_COORD, COORD_TYPE, quantity codes, azimuth convention,
  altitude units, longitude direction.
- Save a redacted raw fixture for tests. Parse labels, not column indexes.
- First make a minimal test query and inspect the raw response before building
  the parser. Confirm it is a lunar surface observer.
- httpx async client, timeouts, bounded retries, cache by deterministic key
  on disk under backend/data/cache (do not commit cache files).
- Preserve source metadata and timescale on every response.

Part B — metrics:
- geometric_visible from a documented elevation threshold (default > 0°).
- Durations from sample intervals; state boundary uncertainty = step_minutes.
- longest Earth blackout, mean solar elevation,
  relative incidence max(0, sin(elevation)) for a horizontal surface.
- Do not call incidence watts or Earth visibility a comms link.

Part C — coordinates and LOLA:
- Fill backend/data/site_catalogue.json lat/lon/altitude ONLY from documented
  GSFC README / GeoTIFF / ROI sources. Keep source_url and set
  verification_status=verified only when both lat and lon are present.
- LOLA 5 m/px tiles: https://pgda.gsfc.nasa.gov/products/78
- Inspect CRS. Do not assume Earth EPSG. South-polar stereographic metres.
- If transform is unverified: terrain_visible = null, warning on quality.
- Do not download the 3.3 GB mosaic first.

Part D — tests:
- Offline fixtures for parser, durations, null handling, cache keys.
- Optional network test marked so CI can skip it.

Acceptance:
- One manually inspected Horizons Sun+Earth series for a verified observer.
- Response matches shared schema; summary nulls stay null when unknown.
- pytest passes offline.
- Report exact Horizons parameters, quantity codes, azimuth convention,
  uncertainties, and files changed.
```

---

# 9. Local run

Prerequisites: Git, Node 20+, npm, Python 3.11+ (3.12 preferred).

Backend:

```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Frontend:

```
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 and http://localhost:8000/docs  
Health: http://localhost:8000/api/v1/health

Tests:

```
cd backend && source .venv/bin/activate && pytest
cd frontend && npm run lint && npm run build
```

## Environment

Frontend `.env.local` (browser-safe only):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ALLOW_DEMO_FIXTURE=true
```

Backend `.env`:

```
APP_ENV=development
CORS_ORIGINS=http://localhost:3000
ENABLE_DEMO_ANALYSIS=false
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
HORIZONS_BASE_URL=https://ssd.jpl.nasa.gov/api/horizons.api
DATA_DIR=./data
```

Deploy: Vercel `frontend/` with `NEXT_PUBLIC_API_BASE_URL` pointing at the Python host. Render/Fly: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, health `/api/v1/health`, `CORS_ORIGINS` = the Vercel URL.

---

# 10. Testing, demo, and claims to avoid

Tests must cover validation, null metrics, compare of 2–3 scenarios, parser fixtures, and UI N/A rendering.

Demo story: pick a site → UTC window → Sun/Earth vs horizon from Horizons → compare a second site/date → show provenance. Until Member 4 lands Horizons, say the science adapter is in progress. Do not present DEMO fixtures as NASA data.

Never say: NASA certified; landing probability; guaranteed communications; actual power output; geometric visibility is terrain-aware; Moon Trek is our API.

## Definition of done for a feature

- Matches this contract
- Owned files only
- Tests/build/lint relevant to the change pass
- No secrets or DEM rasters committed
- UI shows source, units, UTC, quality
- Member 1 reviews contract-touching PRs

---

# 11. Sources

- Challenge: NASA Space Apps 2026 Lunar Landing Site Navigator
- Horizons API: https://ssd-api.jpl.nasa.gov/doc/horizons.html
- LOLA sites: https://pgda.gsfc.nasa.gov/products/78
- Moon Trek (exploration): https://trek.nasa.gov/moon/
- LROC QuickMap (exploration): https://quickmap.lroc.asu.edu/
- Barker et al. 2021 PSS 203; Mazarico et al. 2011 Icarus 211

---

LunarEdge — Explore. Compare. Decide.  
Blueprint v2 | Aligns with the scaffolded repository | Coordinates unverified until Member 4 documents them
