import { useMemo, useState } from 'react'
import { BeachPicker } from '../components/layout/BeachPicker'
import { BottomNav } from '../components/layout/BottomNav'
import { DemoDataBanner } from '../components/layout/DemoDataBanner'
import { Header } from '../components/layout/Header'
import { Sidebar } from '../components/layout/Sidebar'
import { LivePingsList } from '../components/feed/LivePingsList'
import { WaveTrendChart } from '../components/charts/WaveTrendChart'
import { LeafletMap } from '../components/map/LeafletMap'
import { ForecastRow } from '../components/metrics/ForecastRow'
import { MetricCarousel } from '../components/metrics/MetricCarousel'
import { useBeaches } from '../hooks/useBeaches'
import { useBeachForecast } from '../hooks/useBeachForecast'
import { useBeachStatus } from '../hooks/useBeachStatus'
import { useStationPings } from '../hooks/useStationPings'
import { useWaveTrend } from '../hooks/useWaveTrend'
import type { StationMarker } from '../lib/types'
import { isSupabaseConfigured } from '../lib/supabase'
import { mockStations } from '../mocks/data'

export function Dashboard() {
  const { data: beachesResult } = useBeaches()
  const [selectedSlug, setSelectedSlug] = useState('cocoa-beach')

  const beaches = beachesResult?.data ?? []
  const activeSlug = beaches.find((b) => b.slug === selectedSlug)?.slug ?? beaches[0]?.slug ?? selectedSlug
  const { data: statusResult, isLoading: statusLoading } = useBeachStatus(activeSlug)
  const { data: forecastResult } = useBeachForecast(activeSlug)
  const { data: pingsResult } = useStationPings()
  const { data: trendResult } = useWaveTrend('41113', 24)

  const status = statusResult?.data
  const forecasts = forecastResult?.data ?? []
  const pings = pingsResult?.data ?? []
  const trend = trendResult?.data ?? []

  const demoSections = [
    !isSupabaseConfigured && 'all sections',
    beachesResult?.source === 'mock' && 'beach list',
    statusResult?.source === 'mock' && 'beach conditions',
    forecastResult?.source === 'mock' && 'forecast',
    pingsResult?.source === 'mock' && 'buoy pings',
    trendResult?.source === 'mock' && 'wave trend',
  ].filter(Boolean) as string[]

  const stationMarkers: StationMarker[] = useMemo(
    () =>
      pings.length > 0
        ? pings.map((p) => ({
            station_id: p.station_id,
            name: p.station_name,
            lat: p.lat,
            lng: p.lng,
            station_type: p.station_type,
          }))
        : mockStations,
    [pings],
  )

  const beachList = beaches.map((b) => ({ slug: b.slug, name: b.name }))

  if (statusLoading || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface-variant">
        Loading conditions…
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:ml-64">
      <Sidebar selectedSlug={activeSlug} onSelectBeach={setSelectedSlug} beaches={beachList} />
      <Header beachName={status.name} />

      <main className="flex flex-col">
        <div className="md:hidden px-margin-mobile pt-md pb-sm">
          <BeachPicker beaches={beachList} selectedSlug={activeSlug} onSelect={setSelectedSlug} />
        </div>

        {demoSections.length > 0 && (
          <div className="px-margin-mobile md:px-margin-desktop md:max-w-[1600px] md:mx-auto md:w-full mt-md">
            <DemoDataBanner sections={demoSections} />
          </div>
        )}

        <section className="relative h-[353px] w-full overflow-hidden md:h-[420px] md:rounded-xl md:mx-margin-desktop md:mt-lg md:w-[calc(100%-64px)]">
          <LeafletMap
            status={status}
            stations={stationMarkers}
            isDemo={statusResult?.source === 'mock'}
            className="absolute inset-0"
          />
        </section>

        <div className="relative z-20 -mt-6 px-margin-mobile md:px-margin-desktop md:mt-0 md:max-w-[1600px] md:mx-auto md:w-full">
          <MetricCarousel status={status} />
          <ForecastRow forecasts={forecasts} isDemo={forecastResult?.source === 'mock'} />
        </div>

        <div className="px-margin-mobile md:px-margin-desktop md:max-w-[1600px] md:mx-auto md:w-full md:space-y-lg mt-lg">
          <LivePingsList pings={pings} />
          <WaveTrendChart
            points={trend}
            pressureHpa={status.pressure_hpa}
            swellDirectionDeg={status.swell_direction_deg}
          />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
