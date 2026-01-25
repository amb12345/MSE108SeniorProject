"use client"

import dynamic from "next/dynamic"

// Dynamically import the map component with SSR disabled
const FleetMapClient = dynamic(
  () => import("./fleet-map-client").then((mod) => ({ default: mod.FleetMapClient })),
  { 
    ssr: false,
    loading: () => (
      <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-border bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }
)

interface TruckLocation {
  id: string
  name: string
  lat: number
  lng: number
  status: "active" | "transit" | "idle" | "maintenance"
  driver: string
  speed: number
}

interface FleetMapProps {
  onSelectTruck?: (truck: TruckLocation) => void
  selectedTruckId?: string
  showRoute?: boolean
  routePoints?: { lat: number; lng: number }[]
}

export function FleetMap(props: FleetMapProps) {
  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-border">
      <FleetMapClient {...props} />
    </div>
  )
}

export type { TruckLocation }
