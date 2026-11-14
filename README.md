# LunarEdge — Lunar Landing Site Navigator

NASA Space Apps Challenge 2026. Team LunarEdge (four people).

A web app to **compare lunar south-pole landing site and date scenarios** using JPL Horizons Sun/Earth observer ephemerides and NASA/GSFC LOLA terrain products.

This is a **decision-support prototype**, not a certified landing-safety, flight-dynamics, or spacecraft power tool. NASA does not endorse LunarEdge.

## Current status

| Layer | State |
| --- | --- |
| Monorepo, docs, API types | Ready |
| `GET /api/v1/health`, `GET /api/v1/sites` | Implemented |
| Curated sites | JSON catalogue, plus **Supabase `landing_sites` when reachable** |
| `POST /api/v1/compare` | Orchestration implemented; metrics are null until Horizons |
| `POST /api/v1/analysis` | Stub `501` until Member 4 implements Horizons |
| 3D horizon | Placeholder (Member 3) |
| Site coordinates | **Unverified / null** until Member 4 documents them |
| Storage bucket | **Not used** (no rasters or ephemeris in Storage) |

Read `docs/document-issues.md` and `docs/TEAM_BLUEPRINT.md` before adding numbers.

## Repository layout

```
frontend/     Next.js App Router (TypeScript, Tailwind)
backend/      FastAPI
docs/         API contract, sources, team instructions
supabase/     SQL migrations + RLS
scripts/      Manual Horizons probe (unverified params)
```

## Prerequisites

- Node.js 20+ (npm)
- Python 3.11 or 3.12 preferred (3.14 may work for the stub API)
- Optional: Supabase project (schema already migratable from `supabase/migrations/`)

## Run locally

Copy names from the repo-root `.env.example` into gitignored local files, then fill secrets:

- `backend/.env`
- `frontend/.env.local` (browser-safe `NEXT_PUBLIC_*` only)

Never commit `.env`, `.env.local`, the database password, or a service-role key. Never put `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_DATABASE_URL` in `NEXT_PUBLIC_*`.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
# Create backend/.env from the root .env.example (backend section) if it does not exist.
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health  
  Look for `"sites_source": "supabase"` after migrations. `"json_fallback"` means the JSON file is in use.
- Sites: http://localhost:8000/api/v1/sites

Starting uvicorn **does not** run SQL. Apply migrations in the Supabase SQL editor (see below). Restart the API after changing `.env`.

### Frontend

```bash
cd frontend
# Create .env.local from the root .env.example (frontend section) if it does not exist.
npm install
npm run dev
```

Open http://localhost:3000

`NEXT_PUBLIC_ALLOW_DEMO_FIXTURE=true` lets the UI show a **labelled DEMO / MOCK** envelope when analysis is not implemented. Turn this off before any scientific demo.

### Tests and lint

```bash
cd backend && source .venv/bin/activate && pytest
cd frontend && npm run lint && npm run build
```

Unit tests stay offline (JSON catalogue). They do not require the live database.

## Environment variables

See root `.env.example` for names only.

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend | FastAPI origin + `/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Project URL (publishable) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Publishable / anon key |
| `SUPABASE_URL` | Backend | Same project URL |
| `SUPABASE_ANON_KEY` | Backend | Same publishable key; used to **read** `landing_sites` |
| `SUPABASE_DATABASE_URL` | Backend only | Direct Postgres URI for operators / future writes |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend only | Optional; privileged writes. Leave empty for the MVP |
| `CORS_ORIGINS` | Backend | Comma-separated frontend origins (no `*`) |

CORS defaults to `http://localhost:3000`. Add the Vercel origin at deploy time (`docs/deployment.md`).

## Supabase

1. Create a project (done for this team).
2. Put URL + publishable key in `frontend/.env.local` and `backend/.env`.
3. Put the direct connection string in `backend/.env` as `SUPABASE_DATABASE_URL` only.
4. In the Supabase **SQL Editor**, run in order:
   - `supabase/migrations/20261113_000001_init.sql`
   - `supabase/migrations/20261113_000002_seed_landing_sites.sql`
5. Confirm RLS: anonymous **SELECT** on `landing_sites` only. **No** public writes. **No** Storage bucket for the MVP.

`GET /api/v1/sites` then loads those rows. If Supabase is down, the API falls back to `backend/data/site_catalogue.json`. Analysis still runs without the database.

Seed rows are GSFC site **names**, DEM product IDs, and source URLs. Latitude, longitude, and altitude stay **null** until verified.

## Data provenance

- JPL Horizons: https://ssd-api.jpl.nasa.gov/doc/horizons.html
- LOLA 5 m/px sites: https://pgda.gsfc.nasa.gov/products/78
- Moon Trek / QuickMap: exploration only, not backend APIs

Do not invent coordinates, ephemeris, or metrics. `null` means unknown.

## Team

| Member | Owns |
| --- | --- |
| 1 Integration (this scaffold) | Root, docs, supabase, API types/client, compare, deploy |
| 2 Frontend | Dashboard UX, charts, states |
| 3 Visualization | HorizonViewer / R3F |
| 4 Science backend | Horizons, parser, LOLA, metrics |

AI prompts and contract: `docs/TEAM_BLUEPRINT.md`
