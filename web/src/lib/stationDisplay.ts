import type { StationPing } from './types'
import { degToCompass, formatValue, ktsToMph } from './units'

export interface StationMetric {
  label: string
  value: string
}

export function waveDisplay(ping: StationPing): string {
  const period = ping.wave_period_sec ?? ping.swell_period_sec
  if (ping.wave_height_ft != null) {
    return `${formatValue(ping.wave_height_ft, ' ft @ ')}${formatValue(period, 's', 0)}`
  }
  if (ping.swell_height_ft != null) {
    const swellPeriod = ping.swell_period_sec ?? ping.wave_period_sec
    const periodSuffix = swellPeriod != null ? ` @ ${formatValue(swellPeriod, 's', 0)}` : ''
    return `${formatValue(ping.swell_height_ft, ' ft swell', 1)}${periodSuffix}`
  }
  return '—'
}

export function stationSubtitle(ping: StationPing): string {
  if (ping.station_type === 'nearshore_buoy') return 'Cape Canaveral Nearshore'
  if (ping.station_type === 'offshore_buoy') return '20nm E of Canaveral'
  if (ping.station_type === 'pier_met') return 'Trident Pier'
  return ping.station_name
}

function windDisplay(ping: StationPing): string {
  if (ping.wind_speed_kts == null) return '—'
  const mph = formatValue(ktsToMph(ping.wind_speed_kts), '', 1)
  const dir = degToCompass(ping.wind_direction_deg)
  return dir !== '—' ? `${mph} mph ${dir}` : `${mph} mph`
}

function buoyTempMetric(ping: StationPing): StationMetric {
  if (ping.water_temp_f != null) {
    return { label: 'Temp', value: formatValue(ping.water_temp_f, '°F', 1) }
  }
  if (ping.air_temp_f != null) {
    return { label: 'Air', value: formatValue(ping.air_temp_f, '°F', 1) }
  }
  if (ping.wind_speed_kts != null) {
    return { label: 'Wind', value: windDisplay(ping) }
  }
  return { label: 'Temp', value: '—' }
}

function pierTempMetric(ping: StationPing): StationMetric {
  if (ping.water_temp_f != null && ping.air_temp_f != null) {
    return {
      label: 'Water / Air',
      value: `${formatValue(ping.water_temp_f, '°F', 1)} / ${formatValue(ping.air_temp_f, '°F', 1)}`,
    }
  }
  if (ping.water_temp_f != null) {
    return { label: 'Water', value: formatValue(ping.water_temp_f, '°F', 1) }
  }
  if (ping.air_temp_f != null) {
    return { label: 'Air', value: formatValue(ping.air_temp_f, '°F', 1) }
  }
  if (ping.pressure_hpa != null) {
    return { label: 'Pressure', value: formatValue(ping.pressure_hpa, ' hPa', 0) }
  }
  return { label: 'Temp', value: '—' }
}

function pierPrimaryMetric(ping: StationPing): StationMetric {
  if (ping.wind_speed_kts != null) {
    return { label: 'Wind', value: windDisplay(ping) }
  }
  if (ping.pressure_hpa != null) {
    return { label: 'Pressure', value: formatValue(ping.pressure_hpa, ' hPa', 0) }
  }
  return { label: 'Wind', value: '—' }
}

export function stationMetrics(ping: StationPing): [StationMetric, StationMetric] {
  if (ping.station_type === 'pier_met') {
    return [pierPrimaryMetric(ping), pierTempMetric(ping)]
  }
  return [{ label: 'Wave', value: waveDisplay(ping) }, buoyTempMetric(ping)]
}

export function stationTooltipLines(ping: StationPing): string[] {
  if (ping.station_type === 'pier_met') {
    const lines: string[] = []
    if (ping.wind_speed_kts != null) lines.push(`Wind ${windDisplay(ping)}`)
    if (ping.water_temp_f != null) lines.push(`Water ${formatValue(ping.water_temp_f, '°F', 1)}`)
    if (ping.air_temp_f != null) lines.push(`Air ${formatValue(ping.air_temp_f, '°F', 1)}`)
    if (lines.length === 0 && ping.pressure_hpa != null) {
      lines.push(`Pressure ${formatValue(ping.pressure_hpa, ' hPa', 0)}`)
    }
    return lines.length > 0 ? lines : ['Met station — no recent readings']
  }

  const lines = [`Wave ${waveDisplay(ping)}`]
  const temp = buoyTempMetric(ping)
  if (temp.value !== '—') lines.push(`${temp.label} ${temp.value}`)
  return lines
}
