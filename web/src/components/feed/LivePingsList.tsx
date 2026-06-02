import type { StationPing } from '../../lib/types'
import { formatTime, formatValue } from '../../lib/units'

interface LivePingsListProps {
  pings: StationPing[]
}

function waveDisplay(ping: StationPing): string {
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

function stationSubtitle(ping: StationPing): string {
  if (ping.station_type === 'nearshore_buoy') return 'Cape Canaveral Nearshore'
  if (ping.station_type === 'offshore_buoy') return '20nm E of Canaveral'
  if (ping.station_type === 'pier_met') return 'Trident Pier'
  return ping.station_name
}

export function LivePingsList({ pings }: LivePingsListProps) {
  return (
    <section className="md:px-0">
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-base font-semibold text-on-surface flex items-center gap-sm">
          <span className="w-2 h-2 rounded-full bg-secondary-container" />
          Live Buoy Pings
        </h3>
        <span className="text-xs font-medium tracking-wide text-on-surface-variant bg-surface-container-high px-sm py-xs rounded">
          {pings.length} ACTIVE
        </span>
      </div>
      <div className="space-y-sm">
        {pings.map((ping) => (
          <div
            key={ping.station_id}
            className="bg-surface-container-low rounded-xl p-md border border-outline-variant/30"
          >
            <div className="flex justify-between items-start mb-sm">
              <div className="flex flex-col">
                <span className="text-xs font-medium tracking-wide text-on-primary-container uppercase">
                  Station #{ping.station_id}
                </span>
                <span className="text-base font-semibold">{stationSubtitle(ping)}</span>
              </div>
              <span className="text-sm font-medium text-secondary-container">{formatTime(ping.observed_at)}</span>
            </div>
            <div className="grid grid-cols-2 gap-md py-sm border-t border-outline-variant/20">
              <div className="flex flex-col">
                <span className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">Wave</span>
                <span className="text-base text-on-surface">{waveDisplay(ping)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">
                  {ping.air_temp_f != null ? 'Air / Temp' : 'Temp'}
                </span>
                <span className="text-base text-on-surface">
                  {ping.water_temp_f != null
                    ? `${formatValue(ping.water_temp_f, '°F', 1)}`
                    : ping.air_temp_f != null
                      ? `${formatValue(ping.air_temp_f, '°F', 1)}`
                      : ping.wind_speed_kts != null
                        ? `${formatValue(ping.wind_speed_kts, ' kts', 1)}`
                        : '—'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
