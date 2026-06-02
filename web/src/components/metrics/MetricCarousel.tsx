import type { BeachStatus } from '../../lib/types'
import { formatValue, windLabel } from '../../lib/units'

interface MetricCarouselProps {
  status: BeachStatus
}

interface MetricCardProps {
  icon: string
  label: string
  value: string
  unit: string
  subtitle: string
  subtitleClass?: string
  accent?: string
  filledIcon?: boolean
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  subtitle,
  subtitleClass = 'text-on-surface-variant',
  accent = 'text-secondary-container',
  filledIcon = false,
}: MetricCardProps) {
  return (
    <div className="min-w-[240px] snap-center glass-card p-md rounded-xl md:min-w-0">
      <div className="flex items-center gap-sm mb-sm">
        <span
          className={`material-symbols-outlined ${accent}`}
          style={filledIcon ? { fontVariationSettings: '"FILL" 1' } : undefined}
        >
          {icon}
        </span>
        <span className="text-sm font-semibold tracking-wide text-on-surface-variant uppercase">{label}</span>
      </div>
      <div className="flex items-baseline gap-xs">
        <span className="text-2xl font-bold text-on-surface">{value}</span>
        <span className="text-sm text-on-surface-variant">{unit}</span>
      </div>
      <div className={`mt-sm flex items-center gap-xs text-xs font-medium tracking-wide uppercase ${subtitleClass}`}>
        <span>{subtitle}</span>
      </div>
    </div>
  )
}

export function MetricCarousel({ status }: MetricCarouselProps) {
  const waveSubtitle =
    status.offshore_swell_ft != null
      ? `OFFSHORE ${formatValue(status.offshore_swell_ft, ' ft @ ')}${formatValue(status.offshore_swell_period_sec, 's', 0)}`
      : 'NEARSHORE READING'

  return (
    <section className="md:px-0">
      <div className="flex overflow-x-auto gap-md no-scrollbar pb-md snap-x md:grid md:grid-cols-4 md:overflow-visible md:snap-none">
          <MetricCard
            icon="tsunami"
            label="Wave Height"
            value={formatValue(status.wave_height_ft, '', 1)}
            unit="ft"
            subtitle={waveSubtitle}
            subtitleClass="text-secondary-container"
            accent="text-secondary-container"
            filledIcon
          />
          <MetricCard
            icon="air"
            label="Wind Speed"
            value={formatValue(status.wind_speed_kts, '', 1)}
            unit="kts"
            subtitle={windLabel(status.wind_direction_deg, status.swell_direction_deg)}
            subtitleClass="text-on-tertiary-container"
            accent="text-primary"
          />
          <MetricCard
            icon="timer"
            label="Swell Period"
            value={formatValue(status.swell_period_sec, '', 1)}
            unit="sec"
            subtitle={`NEARSHORE ${formatValue(status.nearshore_wave_ft, ' ft', 1)}`}
            subtitleClass="text-primary"
            accent="text-primary"
          />
          <MetricCard
            icon="device_thermostat"
            label="Water Temp"
            value={formatValue(status.water_temp_f, '', 1)}
            unit="°F"
            subtitle={`AIR ${formatValue(status.air_temp_f, '°F', 1)}`}
            subtitleClass="text-outline"
            accent="text-primary-fixed"
          />
        </div>
      </section>
  )
}
