"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FleetMap, type TruckLocation } from "./fleet-map"
import { Truck, User, Fuel, Gauge, Thermometer, MapPin, Clock, Package } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const trucksData = [
  {
    id: "T101",
    name: "Truck 101",
    make: "Volvo",
    model: "FH16",
    year: 2022,
    licensePlate: "ABC-1234",
    driver: "John Smith",
    driverImage: null,
    status: "active",
    currentLocation: "Highway I-95, Mile 234",
    destination: "Chicago, IL",
    eta: "2h 15m",
    speed: 65,
    fuel: 78,
    temperature: 185,
    odometer: 45672,
    deliveries: { completed: 156, pending: 3 },
  },
  {
    id: "T102",
    name: "Truck 102",
    make: "Kenworth",
    model: "T680",
    year: 2021,
    licensePlate: "XYZ-5678",
    driver: "Mike Johnson",
    driverImage: null,
    status: "transit",
    currentLocation: "Route 66, Denver Area",
    destination: "Los Angeles, CA",
    eta: "6h 30m",
    speed: 58,
    fuel: 45,
    temperature: 190,
    odometer: 89234,
    deliveries: { completed: 203, pending: 5 },
  },
  {
    id: "T103",
    name: "Truck 103",
    make: "Peterbilt",
    model: "579",
    year: 2023,
    licensePlate: "DEF-9012",
    driver: "Sarah Davis",
    driverImage: null,
    status: "active",
    currentLocation: "Texas State Highway 6",
    destination: "Houston, TX",
    eta: "45m",
    speed: 55,
    fuel: 92,
    temperature: 178,
    odometer: 23456,
    deliveries: { completed: 89, pending: 2 },
  },
]

const telemetryData = [
  { time: "00:00", speed: 62, fuel: 85 },
  { time: "04:00", speed: 58, fuel: 72 },
  { time: "08:00", speed: 65, fuel: 58 },
  { time: "12:00", speed: 55, fuel: 45 },
  { time: "16:00", speed: 60, fuel: 90 },
  { time: "20:00", speed: 63, fuel: 78 },
]

const statusColors: Record<string, string> = {
  active: "bg-success text-foreground",
  transit: "bg-accent text-accent-foreground",
  idle: "bg-warning text-foreground",
  maintenance: "bg-destructive text-destructive-foreground",
}

export function Tracking() {
  const [selectedTruck, setSelectedTruck] = useState(trucksData[0])

  const handleTruckSelect = (truck: TruckLocation) => {
    const truckData = trucksData.find((t) => t.id === truck.id)
    if (truckData) {
      setSelectedTruck(truckData)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Truck Tracking</h1>
        <Badge variant="outline" className="text-sm">
          {trucksData.length} Trucks Active
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Truck List */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-card-foreground">Fleet Vehicles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {trucksData.map((truck) => (
              <button
                key={truck.id}
                onClick={() => setSelectedTruck(truck)}
                className={`w-full rounded-lg p-3 text-left transition-colors ${
                  selectedTruck.id === truck.id
                    ? "bg-primary/10 border border-primary"
                    : "bg-secondary/50 hover:bg-secondary border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-card-foreground">{truck.name}</p>
                      <Badge className={statusColors[truck.status]} variant="secondary">
                        {truck.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {truck.make} {truck.model} • {truck.driver}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-card-foreground">Live Location</CardTitle>
          </CardHeader>
          <CardContent>
            <FleetMap onSelectTruck={handleTruckSelect} selectedTruckId={selectedTruck.id} />
          </CardContent>
        </Card>
      </div>

      {/* Selected Truck Details */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Truck Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Vehicle Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-secondary">
                <Truck className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Make/Model</span>
                <span className="text-card-foreground">{selectedTruck.make} {selectedTruck.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year</span>
                <span className="text-card-foreground">{selectedTruck.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">License</span>
                <span className="text-card-foreground">{selectedTruck.licensePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Odometer</span>
                <span className="text-card-foreground">{selectedTruck.odometer.toLocaleString()} mi</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <User className="h-5 w-5" />
              Driver
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-medium text-card-foreground">{selectedTruck.driver}</p>
              <p className="text-sm text-muted-foreground">Licensed Driver</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deliveries</span>
                <span className="text-card-foreground">{selectedTruck.deliveries.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="text-card-foreground">{selectedTruck.deliveries.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Telemetry */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-card-foreground">Telemetry Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <Gauge className="h-5 w-5 mx-auto text-accent" />
                <p className="mt-1 text-lg font-semibold text-card-foreground">{selectedTruck.speed}</p>
                <p className="text-xs text-muted-foreground">MPH</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <Fuel className="h-5 w-5 mx-auto text-warning" />
                <p className="mt-1 text-lg font-semibold text-card-foreground">{selectedTruck.fuel}%</p>
                <p className="text-xs text-muted-foreground">Fuel</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <Thermometer className="h-5 w-5 mx-auto text-destructive" />
                <p className="mt-1 text-lg font-semibold text-card-foreground">{selectedTruck.temperature}°</p>
                <p className="text-xs text-muted-foreground">Temp</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <Clock className="h-5 w-5 mx-auto text-success" />
                <p className="mt-1 text-lg font-semibold text-card-foreground">{selectedTruck.eta}</p>
                <p className="text-xs text-muted-foreground">ETA</p>
              </div>
            </div>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryData}>
                  <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="speed" stroke="hsl(250, 60%, 55%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fuel" stroke="hsl(35, 80%, 55%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Status */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Delivery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Current Location</p>
                <p className="font-medium text-card-foreground">{selectedTruck.currentLocation}</p>
              </div>
            </div>
            <div className="flex-1 border-t-2 border-dashed border-border relative">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2">
                <Badge variant="outline" className="text-xs">
                  {selectedTruck.eta} remaining
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="font-medium text-card-foreground">{selectedTruck.destination}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
