-- ============================================================================
-- SURFDASH v2 — UI views (anon reads these via PostgREST)
-- ============================================================================

CREATE OR REPLACE VIEW beaches_ui AS
SELECT id, slug, name, lat, lng, display_order
FROM beaches
ORDER BY display_order;

CREATE OR REPLACE VIEW beach_status_ui AS
SELECT
    b.id AS beach_id,
    b.slug,
    b.name,
    b.lat,
    b.lng,
    bs.observed_at,
    bs.wave_height_ft,
    bs.swell_period_sec,
    bs.swell_direction_deg,
    bs.wind_speed_kts,
    bs.wind_direction_deg,
    bs.air_temp_f,
    bs.water_temp_f,
    bs.nearshore_wave_ft,
    bs.offshore_swell_ft,
    bs.offshore_swell_period_sec,
    bs.offshore_swell_direction_deg,
    bs.pressure_hpa,
    bs.visibility_nm,
    bs.total_score,
    bs.rating,
    bs.status_label,
    bs.updated_at
FROM beach_status bs
JOIN beaches b ON b.id = bs.beach_id;

CREATE OR REPLACE VIEW station_latest_ui AS
SELECT DISTINCT ON (so.station_id)
    so.station_id,
    s.name AS station_name,
    s.station_type,
    s.lat,
    s.lng,
    so.observed_at,
    ROUND(so.wave_height_m * 3.28084, 1) AS wave_height_ft,
    so.wave_period_sec,
    ROUND((so.water_temp_c * 9.0 / 5.0) + 32, 1) AS water_temp_f,
    ROUND(so.wind_speed_ms * 1.94384, 1) AS wind_speed_kts,
    so.wind_direction_deg,
    ROUND((so.air_temp_c * 9.0 / 5.0) + 32, 1) AS air_temp_f,
    so.pressure_hpa,
    so.visibility_nm,
    ROUND(so.swell_height_m * 3.28084, 1) AS swell_height_ft,
    so.swell_period_sec
FROM station_observations so
JOIN stations s ON s.id = so.station_id
ORDER BY so.station_id, so.observed_at DESC;

CREATE OR REPLACE VIEW wave_trend_ui AS
SELECT
    station_id,
    observed_at,
    ROUND(wave_height_m * 3.28084, 1) AS wave_height_ft,
    wave_period_sec
FROM station_observations
WHERE observed_at >= NOW() - INTERVAL '7 days'
ORDER BY station_id, observed_at ASC;

CREATE OR REPLACE VIEW beach_forecast_ui AS
SELECT
    b.slug,
    b.name AS beach_name,
    bf.forecast_hour,
    bf.wave_height_ft,
    bf.swell_period_sec,
    bf.wind_speed_kts,
    bf.rating,
    bf.status_label
FROM beach_forecast bf
JOIN beaches b ON b.id = bf.beach_id
ORDER BY b.slug, bf.forecast_hour ASC;

-- Grant select on views to anon (views inherit from base table RLS in Supabase)
GRANT SELECT ON beaches_ui TO anon, authenticated;
GRANT SELECT ON beach_status_ui TO anon, authenticated;
GRANT SELECT ON station_latest_ui TO anon, authenticated;
GRANT SELECT ON wave_trend_ui TO anon, authenticated;
GRANT SELECT ON beach_forecast_ui TO anon, authenticated;
