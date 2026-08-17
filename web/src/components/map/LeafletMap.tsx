import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { useMinuteTick } from '../../hooks/useMinuteTick'
import { useTheme } from '../../hooks/useTheme'
import type { BeachStatus, StationPing } from '../../lib/types'
import { formatRelative } from '../../lib/units'
import { MapStationTooltip } from './MapStationTooltip'
import { StationMarkers } from './StationMarkers'
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
  stations: StationPing[]
  isDemo?: boolean
  className?: string
}

export function LeafletMap({ status, stations, isDemo = false, className = '' }: LeafletMapProps) {
  useMinuteTick()
  const { theme } = useTheme()
  const [hoveredStationId, setHoveredStationId] = useState<string | null>(null)
  const center: [number, number] = [status.lat, status.lng]
  const updatedLabel = formatRelative(status.observed_at)
  const statusLabel = status.status_label ?? status.rating ?? 'ACTIVE'
  const hoveredStation = stations.find((s) => s.station_id === hoveredStationId) ?? null
  const mapTiles =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  return (
    <div className={`relative isolate h-full w-full ${className}`}>
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={false}
        className="relative z-0 h-full w-full min-h-[353px] md:min-h-[420px]"
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url={mapTiles}
        />
        <MapInvalidateSize />
        <MapRecenter lat={status.lat} lng={status.lng} />
        <ZoomControl position="topright" />
        <Marker position={[status.lat, status.lng]} icon={beachIcon}>
          <Popup>{status.name}</Popup>
        </Marker>
        <StationMarkers stations={stations} onHover={setHoveredStationId} />
        <MapStationTooltip station={hoveredStation} />
      </MapContainer>
      <div className="absolute inset-x-0 bottom-0 h-1/2 map-gradient-overlay pointer-events-none z-[1]" />
      <div className="absolute top-0 left-0 p-margin-mobile pt-sm z-[1] pointer-events-none">
        <div className="glass-card map-status-card relative w-fit max-w-[calc(100%-32px)] px-md py-sm rounded-xl pointer-events-auto">
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
  )
}
