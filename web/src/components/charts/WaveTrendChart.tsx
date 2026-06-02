import type { WaveTrendPoint } from '../../lib/types'
import { degToCompass, formatValue } from '../../lib/units'

interface WaveTrendChartProps {
  points: WaveTrendPoint[]
  pressureHpa?: number | null
  swellDirectionDeg?: number | null
}

function trendLabel(points: WaveTrendPoint[]): string {
  if (points.length < 2) return 'Insufficient Data'
  const first = points[0].wave_height_ft ?? 0
  const last = points[points.length - 1].wave_height_ft ?? 0
  const delta = last - first
  if (delta > 0.5) return 'Steady Climb'
  if (delta < -0.5) return 'Declining'
  return 'Holding Steady'
}

export function WaveTrendChart({ points, pressureHpa, swellDirectionDeg }: WaveTrendChartProps) {
  const heights = points.map((p) => p.wave_height_ft ?? 0)
  const max = Math.max(...heights, 1)

  return (
    <section className="md:px-0 mt-lg grid grid-cols-2 gap-md">
      <div className="col-span-2 bg-surface-container rounded-2xl p-md overflow-hidden relative min-h-[160px]">
        <div className="relative z-10">
          <h4 className="text-sm font-semibold tracking-wide text-on-surface-variant uppercase mb-unit">
            Wave Height Trend
          </h4>
          <p className="text-xl font-semibold text-on-surface">{trendLabel(points)}</p>
          <p className="text-xs text-on-surface-variant mt-1">Last 24h · Nearshore 41113</p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 flex items-end px-md gap-1">
          {heights.slice(-12).map((h, i) => (
            <div
              key={i}
              className="w-full bg-secondary-container rounded-t-sm transition-all"
              style={{
                height: `${Math.max(8, (h / max) * 100)}%`,
                opacity: 0.2 + (i / 12) * 0.8,
              }}
            />
          ))}
        </div>
      </div>
      <div className="bg-surface-container rounded-2xl p-md flex flex-col justify-between min-h-[100px]">
        <span className="material-symbols-outlined text-primary">explore</span>
        <div>
          <p className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">Swell Direction</p>
          <p className="text-base font-semibold">{degToCompass(swellDirectionDeg)}</p>
        </div>
      </div>
      <div className="bg-surface-container rounded-2xl p-md flex flex-col justify-between min-h-[100px]">
        <span className="material-symbols-outlined text-primary">compress</span>
        <div>
          <p className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">Pressure</p>
          <p className="text-base font-semibold">{formatValue(pressureHpa, ' hPa', 0)}</p>
        </div>
      </div>
    </section>
  )
}
