# Team instructions

Send teammates `docs/TEAM_BLUEPRINT.md` or the v2 Word file in Downloads.

**AI agents: two messages.** (1) Paste Section 8.1 shared context. Wait for the agent to inspect the repo. (2) Paste only your member prompt (8.3, 8.4, or 8.5). Do not paste every role into one chat.

## Branches

```
main
├── feat/project-foundation-supabase   (Member 1 — this scaffold)
├── feat/frontend-dashboard            (Member 2)
├── feat/horizon-visualization         (Member 3)
└── feat/horizons-lola-backend         (Member 4)
```

Never push directly to `main`. One logical feature per PR. Do not commit `.env`, service-role keys, DEM GeoTIFFs, or ephemeris caches.

## Daily ritual

Post: completed, next, blocked, files changed, API/schema impact. Integrate at least twice per day.

## Member 2 next

Own dashboard UX: site/date controls, metric cards (null → N/A), Recharts, timeline slider, loading/error/partial states, methodology page polish. Consume `frontend/lib/types.ts` and `frontend/lib/api.ts`. Import `HorizonViewer` from visualization; do not implement 3D math.

## Member 3 next

Replace `HorizonViewer` placeholder. Consume sample az/el from the API types. Document azimuth mapping only after Member 4 verifies Horizons convention. Unknown visibility ≠ blocked.

## Member 4 next

1. Read Horizons docs; run one small lunar-surface observer query; save a redacted fixture.
2. Confirm `CENTER` / `SITE_COORD` / quantity codes.
3. Implement `horizons_client.py` and parser; keep stubs’ function signatures.
4. Do not enable terrain flags until CRS transform is verified.
5. Fill `backend/data/site_catalogue.json` coordinates only from documented sources; keep `verification_status`.

## Integration owner

Member 1 reviews contract changes, CORS/deploy env, RLS, and demo claims.
