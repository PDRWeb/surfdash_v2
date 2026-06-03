import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMinuteTick } from '../../hooks/useMinuteTick'
import { useTheme } from '../../hooks/useTheme'
import type { BeachStatus, StationMarker } from '../../lib/types'
import { formatRelative } from '../../lib/units'
import { StatusInfoTooltip } from './StatusInfoTooltip'
import 'leaflet/dist/leaflet.css'

const beachIcon = L.divIcon({
  className: '',
  html: `<div class="relative flex items-center justify-center">
    <div class="w-4 h-4 bg-secondary-container rounded-full z-20 shadow-[0_0_15px_rgba(254,107,0,0.8)] border-2 border-white"></div>
    <div class="absolute w-12 h-12 border-2 border-secondary-container rounded-full ping-pulse opacity-40"></div>
  </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
})

const stationIcon = L.divIcon({
  className: '',
  html: `<div class="w-3 h-3 bg-primary rounded-full border border-white opacity-80"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map])
  return null
}

function MapInvalidateSize() {
  const map = useMap()
  useEffect(() => {
    const fixSize = () => map.invalidateSize()
    const timer = window.setTimeout(fixSize, 0)
    window.addEventListener('resize', fixSize)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', fixSize)
    }
  }, [map])
  return null
}

interface LeafletMapProps {
  status: BeachStatus
  stations: StationMarker[]
  isDemo?: boolean
  className?: string
}

export function LeafletMap({ status, stations, isDemo = false, className = '' }: LeafletMapProps) {
  useMinuteTick()
  const { theme } = useTheme()
  const center: [number, number] = [status.lat, status.lng]
  const updatedLabel = formatRelative(status.observed_at)
  const statusLabel = status.status_label ?? status.rating ?? 'ACTIVE'
  const mapTiles =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  return (
    <div className={`relative h-full w-full ${className}`}>
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={false}
        className="h-full w-full min-h-[353px] md:min-h-[420px]"
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url={mapTiles}
        />
        <MapInvalidateSize />
        <MapRecenter lat={status.lat} lng={status.lng} />
        <Marker position={[status.lat, status.lng]} icon={beachIcon}>
          <Popup>{status.name}</Popup>
        </Marker>
        {stations.map((s) => (
          <Marker key={s.station_id} position={[s.lat, s.lng]} icon={stationIcon}>
            <Popup>
              {s.name} ({s.station_id})
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="absolute inset-x-0 bottom-0 h-1/2 map-gradient-overlay pointer-events-none z-[400]" />
      <div className="absolute inset-0 z-[500] p-margin-mobile flex flex-col justify-between pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="glass-card px-md py-sm rounded-xl pointer-events-auto">
            <p className="text-xs font-medium tracking-wide text-on-primary-container uppercase">Current Status</p>
            <div className="flex items-center gap-xs">
              <p className="text-base font-semibold text-secondary-container">
                {isDemo && <span className="text-xs font-bold text-on-surface-variant mr-1">DEMO ·</span>}
                {statusLabel}
              </p>
              <StatusInfoTooltip label={statusLabel} />
            </div>
            <p className="text-xs font-medium tracking-wide text-on-surface-variant mt-xs">
              Updated {updatedLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
