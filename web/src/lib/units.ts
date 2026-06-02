const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

export function degToCompass(deg: number | null | undefined): string {
  if (deg == null) return '—'
  const index = Math.round(deg / 22.5) % 16
  return COMPASS[index]
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/New_York',
  })
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—'
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'JUST NOW'
  if (mins < 60) return `${mins}M AGO`
  const hrs = Math.floor(mins / 60)
  return `${hrs}H AGO`
}

export function formatForecastHour(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
    timeZone: 'America/New_York',
  })
}

export function formatValue(value: number | null | undefined, suffix = '', digits = 1): string {
  if (value == null) return '—'
  return `${value.toFixed(digits)}${suffix}`
}

export function windLabel(windDir: number | null, swellDir: number | null): string {
  if (windDir == null) return '—'
  const compass = degToCompass(windDir)
  if (swellDir == null) return compass
  const diff = Math.abs(((windDir - swellDir + 180) % 360) - 180)
  if (diff < 45) return `ONSHORE ${compass}`
  if (diff > 135) return `OFFSHORE ${compass}`
  return `CROSS ${compass}`
}
