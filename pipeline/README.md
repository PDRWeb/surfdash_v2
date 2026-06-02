# SurfDash Pipeline

Hourly ETL that pulls NOAA NDBC data for the Space Coast and writes triangulated beach conditions to Supabase.

## Stations

| ID | Role | Source |
|----|------|--------|
| 41009 | Offshore swell | NDBC discus buoy |
| 41113 | Nearshore waves | CDIP nearshore waverider |
| TRDF1 | Beach weather | Trident Pier CO-OPS |

## Triangulation rules

- **Wave height** — from 41113 (nearshore)
- **Swell context** — from 41009 (offshore)
- **Wind, air temp, pressure, visibility** — from TRDF1 (pier)

Each beach gets the same triangulated values in MVP (all beaches share the three stations).

## Run locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
set DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
python run_pipeline.py
```

Use the **Session pooler** connection string from Supabase with the database password. For GitHub Actions, store `DATABASE_URL` as a repository secret.

## Schedule

GitHub Actions runs `run_pipeline.py` every hour. See [`.github/workflows/hourly-pipeline.yml`](../.github/workflows/hourly-pipeline.yml).

## Data retention

Observations older than 7 days are deleted each run.
