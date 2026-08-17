import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { StationPing } from '../../lib/types'

const stationIcon = L.divIcon({
  className: '',
  html: `<div class="flex items-center justify-center w-6 h-6">
    <div class="w-3 h-3 bg-primary rounded-full border border-white opacity-80"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

interface StationMarkersProps {
  stations: StationPing[]
  onHover: (stationId: string | null) => void
}

export function StationMarkers({ stations, onHover }: StationMarkersProps) {
  return (
    <>
      {stations.map((s) => (
        <Marker
          key={s.station_id}
          position={[s.lat, s.lng]}
          icon={stationIcon}
          eventHandlers={{
            mouseover: () => onHover(s.station_id),
            mouseout: () => onHover(null),
          }}
        >
          <Popup>
            {s.station_name} ({s.station_id})
          </Popup>
        </Marker>
      ))}
    </>
  )
}
