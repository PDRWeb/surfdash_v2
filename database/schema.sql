-- ============================================================================
-- SURFDASH v2 — Core schema
-- ============================================================================

-- Stations (NOAA buoys + pier)
CREATE TABLE IF NOT EXISTS stations (
    id VARCHAR(20) PRIMARY KEY,
    name TEXT NOT NULL,
    station_type VARCHAR(30) NOT NULL CHECK (station_type IN ('offshore_buoy', 'nearshore_buoy', 'pier_met')),
    lat DECIMAL(9, 6) NOT NULL,
    lng DECIMAL(9, 6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Named beaches (first-class entities)
CREATE TABLE IF NOT EXISTS beaches (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    lat DECIMAL(9, 6) NOT NULL,
    lng DECIMAL(9, 6) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Beach ↔ station roles for triangulation
CREATE TABLE IF NOT EXISTS beach_stations (
    beach_id INTEGER NOT NULL REFERENCES beaches(id) ON DELETE CASCADE,
    station_id VARCHAR(20) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('offshore', 'nearshore', 'met')),
    PRIMARY KEY (beach_id, station_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_beach_stations_role ON beach_stations (beach_id, role);

-- Raw hourly station observations (7-day retention)
CREATE TABLE IF NOT EXISTS station_observations (
    id SERIAL PRIMARY KEY,
    station_id VARCHAR(20) NOT NULL REFERENCES stations(id),
    observed_at TIMESTAMPTZ NOT NULL,
    wave_height_m DECIMAL(6, 2),
    wave_period_sec DECIMAL(5, 2),
    wave_direction_deg DECIMAL(5, 2),
    swell_height_m DECIMAL(6, 2),
    swell_period_sec DECIMAL(5, 2),
    swell_direction_deg DECIMAL(5, 2),
    wind_wave_height_m DECIMAL(6, 2),
    wind_wave_period_sec DECIMAL(5, 2),
    wind_speed_ms DECIMAL(6, 2),
    wind_direction_deg DECIMAL(5, 2),
    wind_gust_ms DECIMAL(6, 2),
    air_temp_c DECIMAL(5, 2),
    water_temp_c DECIMAL(5, 2),
    pressure_hpa DECIMAL(7, 2),
    visibility_nm DECIMAL(5, 2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_station_observation UNIQUE (station_id, observed_at)
);

CREATE INDEX IF NOT EXISTS idx_station_observations_station_time
    ON station_observations (station_id, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_station_observations_time
    ON station_observations (observed_at DESC);

-- Triangulated latest status per beach (UI primary read)
CREATE TABLE IF NOT EXISTS beach_status (
    beach_id INTEGER PRIMARY KEY REFERENCES beaches(id) ON DELETE CASCADE,
    observed_at TIMESTAMPTZ NOT NULL,
    wave_height_ft DECIMAL(6, 2),
    swell_period_sec DECIMAL(5, 2),
    swell_direction_deg DECIMAL(5, 2),
    wind_speed_kts DECIMAL(6, 2),
    wind_direction_deg DECIMAL(5, 2),
    air_temp_f DECIMAL(5, 2),
    water_temp_f DECIMAL(5, 2),
    nearshore_wave_ft DECIMAL(6, 2),
    offshore_swell_ft DECIMAL(6, 2),
    offshore_swell_period_sec DECIMAL(5, 2),
    offshore_swell_direction_deg DECIMAL(5, 2),
    pressure_hpa DECIMAL(7, 2),
    visibility_nm DECIMAL(5, 2),
    total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
    rating VARCHAR(20),
    status_label VARCHAR(40),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4-hour daytime forecast per beach
CREATE TABLE IF NOT EXISTS beach_forecast (
    id SERIAL PRIMARY KEY,
    beach_id INTEGER NOT NULL REFERENCES beaches(id) ON DELETE CASCADE,
    forecast_hour TIMESTAMPTZ NOT NULL,
    wave_height_ft DECIMAL(6, 2),
    swell_period_sec DECIMAL(5, 2),
    wind_speed_kts DECIMAL(6, 2),
    rating VARCHAR(20),
    status_label VARCHAR(40),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_beach_forecast_hour UNIQUE (beach_id, forecast_hour)
);

CREATE INDEX IF NOT EXISTS idx_beach_forecast_beach
    ON beach_forecast (beach_id, forecast_hour ASC);

-- ============================================================================
-- Row Level Security — public read-only for anon
-- ============================================================================

ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE beaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE beach_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE beach_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE beach_forecast ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read stations" ON stations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read beaches" ON beaches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read beach_stations" ON beach_stations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read station_observations" ON station_observations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read beach_status" ON beach_status FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read beach_forecast" ON beach_forecast FOR SELECT TO anon, authenticated USING (true);

-- Service role bypasses RLS for pipeline writes
