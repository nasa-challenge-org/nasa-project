# Decisions log

| ID | Decision | Rationale |
| --- | --- | --- |
| D1 | Monorepo: `/frontend`, `/backend`, `/docs`, `/supabase` | Matches team blueprint; simple hackathon clone |
| D2 | npm lockfile in `frontend/` | Node 22 is available; one package manager |
| D3 | Public `site_id` is catalogue slug, not UUID | Matches analysis request examples |
| D4 | Coordinates nullable until verified | Plan forbids inventing NASA coordinates |
| D5 | `altitude_km` has no default 0 | 0 would silently claim a height |
| D6 | RLS on; anon SELECT only on `landing_sites` | Public catalogue; no public writes |
| D7 | Analysis independent of Supabase | Core science must run if DB is down |
| D8 | Compare is 2–3 analysis requests + aligned null-safe metrics | Plan named the endpoint but omitted schema |
| D9 | `ENABLE_DEMO_ANALYSIS` default false | Prevent mixing mock ephemeris with live claims |
| D10 | No authentication in MVP | Plan P2 / spare-time only |
| D11 | Target Python 3.11–3.12; local machine may be newer | Document in README |
| D12 | CORS allow-list from `CORS_ORIGINS` | Localhost now; add Vercel origin at deploy time |
