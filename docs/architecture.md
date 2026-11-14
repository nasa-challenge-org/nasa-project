# Architecture

LunarEdge is a hackathon MVP for the NASA Space Apps Challenge 2026 **Lunar Landing Site Navigator** brief: compare lunar south-pole landing site/date scenarios using JPL Horizons observer ephemerides and NASA/GSFC LOLA terrain products.

## Stack (frozen)

| Layer | Choice |
| --- | --- |
| Frontend | Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| 3D | Three.js / React Three Fiber in visualization components only (Member 3) |
| Backend | Python FastAPI, Pydantic, httpx, NumPy; Rasterio/pyproj when terrain is verified |
| Database | Supabase PostgreSQL for app-owned metadata only |
| API prefix | `/api/v1` |
| Deploy | Vercel (frontend) + a Python host such as Render (backend) |

NASA/JPL/LOLA data is **not** copied wholesale into Supabase. Ephemeris samples and DEM rasters stay in source APIs / local cache files.

## Runtime data flow

1. UI selects curated site slug + UTC window + step.
2. Frontend calls FastAPI `POST /api/v1/analysis` or `POST /api/v1/compare`.
3. Backend (Member 4) will query Horizons and, if verified, sample LOLA.
4. Response includes samples, null-safe summaries, quality labels, and provenance.
5. Optional: save scenario/summary rows in Supabase. Analysis still runs if Supabase is down.

## Ownership

| Path | Owner |
| --- | --- |
| Root config, `docs/`, `supabase/`, `frontend/lib/types.ts`, `frontend/lib/api.ts`, compare orchestration, deploy docs | Member 1 (integration) |
| `frontend/app`, `frontend/components/ui`, dashboard/charts UX | Member 2 |
| `frontend/components/visualization`, `frontend/components/horizon` | Member 3 |
| `backend/app/services` science adapters, `POST /analysis` Horizons path | Member 4 |

Do not change the shared API contract without Member 1 approval.
