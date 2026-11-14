# Deployment

## Frontend (Vercel)

- Root directory: `frontend`
- Framework: Next.js
- Environment:
  - `NEXT_PUBLIC_API_BASE_URL` = `https://<backend-host>/api/v1`
  - `NEXT_PUBLIC_SUPABASE_URL` = publishable URL or empty
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key or empty
  - Do **not** set the service-role key here

## Backend (Render, Fly, or other Python host)

- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Working directory: `backend`
- Health check: `GET /api/v1/health` (expect `status: ok`)
- Environment:
  - `APP_ENV=production`
  - `CORS_ORIGINS=https://<vercel-app>.vercel.app` (comma-separated; no `*`)
  - `HORIZONS_BASE_URL=https://ssd.jpl.nasa.gov/api/horizons.api`
  - `DATA_DIR` on persistent disk if cache is used
  - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` only if persistence is enabled (server-side)

After the Vercel URL exists, add it to `CORS_ORIGINS` and redeploy the API. Local default is `http://localhost:3000` only.

## Supabase

Apply `supabase/migrations/` in the SQL editor or CLI. Confirm RLS is enabled. Anon key in the browser; service role only on the backend.

## Smoke checks after deploy

1. `curl https://<api>/api/v1/health`
2. `curl https://<api>/api/v1/sites`
3. Open the Vercel app; health badge should be live.
4. Confirm browser network calls go to the production API, not localhost.
