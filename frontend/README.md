# LunarEdge frontend

```bash
# Create .env.local from the repo-root .env.example (NEXT_PUBLIC_* only).
# Never put the database password or service-role key here.
npm install
npm run dev
```

Browser-safe env:

- `NEXT_PUBLIC_API_BASE_URL` — FastAPI, e.g. `http://localhost:8000/api/v1`
- `NEXT_PUBLIC_SUPABASE_URL` — project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — publishable key

Do not put `SUPABASE_DATABASE_URL` or the service-role key here.

Shared contract: `lib/types.ts`. API client: `lib/api.ts` (Member 1). Screens: Member 2. Visualization: Member 3.
