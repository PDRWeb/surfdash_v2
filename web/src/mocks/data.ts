import type { Beach, BeachForecast, BeachStatus, StationPing, WaveTrendPoint } from '../lib/types'

export const mockBeaches: Beach[] = [
  { id: 1, slug: 'cocoa-beach', name: 'Cocoa Beach', lat: 28.32, lng: -80.607, display_order: 1 },
  { id: 2, slug: 'melbourne-beach', name: 'Melbourne Beach', lat: 28.0683, lng: -80.5603, display_order: 2 },
  { id: 3, slug: 'satellite-beach', name: 'Satellite Beach', lat: 28.1761, lng: -80.5901, display_order: 3 },
  { id: 4, slug: 'indialantic', name: 'Indialantic', lat: 28.0892, lng: -80.5692, display_order: 4 },
]

export const mockBeachStatus: BeachStatus = {
  beach_id: 1,
  slug: 'cocoa-beach',
  name: 'Cocoa Beach',
  lat: 28.32,
  lng: -80.607,
  observed_at: new Date().toISOString(),
  wave_height_ft: 4.2,
  swell_period_sec: 8.0,
  swell_direction_deg: 101,
  wind_speed_kts: 12.4,
  wind_direction_deg: 45,
  air_temp_f: 78.3,
  water_temp_f: 76.4,
  nearshore_wave_ft: 4.2,
  offshore_swell_ft: 5.8,
  offshore_swell_period_sec: 10.0,
  offshore_swell_direction_deg: 90,
  pressure_hpa: 1012,
  visibility_nm: null,
  total_score: 62,
  rating: 'GOOD',
  status_label: 'HEAVY SWELL',
  updated_at: new Date().toISOString(),
}

export const mockStationPings: StationPing[] = [
  {
    station_id: '41113',
    station_name: 'Cape Canaveral Nearshore, FL',
    station_type: 'nearshore_buoy',
    lat: 28.4,
    lng: -80.533,
    observed_at: new Date().toISOString(),
    wave_height_ft: 4.2,
    wave_period_sec: 8,
    water_temp_f: 76.4,
    wind_speed_kts: null,
    wind_direction_deg: null,
    air_temp_f: null,
    pressure_hpa: null,
    visibility_nm: null,
    swell_height_ft: 0.3,
    swell_period_sec: 13.3,
  },
  {
    station_id: '41009',
    station_name: 'Canaveral 20 NM East of Cape Canaveral, FL',
    station_type: 'offshore_buoy',
    lat: 28.508,
    lng: -80.185,
    observed_at: new Date(Date.now() - 120000).toISOString(),
    wave_height_ft: 5.8,
    wave_period_sec: 10,
    water_temp_f: null,
    wind_speed_kts: 11.7,
    wind_direction_deg: 190,
    air_temp_f: 79.9,
    pressure_hpa: 1013,
    visibility_nm: null,
    swell_height_ft: 1.3,
    swell_period_sec: 6.7,
  },
  {
    station_id: 'TRDF1',
    station_name: 'Trident Pier, Port Canaveral, FL',
    station_type: 'pier_met',
    lat: 28.416,
    lng: -80.593,
    observed_at: new Date(Date.now() - 300000).toISOString(),
    wave_height_ft: null,
    wave_period_sec: null,
    water_temp_f: 77.1,
    wind_speed_kts: 5.1,
    wind_direction_deg: 320,
    air_temp_f: 78.2,
    pressure_hpa: 1016,
    visibility_nm: null,
    swell_height_ft: null,
    swell_period_sec: null,
  },
]

export const mockWaveTrend: WaveTrendPoint[] = Array.from({ length: 24 }, (_, i) => ({
  station_id: '41113',
  observed_at: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  wave_height_ft: 2.5 + Math.sin(i / 3) * 1.2 + i * 0.08,
  wave_period_sec: 7 + (i % 4),
}))

export function getMockForecastForSlug(slug: string): BeachForecast[] {
  const beach = mockBeaches.find((b) => b.slug === slug) ?? mockBeaches[0]
  return [1, 2, 3, 4].map((h) => ({
    slug: beach.slug,
    beach_name: beach.name,
    forecast_hour: new Date(Date.now() + h * 3600000).toISOString(),
    wave_height_ft: 4.2 + h * 0.2,
    swell_period_sec: 8,
    wind_speed_kts: 12,
    rating: 'GOOD',
    status_label: 'ACTIVE',
  }))
}

/** @deprecated Use getMockForecastForSlug */
export const mockForecast = getMockForecastForSlug('cocoa-beach')

export const mockStations = [
  { station_id: '41009', name: 'Canaveral 20 NM East', lat: 28.508, lng: -80.185, station_type: 'offshore_buoy' },
  { station_id: '41113', name: 'Cape Canaveral Nearshore', lat: 28.4, lng: -80.533, station_type: 'nearshore_buoy' },
  { station_id: 'TRDF1', name: 'Trident Pier', lat: 28.416, lng: -80.593, station_type: 'pier_met' },
]

export function getMockStatusForSlug(slug: string): BeachStatus {
  const beach = mockBeaches.find((b) => b.slug === slug) ?? mockBeaches[0]
  return { ...mockBeachStatus, slug: beach.slug, name: beach.name, beach_id: beach.id, lat: beach.lat, lng: beach.lng }
}
