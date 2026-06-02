export type DataSource = 'live' | 'mock'

export interface QueryResult<T> {
  data: T
  source: DataSource
}

export interface Beach {
  id: number
  slug: string
  name: string
  lat: number
  lng: number
  display_order: number
}

export interface BeachStatus {
  beach_id: number
  slug: string
  name: string
  lat: number
  lng: number
  observed_at: string
  wave_height_ft: number | null
  swell_period_sec: number | null
  swell_direction_deg: number | null
  wind_speed_kts: number | null
  wind_direction_deg: number | null
  air_temp_f: number | null
  water_temp_f: number | null
  nearshore_wave_ft: number | null
  offshore_swell_ft: number | null
  offshore_swell_period_sec: number | null
  offshore_swell_direction_deg: number | null
  pressure_hpa: number | null
  visibility_nm: number | null
  total_score: number | null
  rating: string | null
  status_label: string | null
  updated_at: string
}

export interface StationPing {
  station_id: string
  station_name: string
  station_type: string
  lat: number
  lng: number
  observed_at: string
  wave_height_ft: number | null
  wave_period_sec: number | null
  water_temp_f: number | null
  wind_speed_kts: number | null
  wind_direction_deg: number | null
  air_temp_f: number | null
  pressure_hpa: number | null
  visibility_nm: number | null
  swell_height_ft: number | null
  swell_period_sec: number | null
}

export interface WaveTrendPoint {
  station_id: string
  observed_at: string
  wave_height_ft: number | null
  wave_period_sec: number | null
}

export interface BeachForecast {
  slug: string
  beach_name: string
  forecast_hour: string
  wave_height_ft: number | null
  swell_period_sec: number | null
  wind_speed_kts: number | null
  rating: string | null
  status_label: string | null
}

export interface StationMarker {
  station_id: string
  name: string
  lat: number
  lng: number
  station_type: string
}
