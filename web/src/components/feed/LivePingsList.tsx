import type { StationPing } from '../../lib/types'
import { stationMetrics, stationSubtitle } from '../../lib/stationDisplay'
import { formatTime } from '../../lib/units'

interface LivePingsListProps {
  pings: StationPing[]
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-sm md:gap-md">
        {pings.map((ping) => {
          const [primary, secondary] = stationMetrics(ping)
          return (
          <div
            key={ping.station_id}
            className="bg-surface-container-low rounded-xl p-md border border-outline-variant/30 flex flex-col"
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
                <span className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">{primary.label}</span>
                <span className="text-base text-on-surface">{primary.value}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">{secondary.label}</span>
                <span className="text-base text-on-surface">{secondary.value}</span>
              </div>
            </div>
          </div>
          )
        })}
      </div>
    </section>
  )
}
