"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Truck, MapPin } from "lucide-react"

interface TruckLocation {
  id: string
  name: string
  lat: number
  lng: number
  status: "active" | "transit" | "idle" | "maintenance"
  driver: string
}

const trucks: TruckLocation[] = [
  { id: "T101", name: "Truck 101", lat: 35, lng: 25, status: "active", driver: "John Smith" },
  { id: "T102", name: "Truck 102", lat: 45, lng: 55, status: "transit", driver: "Mike Johnson" },
  { id: "T103", name: "Truck 103", lat: 60, lng: 70, status: "active", driver: "Sarah Davis" },
  { id: "T104", name: "Truck 104", lat: 25, lng: 60, status: "idle", driver: "Tom Wilson" },
  { id: "T105", name: "Truck 105", lat: 70, lng: 35, status: "transit", driver: "Emily Brown" },
  { id: "T106", name: "Truck 106", lat: 50, lng: 85, status: "maintenance", driver: "David Lee" },
  { id: "T107", name: "Truck 107", lat: 80, lng: 50, status: "active", driver: "Lisa Chen" },
  { id: "T108", name: "Truck 108", lat: 15, lng: 40, status: "transit", driver: "Chris Martin" },
]

const statusColors = {
  active: "bg-success",
  transit: "bg-accent",
  idle: "bg-warning",
  maintenance: "bg-destructive",
}

interface FleetMapProps {
  onSelectTruck?: (truck: TruckLocation) => void
  selectedTruckId?: string
  showRoute?: boolean
  routePoints?: { lat: number; lng: number }[]
}

export function FleetMap({ onSelectTruck, selectedTruckId, showRoute, routePoints }: FleetMapProps) {
  const [hoveredTruck, setHoveredTruck] = useState<string | null>(null)

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg bg-secondary/30">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(100,116,139,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Map regions */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(100,116,139,0.1)" />
            <stop offset="100%" stopColor="rgba(100,116,139,0.05)" />
          </linearGradient>
        </defs>
        
        {/* Simplified region shapes */}
        <path d="M10,20 Q30,15 50,25 T90,30 L85,60 Q70,70 50,65 T15,55 Z" fill="url(#mapGradient)" stroke="rgba(100,116,139,0.2)" strokeWidth="0.5" />
        <path d="M20,70 Q40,65 60,75 T80,70 L75,90 Q55,95 35,90 T15,85 Z" fill="url(#mapGradient)" stroke="rgba(100,116,139,0.2)" strokeWidth="0.5" />
        
        {/* Route line */}
        {showRoute && routePoints && routePoints.length > 1 && (
          <polyline
            points={routePoints.map(p => `${p.lng},${p.lat}`).join(' ')}
            fill="none"
            stroke="hsl(250, 60%, 55%)"
            strokeWidth="0.8"
            strokeDasharray="2,1"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Truck markers */}
      {trucks.map((truck) => (
        <div
          key={truck.id}
          className="absolute cursor-pointer transition-all duration-200"
          style={{
            left: `${truck.lng}%`,
            top: `${truck.lat}%`,
            transform: "translate(-50%, -50%)",
          }}
          onClick={() => onSelectTruck?.(truck)}
          onMouseEnter={() => setHoveredTruck(truck.id)}
          onMouseLeave={() => setHoveredTruck(null)}
        >
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
              statusColors[truck.status],
              selectedTruckId === truck.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-125" : "",
              hoveredTruck === truck.id ? "scale-110" : ""
            )}
          >
            <Truck className="h-4 w-4 text-foreground" />
          </div>
          
          {/* Tooltip */}
          {hoveredTruck === truck.id && (
            <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 z-10 min-w-[140px]">
              <div className="rounded-lg bg-card border border-border p-2 shadow-lg">
                <p className="text-sm font-medium text-card-foreground">{truck.name}</p>
                <p className="text-xs text-muted-foreground">{truck.driver}</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className={cn("h-2 w-2 rounded-full", statusColors[truck.status])} />
                  <span className="text-xs capitalize text-muted-foreground">{truck.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-lg bg-card/90 border border-border p-3 backdrop-blur-sm">
        <p className="text-xs font-medium text-card-foreground mb-2">Status</p>
        <div className="space-y-1">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", color)} />
              <span className="text-xs capitalize text-muted-foreground">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom controls placeholder */}
      <div className="absolute right-4 top-4 flex flex-col gap-1">
        <button className="flex h-8 w-8 items-center justify-center rounded-md bg-card border border-border text-card-foreground hover:bg-secondary transition-colors">
          +
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-md bg-card border border-border text-card-foreground hover:bg-secondary transition-colors">
          -
        </button>
      </div>
    </div>
  )
}

export type { TruckLocation }
