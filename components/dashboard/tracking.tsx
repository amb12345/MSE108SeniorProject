"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FleetMap, type TruckLocation } from "./fleet-map"
import { Truck, User, Fuel, Gauge, Thermometer, MapPin, Clock, Package, Droplets } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts"
import { telemetryData, sensorData } from "@/lib/data"

// Generate truck data from telemetry
const trucksData = [
  {
    id: "T1",
    name: "Truck 1",
    make: "Volvo",
    model: "FH16",
    year: 2022,
    licensePlate: "TRK-0001",
    driver: "John Smith",
    driverImage: null,
    status: "active" as const,
    currentLocation: "Chicago Area",
    destination: "Milwaukee, WI",
    eta: "2h 15m",
    speed: 0,
    fuel: 78,
    temperature: 0,
    odometer: 45672,
    deliveries: { completed: 156, pending: 3 },
  },
]

// Transform telemetry data for chart
const getChartData = () => {
  return telemetryData.map((point) => {
    const time = new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const sensor = sensorData.find(s => s.timestamp === point.timestamp && s.truck_id === point.truck_id)
    return {
      time,
      speed: point.speed,
      temperature: sensor?.temperature_f || 0,
    }
  })
}

const statusConfig = {
  active: { label: "Active", className: "bg-success/15 text-success border-success/30" },
  transit: { label: "In Transit", className: "bg-primary/15 text-primary border-primary/30" },
  idle: { label: "Idle", className: "bg-warning/15 text-warning border-warning/30" },
  maintenance: { label: "Maintenance", className: "bg-destructive/15 text-destructive border-destructive/30" },
}

