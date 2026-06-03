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

interface ForecastCardProps {
  row: BeachForecast
}

function ForecastCard({ row }: ForecastCardProps) {
  const label = row.status_label ?? row.rating ?? '—'
  const meta = `${formatValue(row.swell_period_sec, '', 0)}s · ${formatValue(row.wind_speed_kts, '', 0)} kts`

  return (
    <div className="glass-card p-sm rounded-lg md:p-md md:rounded-xl md:flex md:flex-col md:gap-sm">
      <div className="flex items-center justify-between gap-sm md:block">
        <p className="text-xs md:text-sm font-semibold text-on-surface shrink-0">
          {formatForecastHour(row.forecast_hour)}
        </p>
        <div className="flex items-baseline gap-xs shrink-0 md:mt-0">
          <span className="text-lg md:text-xl font-bold text-on-surface">
            {formatValue(row.wave_height_ft, '', 1)}
          </span>
          <span className="text-xs text-on-surface-variant">ft</span>
        </div>
      </div>
      <p className="mt-xs md:mt-0 text-[10px] md:text-xs text-on-surface-variant">{meta}</p>
      <p
        className={`text-[10px] md:text-xs font-medium tracking-wide uppercase ${ratingClass(row.rating)} md:mt-0`}
      >
        {label}
      </p>
    </div>
  )
}

export function ForecastRow({ forecasts, isDemo = false }: ForecastRowProps) {
  return (
    <section className="md:px-0 mt-md">
      <div className="flex items-center justify-between mb-sm md:mb-md">
        <h3 className="text-sm md:text-base font-semibold text-on-surface flex items-center gap-sm">
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
        <div className="flex flex-col gap-sm md:grid md:grid-cols-4 md:gap-md">
          {forecasts.map((row) => (
            <ForecastCard key={row.forecast_hour} row={row} />
          ))}
        </div>
      )}
    </section>
  )
}
