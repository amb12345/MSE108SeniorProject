"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FleetMap } from "./fleet-map"
import { Truck, User, Fuel, Gauge, Thermometer, MapPin, Clock, Package, Droplets, AlertTriangle, ChevronDown, Snowflake } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { telemetryData, sensorData } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useFleetData } from "@/hooks/use-fleet-data"

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
  idle: { label: "Idle", className: "bg-muted text-muted-foreground border-muted" },
  maintenance: { label: "Maintenance", className: "bg-destructive/15 text-destructive border-destructive/30" },
}

export function Tracking() {
  const [selectedTruck, setSelectedTruck] = useState<any>(null)
  const [selectedTValue, setSelectedTValue] = useState(1)
  const [showAlerts, setShowAlerts] = useState(false)
  
  // Fetch database fleet data
  const { data: dbFleetData, loading } = useFleetData(undefined, 60000)
  
  // Transform database trucks into UI format
  const trucksData = useMemo(() => {
    if (dbFleetData && Array.isArray(dbFleetData)) {
      return dbFleetData.map((truck: any) => {
        // Determine status based on GPS and decision data
        let status: 'active' | 'transit' | 'idle' = 'active'
        if (truck.gps?.at_node === true) {
          status = 'idle' // Completed/at destination
        } else if (truck.gps?.speed_mph > 0) {
          status = 'transit'
        } else {
          status = 'idle'
        }
        
        return {
          id: `T${truck.truck_id}`,
          truck_id: truck.truck_id,
          name: `Truck ${truck.truck_id}`,
          make: "Fleet Vehicle",
          model: "Standard",
          year: 2024,
          licensePlate: `TRK-${String(truck.truck_id).padStart(4, '0')}`,
          driver: `Driver ${truck.truck_id}`,
          driverPhone: "(555) 000-0000",
          driverEmail: `driver${truck.truck_id}@fleet.com`,
          driverImage: null,
          status,
          currentLocation: truck.gps ? `${truck.gps.latitude.toFixed(2)}°, ${truck.gps.longitude.toFixed(2)}°` : "Unknown",
          destination: truck.gps?.destination_node ? `Node ${truck.gps.destination_node}` : "Unknown",
          eta: "Calculating...",
          speed: truck.gps?.speed_mph || 0,
          fuel: 75, // Mock for now
          temperature: truck.sensor?.temperature_c || 0,
          humidity: parseFloat(truck.sensor?.humidity_pct) || 0,
          odometer: 0,
          deliveries: { completed: 0, pending: 0 },
          gps: truck.gps,
          sensor: truck.sensor,
          decision: truck.decision,
        }
      })
    }
    
    // Fallback to mock data
    return [{
      id: "T1",
      truck_id: 1,
      name: "Truck 1",
      make: "Volvo",
      model: "FH16",
      year: 2022,
      licensePlate: "TRK-0001",
      driver: "John Smith",
      driverPhone: "(555) 123-4567",
      driverEmail: "john.smith@ibm.com",
      driverImage: null,
      status: "active" as const,
      currentLocation: "Chicago Area",
      destination: "Milwaukee, WI",
      eta: "2h 15m",
      speed: 0,
      fuel: 78,
      temperature: 0,
      humidity: 0,
      odometer: 45672,
      deliveries: { completed: 156, pending: 3 },
      gps: null,
      sensor: null,
      decision: null,
    }]
  }, [dbFleetData])
  
  // Set initial selected truck when trucksData is available
  useEffect(() => {
    if (!selectedTruck && trucksData.length > 0) {
      setSelectedTruck(trucksData[0])
    }
  }, [trucksData, selectedTruck])

  // Get latest telemetry point for selected truck
  const latestTelemetry = useMemo(() => {
    if (!selectedTruck) return telemetryData[0]
    const truckTelemetry = telemetryData.filter(t => t.truck_id === selectedTruck.truck_id || t.truck_id === 1)
    return truckTelemetry[truckTelemetry.length - 1] || telemetryData[0]
  }, [selectedTruck])

  // Get current telemetry from database or mock
  const currentTelemetry = useMemo(() => {
    if (!selectedTruck) return telemetryData[0]
    if (selectedTruck.gps) {
      return {
        t: 0,
        truck_id: selectedTruck.truck_id,
        timestamp: new Date().toISOString(),
        latitude: selectedTruck.gps.latitude,
        longitude: selectedTruck.gps.longitude,
        speed: selectedTruck.gps.speed_mph,
      }
    }
    return telemetryData.find(t => t.t === selectedTValue) || latestTelemetry
  }, [selectedTruck, selectedTValue, latestTelemetry])

  // Get corresponding sensor data
  const currentSensor = useMemo(() => {
    if (!selectedTruck) return sensorData[0]
    if (selectedTruck.sensor) {
      return selectedTruck.sensor
    }
    return sensorData.find(s => s.timestamp === currentTelemetry.timestamp && s.truck_id === currentTelemetry.truck_id)
  }, [selectedTruck, currentTelemetry])
  
  // Generate alerts from database data
  const alerts = useMemo(() => {
    if (dbFleetData && Array.isArray(dbFleetData)) {
      const alertList: Array<{type: 'critical' | 'warning', message: string}> = []
      
      dbFleetData.forEach((truck: any) => {
        if (!truck.sensor) return
        
        const truckId = truck.truck_id
        const tempF = truck.sensor.temperature_c
        const humidityPct = parseFloat(truck.sensor.humidity_pct) || 0
        
        if (tempF > 64.4) {
          alertList.push({
            type: 'critical',
            message: `High temperature (${tempF.toFixed(1)}°F) - Truck ${truckId}`
          })
        }
        
        if (humidityPct >= 90) {
          alertList.push({
            type: 'critical',
            message: `Critical humidity (${humidityPct.toFixed(1)}%) - Truck ${truckId}`
          })
        }
        else if (humidityPct >= 80) {
          alertList.push({
            type: 'warning',
            message: `High humidity (${humidityPct.toFixed(1)}%) - Truck ${truckId}`
          })
        }
        
        if (truck.sensor.door_open) {
          alertList.push({
            type: 'warning',
            message: `Door open - Truck ${truckId}`
          })
        }
      })
      
      return alertList
    }
    
    return []
  }, [dbFleetData])

  // Update truck data with real telemetry
  const updatedTruck = useMemo(() => {
    if (!selectedTruck) {
      return {
        speed: 0,
        fuel: 0,
        temperature: 0,
        humidity: 0,
        name: "Loading...",
        driver: "",
        licensePlate: "",
        driverPhone: "",
      }
    }
    if (selectedTruck.gps || selectedTruck.sensor) {
      return selectedTruck
    }
    return {
      ...selectedTruck,
      speed: currentTelemetry.speed,
      temperature: currentSensor?.temperature_f || currentSensor?.temperature_c || 0,
    }
  }, [selectedTruck, currentTelemetry, currentSensor])

  const chartData = useMemo(() => getChartData(), [])

  const handleTruckSelect = (truck: typeof trucksData[0]) => {
    setSelectedTruck(truck)
  }

  const tValues = telemetryData.map(t => t.t)
  const minT = Math.min(...tValues)
  const maxT = Math.max(...tValues)

  // Separate active and inactive trucks
  const activeTrucks = trucksData.filter(t => t.status === 'active' || t.status === 'transit')
  const inactiveTrucks = trucksData.filter(t => t.status === 'idle' || t.status === 'maintenance')

  if (!selectedTruck) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tracking</h1>
        </div>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading fleet data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tracking</h1>
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Fleet Vehicles List */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Fleet Vehicles</CardTitle>
            <p className="text-xs text-muted-foreground">
              {trucksData.length} Total
              {!loading && dbFleetData && (
                <span className="ml-2 text-success">● Live</span>
              )}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Active Vehicles */}
            {activeTrucks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">ACTIVE</p>
                <div className="space-y-2">
                  {activeTrucks.map((truck) => (
                    <button
                      key={truck.id}
                      onClick={() => handleTruckSelect(truck)}
                      className={cn(
                        "w-full rounded-lg p-3 text-left transition-all border",
                        selectedTruck.id === truck.id
                          ? "bg-primary/10 border-primary ring-1 ring-primary/20"
                          : "bg-card border-border hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          selectedTruck.id === truck.id ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Truck className={cn("h-5 w-5", selectedTruck.id === truck.id ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-sm text-foreground">{truck.name}</p>
                            <Badge variant="outline" className={statusConfig[truck.status].className}>
                              {statusConfig[truck.status].label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {truck.driver}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Vehicles */}
            {inactiveTrucks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">INACTIVE</p>
                <div className="space-y-2">
                  {inactiveTrucks.map((truck) => (
                    <button
                      key={truck.id}
                      onClick={() => handleTruckSelect(truck)}
                      className={cn(
                        "w-full rounded-lg p-3 text-left transition-all border opacity-60",
                        selectedTruck.id === truck.id
                          ? "bg-primary/10 border-primary ring-1 ring-primary/20"
                          : "bg-card border-border hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          selectedTruck.id === truck.id ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Truck className={cn("h-5 w-5", selectedTruck.id === truck.id ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">{truck.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{truck.driver}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map - Shows selected truck only */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Map</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {selectedTruck.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <FleetMap selectedTruckId={selectedTruck.id} />
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Time Point and Alerts */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Time Point */}
        <Card className="border-border shadow-sm lg:col-span-3">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-2">Time Point</p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={minT}
                    max={maxT}
                    value={selectedTValue}
                    onChange={(e) => setSelectedTValue(parseInt(e.target.value, 10))}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                  />
                  <Badge variant="secondary" className="font-mono text-xs">
                    {selectedTValue} / {maxT}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(currentTelemetry.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-destructive/30 bg-destructive/5 shadow-sm cursor-pointer hover:bg-destructive/10 transition-colors" onClick={() => setShowAlerts(!showAlerts)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/20 p-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive">Alerts</p>
                  <p className="text-2xl font-bold text-destructive">{alerts.length}</p>
                </div>
              </div>
              <ChevronDown className={cn("h-5 w-5 text-destructive transition-transform", showAlerts && "rotate-180")} />
            </div>
            {showAlerts && (
              <div className="mt-4 space-y-2 border-t border-destructive/20 pt-3">
                <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
                  {alerts.slice(0, 10).map((alert, idx) => (
                    <p key={idx} className={cn("font-medium", alert.type === 'critical' ? 'text-destructive' : 'text-warning')}>
                      • {alert.message}
                    </p>
                  ))}
                  {alerts.length > 10 && (
                    <p className="text-muted-foreground italic">+ {alerts.length - 10} more alerts</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Telemetry Data */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Telemetry Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <Gauge className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-xl font-bold text-foreground">{updatedTruck.speed}</p>
              <p className="text-[10px] text-muted-foreground">MPH</p>
            </div>
            <div className="rounded-lg bg-warning/10 p-3 text-center">
              <Fuel className="h-5 w-5 mx-auto text-warning mb-1" />
              <p className="text-xl font-bold text-foreground">{updatedTruck.fuel}%</p>
              <p className="text-[10px] text-muted-foreground">Fuel</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3 text-center">
              <Thermometer className="h-5 w-5 mx-auto text-destructive mb-1" />
              <p className="text-xl font-bold text-foreground">{updatedTruck.temperature}°F</p>
              <p className="text-[10px] text-muted-foreground">Temp</p>
            </div>
            <div className="rounded-lg bg-info/10 p-3 text-center">
              <Droplets className="h-5 w-5 mx-auto text-info mb-1" />
              <p className="text-xl font-bold text-foreground">{(parseFloat(currentSensor?.humidity_pct) || 0).toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground">Humidity</p>
            </div>
          </div>
          <div className="h-[120px]">
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
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                  labelStyle={{ 
                    color: 'hsl(var(--foreground))',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="speed" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  fill="url(#speedGradient)"
                  name="Speed (mph)"
                />
                <Area 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2} 
                  fill="url(#tempGradient)"
                  name="Temperature (°F)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Current Delivery + Info Card */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        {/* Current Delivery */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-primary" />
              Current Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center w-full max-w-2xl">
              {/* Origin */}
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <MapPin className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Location</p>
                  <p className="font-medium text-sm text-foreground">
                    {currentTelemetry.latitude.toFixed(4)}, {currentTelemetry.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
              
              {/* Route Line */}
              <div className="relative hidden flex-1 sm:block">
                <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-success via-primary to-primary" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge variant="secondary" className="bg-card shadow-sm text-xs">
                    {selectedTruck.eta} remaining
                  </Badge>
                </div>
              </div>
              
              {/* Mobile ETA */}
              <div className="flex justify-center sm:hidden">
                <Badge variant="secondary" className="text-xs">
                  {selectedTruck.eta} remaining
                </Badge>
              </div>
              
              {/* Destination */}
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="font-medium text-sm text-foreground">{selectedTruck.destination}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compact Info Card */}
        <Card className="border-border shadow-sm w-[340px] flex flex-col">
          <CardContent className="p-4 flex-1 flex">
            <div className="flex gap-3 flex-1">
              {/* Left: Driver Info */}
              <div className="flex-1 rounded-lg bg-primary/10 p-3 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary/30">
                    <Image
                      src="/placeholder-user.jpg"
                      alt={selectedTruck.driver}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-primary/70 font-medium">Driver</p>
                    <p className="text-xs font-semibold text-primary">{selectedTruck.driver}</p>
                  </div>
                </div>
                <div className="space-y-1 text-[10px] text-primary">
                  <p className="font-medium">ID: {selectedTruck.licensePlate}</p>
                  <p className="font-medium">{selectedTruck.driverPhone}</p>
                </div>
              </div>

              {/* Right: Vehicle Info */}
              <div className="flex-1 rounded-lg bg-muted/50 p-3 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1">Vehicle</p>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-foreground/60" />
                    <p className="text-xs font-semibold text-foreground">{selectedTruck.name}</p>
                  </div>
                </div>
                <div className="space-y-1 text-[10px] text-foreground/80">
                  <p className="font-medium">{selectedTruck.make} {selectedTruck.model}</p>
                  <p className="font-medium">Year: {selectedTruck.year}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
