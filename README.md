# LunarEdge — Lunar Landing Site Navigator

NASA Space Apps Challenge 2026. Team LunarEdge (four people).

A web app to **compare lunar south-pole landing site and date scenarios** using JPL Horizons Sun/Earth observer ephemerides and NASA/GSFC LOLA terrain products.

This is a **decision-support prototype**, not a certified landing-safety, flight-dynamics, or spacecraft power tool. NASA does not endorse LunarEdge.

## Current status (foundation scaffold)

| Layer | State |
| --- | --- |
| Monorepo, docs, API types | Ready |
| `GET /api/v1/health`, `GET /api/v1/sites` | Implemented |
| `POST /api/v1/compare` | Orchestration implemented; metrics are null |
| `POST /api/v1/analysis` | Stub `501` until Member 4 implements Horizons |
| 3D horizon | Placeholder (Member 3) |
| Dashboard UX | Thin shell (Member 2 owns polish) |
| Site coordinates | **Unverified / not seeded** |

Read `docs/document-issues.md` before adding numbers.

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
- Optional: Supabase project for persistence

## Run locally

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health
- Sites: http://localhost:8000/api/v1/sites

### Frontend

```bash
cd frontend
cp .env.example .env.local
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

## Environment variables

See root `.env.example`. Never commit `.env` files or `SUPABASE_SERVICE_ROLE_KEY`. Never put the service-role key in `NEXT_PUBLIC_*`.

CORS defaults to `http://localhost:3000`. Add the Vercel origin at deploy time (`docs/deployment.md`).

## Supabase

Apply `supabase/migrations/` in the SQL editor. RLS is enabled. Anonymous **SELECT** is allowed on `landing_sites` only. There are **no** public write policies. Analysis does not require Supabase.

Seed rows include GSFC site names, DEM product IDs, and source URLs. Latitude, longitude, and altitude are **null** until verified.

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

Details: `docs/team-instructions.md`