export function Tracking() {
  const [selectedTruck, setSelectedTruck] = useState(trucksData[0])
  const [selectedTValue, setSelectedTValue] = useState(1)

  // Get latest telemetry point for selected truck
  const latestTelemetry = useMemo(() => {
    const truckTelemetry = telemetryData.filter(t => t.truck_id === 1)
    return truckTelemetry[truckTelemetry.length - 1] || telemetryData[0]
  }, [])

  // Get current telemetry point based on selected t value
  const currentTelemetry = useMemo(() => {
    return telemetryData.find(t => t.t === selectedTValue) || latestTelemetry
  }, [selectedTValue, latestTelemetry])

  // Get corresponding sensor data
  const currentSensor = useMemo(() => {
    return sensorData.find(s => s.timestamp === currentTelemetry.timestamp && s.truck_id === currentTelemetry.truck_id)
  }, [currentTelemetry])

  // Update truck data with real telemetry
  const updatedTruck = useMemo(() => {
    return {
      ...selectedTruck,
      speed: currentTelemetry.speed,
      temperature: currentSensor?.temperature_f || 0,
    }
  }, [selectedTruck, currentTelemetry, currentSensor])

  const chartData = useMemo(() => getChartData(), [])

  const handleTruckSelect = (truck: TruckLocation) => {
    const truckData = trucksData.find((t) => t.id === truck.id)
    if (truckData) {
      setSelectedTruck(truckData)
    }
  }

  const tValues = telemetryData.map(t => t.t)
  const minT = Math.min(...tValues)
  const maxT = Math.max(...tValues)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Tracking</h1>
        </div>
        <Badge variant="outline" className="w-fit border-success/30 bg-success/10 text-success">
          <span className="relative mr-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          {trucksData.length} Vehicle{trucksData.length > 1 ? 's' : ''} Online
        </Badge>
      </div>

      {/* Time Scrubber */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">Time Point</span>
            </div>
            <div className="flex flex-1 items-center gap-4">
              <input
                type="range"
                min={minT}
                max={maxT}
                value={selectedTValue}
                onChange={(e) => setSelectedTValue(parseInt(e.target.value, 10))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
              />
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="font-mono">
                  {selectedTValue} / {maxT}
                </Badge>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {new Date(currentTelemetry.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Fleet List */}
        <Card className="border-border shadow-sm lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Fleet Vehicles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {trucksData.map((truck) => (
              <button
                key={truck.id}
                onClick={() => setSelectedTruck(truck)}
                className={`w-full rounded-xl p-4 text-left transition-all ${
                  selectedTruck.id === truck.id
                    ? "bg-primary/10 ring-2 ring-primary/20"
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    selectedTruck.id === truck.id ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <Truck className={`h-6 w-6 ${selectedTruck.id === truck.id ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">{truck.name}</p>
                      <Badge variant="outline" className={statusConfig[truck.status].className}>
                        {statusConfig[truck.status].label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground truncate">
                      {truck.make} {truck.model} • {truck.driver}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Live Location</CardTitle>
          </CardHeader>
          <CardContent>
            <FleetMap onSelectTruck={handleTruckSelect} selectedTruckId={selectedTruck.id} />
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Vehicle Info */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Truck className="h-4 w-4 text-primary" />
              Vehicle Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Truck className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Make/Model</span>
                <span className="font-medium text-foreground">{selectedTruck.make} {selectedTruck.model}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Year</span>
                <span className="font-medium text-foreground">{selectedTruck.year}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">License</span>
                <span className="font-mono text-xs font-medium text-foreground">{selectedTruck.licensePlate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Odometer</span>
                <span className="font-medium text-foreground">{selectedTruck.odometer.toLocaleString()} mi</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <User className="h-4 w-4 text-primary" />
              Driver
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{selectedTruck.driver}</p>
              <p className="text-sm text-muted-foreground">Licensed Driver</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deliveries</span>
                <span className="font-medium text-success">{selectedTruck.deliveries.completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium text-warning">{selectedTruck.deliveries.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Telemetry Data */}
        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Telemetry Data</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Metric Cards */}
            <div className="mb-6 grid grid-cols-4 gap-3">
              <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3 text-center">
                <Gauge className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-2 text-xl font-bold text-foreground">{updatedTruck.speed}</p>
                <p className="text-[10px] font-medium text-muted-foreground">MPH</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 p-3 text-center">
                <Fuel className="mx-auto h-5 w-5 text-warning" />
                <p className="mt-2 text-xl font-bold text-foreground">{updatedTruck.fuel}%</p>
                <p className="text-[10px] font-medium text-muted-foreground">Fuel</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 p-3 text-center">
                <Thermometer className="mx-auto h-5 w-5 text-destructive" />
                <p className="mt-2 text-xl font-bold text-foreground">{updatedTruck.temperature}°F</p>
                <p className="text-[10px] font-medium text-muted-foreground">Temp</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-info/10 to-info/5 p-3 text-center">
                <Droplets className="mx-auto h-5 w-5 text-info" />
                <p className="mt-2 text-xl font-bold text-foreground">{currentSensor?.humidity_pct || 0}%</p>
                <p className="text-[10px] font-medium text-muted-foreground">Humidity</p>
              </div>
            </div>
            
            {/* Chart */}
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="speed" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    fill="url(#speedGradient)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2} 
                    fill="url(#tempGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Delivery */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Package className="h-4 w-4 text-primary" />
            Current Delivery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Origin */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <MapPin className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Location</p>
                <p className="font-medium text-foreground">
                  {currentTelemetry.latitude.toFixed(4)}, {currentTelemetry.longitude.toFixed(4)}
                </p>
              </div>
            </div>
            
            {/* Route Line */}
            <div className="relative hidden flex-1 sm:block">
              <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-success via-primary to-primary" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Badge variant="secondary" className="bg-card shadow-sm">
                  {selectedTruck.eta} remaining
                </Badge>
              </div>
            </div>
            
            {/* Mobile ETA */}
            <div className="flex justify-center sm:hidden">
              <Badge variant="secondary">
                {selectedTruck.eta} remaining
              </Badge>
            </div>
            
            {/* Destination */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="font-medium text-foreground">{selectedTruck.destination}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
