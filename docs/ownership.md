# File ownership

| Path | Owner |
| --- | --- |
| README.md, .gitignore, .env.example | Member 1 |
| docs/** | Member 1 |
| supabase/** | Member 1 |
| backend/app/main.py, backend/app/core/**, backend/app/api/v1/** | Member 1 (routes); Member 4 fills analysis science |
| backend/app/schemas/** | Member 1 (contract) |
| backend/app/services/site_catalogue.py, analysis_stub.py, compare.py | Member 1 |
| backend/app/services/horizons_client.py, ephemeris_parser.py, solar_metrics.py, terrain_loader.py, horizon_profile.py | Member 4 |
| backend/data/site_catalogue.json | Member 1 metadata; Member 4 verified coordinates |
| frontend/lib/types.ts, frontend/lib/api.ts | Member 1 |
| frontend/app/**, frontend/components/ui/**, frontend/components/charts/** | Member 2 |
| frontend/components/visualization/**, frontend/components/horizon/** | Member 3 |
| frontend/components/shared/** | Member 1 scaffold; Member 2 may extend |
