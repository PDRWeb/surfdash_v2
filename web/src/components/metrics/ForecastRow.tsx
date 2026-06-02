import type { BeachForecast } from '../../lib/types'
import { formatForecastHour, formatValue } from '../../lib/units'

interface ForecastRowProps {
  forecasts: BeachForecast[]
  isDemo?: boolean
}

function ratingClass(rating: string | null): string {
  switch (rating?.toUpperCase()) {
    case 'EPIC':
    case 'EXCELLENT':
      return 'text-secondary-container'
    case 'GOOD':
      return 'text-primary'
    case 'FAIR':
      return 'text-on-surface-variant'
    default:
      return 'text-outline'
  }
}

export function ForecastRow({ forecasts, isDemo = false }: ForecastRowProps) {
  return (
    <section className="md:px-0 mt-md">
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-base font-semibold text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-lg">schedule</span>
          Next Few Hours
        </h3>
        {isDemo && (
          <span className="text-xs font-medium tracking-wide text-on-surface-variant bg-surface-container-high px-sm py-xs rounded">
            DEMO
          </span>
        )}
      </div>

      {forecasts.length === 0 ? (
        <p className="text-sm text-on-surface-variant bg-surface-container-low rounded-xl p-md border border-outline-variant/30">
          Forecast will appear after the pipeline runs for this beach.
        </p>
      ) : (
        <div className="flex overflow-x-auto gap-md no-scrollbar pb-sm snap-x md:grid md:grid-cols-4 md:overflow-visible md:snap-none">
          {forecasts.map((row) => (
            <div
              key={row.forecast_hour}
              className="min-w-[160px] snap-center glass-card p-md rounded-xl md:min-w-0 flex flex-col gap-sm"
            >
              <p className="text-sm font-semibold text-on-surface">{formatForecastHour(row.forecast_hour)}</p>
              <div className="flex items-baseline gap-xs">
                <span className="text-xl font-bold text-on-surface">{formatValue(row.wave_height_ft, '', 1)}</span>
                <span className="text-xs text-on-surface-variant">ft</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                {formatValue(row.swell_period_sec, '', 0)}s · {formatValue(row.wind_speed_kts, '', 0)} kts
              </p>
              <p className={`text-xs font-medium tracking-wide uppercase ${ratingClass(row.rating)}`}>
                {row.status_label ?? row.rating ?? '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
