import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMap } from 'react-leaflet'
import { stationSubtitle, stationTooltipLines } from '../../lib/stationDisplay'
import type { StationPing } from '../../lib/types'

interface MapStationTooltipProps {
  station: StationPing | null
}

export function MapStationTooltip({ station }: MapStationTooltipProps) {
  const map = useMap()
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setContainer(map.getContainer().parentElement)
  }, [map])

  useEffect(() => {
    if (!station) return

    const update = () => {
      const point = map.latLngToContainerPoint([station.lat, station.lng])
      setPos({ x: point.x, y: point.y })
    }

    update()
    map.on('move zoom moveend zoomend resize', update)
    return () => {
      map.off('move zoom moveend zoomend resize', update)
    }
  }, [station, map])

  if (!station || !container) return null

  return createPortal(
    <div
      className="station-hover-tooltip pointer-events-none absolute"
      style={{
        left: pos.x,
        top: pos.y - 14,
        transform: 'translate(-50%, -100%)',
        zIndex: 20,
      }}
    >
      <span className="block font-semibold">{stationSubtitle(station)}</span>
      <span className="block opacity-70">#{station.station_id}</span>
      {stationTooltipLines(station).map((line) => (
        <span key={line} className="block mt-1 font-medium text-secondary-container">
          {line}
        </span>
      ))}
    </div>,
    container,
  )
}
