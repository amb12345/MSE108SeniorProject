"use client"

import { useState, useMemo, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { cn } from "@/lib/utils"
import { Truck } from "lucide-react"
import { telemetryData } from "@/lib/data"
import "leaflet/dist/leaflet.css"

interface TruckLocation {
  id: string
  name: string
  lat: number
  lng: number
  status: "active" | "transit" | "idle" | "maintenance"
  driver: string
  speed: number
}

// Convert telemetry data to truck locations
const getTrucksFromTelemetry = (): TruckLocation[] => {
  const truckIds = [...new Set(telemetryData.map(t => t.truck_id))]
  
  const trucks: TruckLocation[] = truckIds.map(truckId => {
    const truckTelemetry = telemetryData.filter(t => t.truck_id === truckId)
    const latest = truckTelemetry[truckTelemetry.length - 1]
    
    let status: "active" | "transit" | "idle" | "maintenance" = "idle"
    if (latest.speed === 0) {
      status = "idle"
    } else if (latest.speed < 10) {
      status = "idle"
    } else if (latest.speed < 55) {
      status = "transit"
    } else {
      status = "active"
    }
    
    return {
      id: `T${truckId}`,
      name: `Truck ${truckId}`,
      lat: latest.latitude,
      lng: latest.longitude,
      status,
      driver: `Driver ${truckId}`,
      speed: latest.speed,
    }
  })
  
  return trucks
}

const statusConfig = {
  active: { color: "bg-success", label: "Active", hex: "#22c55e" },
  transit: { color: "bg-primary", label: "Transit", hex: "#3b82f6" },
  idle: { color: "bg-warning", label: "Idle", hex: "#f59e0b" },
  maintenance: { color: "bg-destructive", label: "Maintenance", hex: "#ef4444" },
}

// Create custom truck icon for each status
const createTruckIcon = (status: keyof typeof statusConfig) => {
  const color = statusConfig[status].hex
  return L.divIcon({
    className: 'custom-truck-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
          <path d="M15 18H9"></path>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path>
          <circle cx="17" cy="18" r="2"></circle>
          <circle cx="7" cy="18" r="2"></circle>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  })
}

interface FleetMapClientProps {
  onSelectTruck?: (truck: TruckLocation) => void
  selectedTruckId?: string
  showRoute?: boolean
  routePoints?: { lat: number; lng: number }[]
}

// Component to fit map bounds to markers
function MapBounds({ trucks }: { trucks: TruckLocation[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (trucks.length > 0) {
      const bounds = L.latLngBounds(trucks.map(t => [t.lat, t.lng]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [trucks, map])
  
  return null
}

export function FleetMapClient({ onSelectTruck, selectedTruckId, showRoute, routePoints }: FleetMapClientProps) {
  const [selectedTruck, setSelectedTruck] = useState<TruckLocation | null>(null)
  const trucks = useMemo(() => getTrucksFromTelemetry(), [])
  
  // Calculate center point from truck locations
  const center = useMemo(() => {
    if (trucks.length === 0) return { lat: 41.8781, lng: -87.6298 }
    
    const avgLat = trucks.reduce((sum, t) => sum + t.lat, 0) / trucks.length
    const avgLng = trucks.reduce((sum, t) => sum + t.lng, 0) / trucks.length
    
    return { lat: avgLat, lng: avgLng }
  }, [trucks])

  const handleMarkerClick = (truck: TruckLocation) => {
    setSelectedTruck(truck)
    onSelectTruck?.(truck)
  }

  return (
    <>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={7}
        className="h-full w-full z-0"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds trucks={trucks} />
        
        {trucks.map((truck) => (
          <Marker
            key={truck.id}
            position={[truck.lat, truck.lng]}
            icon={createTruckIcon(truck.status)}
            eventHandlers={{
              click: () => handleMarkerClick(truck),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[160px]">
                <h3 className="font-semibold text-foreground mb-1">{truck.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{truck.driver}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="h-2.5 w-2.5 rounded-full" 
                    style={{ backgroundColor: statusConfig[truck.status].hex }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {statusConfig[truck.status].label}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Speed: {truck.speed} mph</p>
                  <p>Location: {truck.lat.toFixed(4)}, {truck.lng.toFixed(4)}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-xl bg-card/95 border border-border/50 p-3 backdrop-blur-sm shadow-lg z-[1000]">
        <p className="text-xs font-semibold text-foreground mb-2">Status</p>
        <div className="space-y-1.5">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", config.color)} />
              <span className="text-xs text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export type { TruckLocation }
