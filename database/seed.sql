-- ============================================================================
-- SURFDASH v2 — Seed data
-- ============================================================================

INSERT INTO stations (id, name, station_type, lat, lng) VALUES
    ('41009', 'Canaveral 20 NM East of Cape Canaveral, FL', 'offshore_buoy', 28.508, -80.185),
    ('41113', 'Cape Canaveral Nearshore, FL', 'nearshore_buoy', 28.400, -80.533),
    ('TRDF1', 'Trident Pier, Port Canaveral, FL', 'pier_met', 28.416, -80.593)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    station_type = EXCLUDED.station_type,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng;

INSERT INTO beaches (slug, name, lat, lng, display_order) VALUES
    ('cocoa-beach', 'Cocoa Beach', 28.3200, -80.6070, 1),
    ('melbourne-beach', 'Melbourne Beach', 28.0683, -80.5603, 2),
    ('satellite-beach', 'Satellite Beach', 28.1761, -80.5901, 3),
    ('indialantic', 'Indialantic', 28.0892, -80.5692, 4)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    display_order = EXCLUDED.display_order;

-- All Space Coast beaches share the same triangulation stations (MVP)
INSERT INTO beach_stations (beach_id, station_id, role)
SELECT b.id, s.id, s.role
FROM beaches b
CROSS JOIN (
    VALUES
        ('41009', 'offshore'),
        ('41113', 'nearshore'),
        ('TRDF1', 'met')
) AS s(id, role)
ON CONFLICT (beach_id, station_id) DO NOTHING;
