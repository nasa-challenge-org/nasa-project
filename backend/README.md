# LunarEdge API

FastAPI service. Scientific Horizons/LOLA adapters are stubs for Member 4.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
# Create .env from the repo-root .env.example (backend section). Do not commit .env.
uvicorn app.main:app --reload --port 8000
pytest
```

Uvicorn does **not** apply SQL. Run `supabase/migrations/` in the Supabase SQL editor first.

`GET /api/v1/health` includes `sites_source`: `supabase` or `json_fallback`.

`GET /api/v1/sites` reads `landing_sites` via the publishable key when configured, otherwise `data/site_catalogue.json`.

Production start (Render or similar):

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Health check path: `/api/v1/health`
