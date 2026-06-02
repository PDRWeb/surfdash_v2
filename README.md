# SurfDash v2

Real-time surf conditions dashboard for Melbourne / Space Coast, FL beaches. Data is pulled hourly from NOAA NDBC buoys and Trident Pier, triangulated per beach, stored in Supabase, and displayed in a mobile-first React UI.

## Architecture

```
NOAA NDBC (41009, 41113, TRDF1) → GitHub Actions (hourly) → Supabase Postgres → Cloudflare Pages UI
```

- **41009** — offshore swell context
- **41113** — nearshore breaking conditions
- **TRDF1** — pier-level air temp, wind, pressure, visibility

## Repository layout

| Path | Purpose |
|------|---------|
| [`database/`](database/) | Schema, seed data, views, RLS |
| [`pipeline/`](pipeline/) | Python ETL (fetch, triangulate, score, forecast) |
| [`web/`](web/) | Vite + React + Tailwind dashboard |
| [`.github/workflows/`](.github/workflows/) | Hourly pipeline cron |

## Quick start

### 1. Supabase

Run in the Supabase SQL editor (in order):

1. [`database/schema.sql`](database/schema.sql)
2. [`database/seed.sql`](database/seed.sql)
3. [`database/views.sql`](database/views.sql)

Enable **API access** for views `beach_status_ui`, `station_latest_ui`, `wave_trend_ui`, `beaches_ui`, `beach_forecast_ui` (Supabase exposes tables/views in the public schema automatically).

### 2. Pipeline (local)

```bash
cd pipeline
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
set DATABASE_URL=postgresql://...
python run_pipeline.py
```

### 3. Pipeline (GitHub Actions)

Add repository secret:

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | Supabase Postgres URI (Project Settings → Database → Connection string → URI). Use the **Session pooler** string with your database password. |

Workflow: [`.github/workflows/hourly-pipeline.yml`](.github/workflows/hourly-pipeline.yml) — runs hourly and supports manual **workflow_dispatch** triggers.

### 4. Web UI (local)

```bash
cd web
cp .env.example .env.local      # fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Without env vars, the UI falls back to mock data in `web/src/mocks/`.

### 5. Cloudflare Pages

| Setting | Value |
|---------|-------|
| Root directory | `web` |
| Build command | `npm ci && npm run build` |
| Output directory | `dist` |
| Environment variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

The anon key is safe in the browser — RLS allows public read only; pipeline writes use `DATABASE_URL` via GitHub Actions.

After deploy, confirm the dashboard loads live data (not mocks) by checking that env vars are set in Cloudflare Pages → Settings → Environment variables.

## Beaches (MVP)

Cocoa Beach, Melbourne Beach, Satellite Beach, Indialantic — all triangulated from 41009 + 41113 + TRDF1.

## License

MIT
