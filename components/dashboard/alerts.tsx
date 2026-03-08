"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Thermometer, Droplets, Bell, Clock, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFleetData } from "@/hooks/use-fleet-data"

interface AlertItem {
  id: string
  type: "temp" | "humidity" | "door"
  title: string
  message: string
  truck: string
  time: string
}

const getTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  return `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? "s" : ""} ago`
}

// Generate alerts from sensor data: temp > 64.4, humidity > 90, door_open only
const generateAlertsFromData = (dbData?: any[]): AlertItem[] => {
  const alerts: AlertItem[] = []
  let alertId = 1

  if (dbData && Array.isArray(dbData)) {
    dbData.forEach((truck: any) => {
      const sensor = truck.sensor
      if (!sensor) return

      const timeAgo = getTimeAgo(sensor.timestamp)
      const truckId = truck.truck_id
      const temp = sensor.temperature_c
      const humidityPct = parseFloat(sensor.humidity_pct) || 0

      if (temp > 64.4) {
        alerts.push({
          id: `A${String(alertId++).padStart(3, "0")}`,
          type: "temp",
          title: "High Temperature Alert",
          message: `Temperature at ${temp.toFixed(1)}°F (exceeds 64.4°F threshold)`,
          truck: `Truck ${truckId}`,
          time: timeAgo,
        })
      }

      if (humidityPct > 90) {
        alerts.push({
          id: `A${String(alertId++).padStart(3, "0")}`,
          type: "humidity",
          title: "Critical Humidity Level",
          message: `Humidity at ${humidityPct.toFixed(1)}% (exceeds 90% threshold)`,
          truck: `Truck ${truckId}`,
          time: timeAgo,
        })
      }

      if (sensor.door_open) {
        alerts.push({
          id: `A${String(alertId++).padStart(3, "0")}`,
          type: "door",
          title: "Door Open",
          message: `Truck door is currently open`,
          truck: `Truck ${truckId}`,
          time: timeAgo,
        })
      }
    })
  }

  return alerts.sort((a, b) => b.id.localeCompare(a.id))
}

export function Alerts() {
  const { data: dbFleetData } = useFleetData(undefined, 60000)
  const fleetArray = dbFleetData ? (Array.isArray(dbFleetData) ? dbFleetData : [dbFleetData]) : []

  const stats = useMemo(() => {
    const tempTruckIds = new Set<number>()
    const humidityTruckIds = new Set<number>()
    const doorOpenTruckIds = new Set<number>()

    fleetArray.forEach((truck: any) => {
      const sensor = truck.sensor
      if (!sensor) return

      const temp = sensor.temperature_c
      const humidityPct = parseFloat(sensor.humidity_pct) || 0

      if (temp > 64.4) tempTruckIds.add(truck.truck_id)
      if (humidityPct > 90) humidityTruckIds.add(truck.truck_id)
      if (sensor.door_open) doorOpenTruckIds.add(truck.truck_id)
    })

    const total =
      tempTruckIds.size + humidityTruckIds.size + doorOpenTruckIds.size

    return {
      total,
      tempTrucks: tempTruckIds.size,
      humidityTrucks: humidityTruckIds.size,
      doorOpenTrucks: doorOpenTruckIds.size,
    }
  }, [fleetArray])

  const alerts = useMemo(
    () => generateAlertsFromData(fleetArray.length ? fleetArray : undefined),
    [fleetArray]
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Telemetry Alerts
      </h1>

      {/* Row 1: Total alerts - full width, red */}
      <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-destructive/80">Total Alerts</p>
              <p className="mt-2 text-4xl font-bold text-destructive">
                {stats.total}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
              <Bell className="h-7 w-7 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 2: Three tiles */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Temperature &gt; 64.4°F
                </p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {stats.tempTrucks}
                </p>
                <p className="text-xs text-muted-foreground">trucks</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <Thermometer className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Humidity &gt; 90%</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {stats.humidityTrucks}
                </p>
                <p className="text-xs text-muted-foreground">trucks</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Droplets className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Door Open</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {stats.doorOpenTrucks}
                </p>
                <p className="text-xs text-muted-foreground">trucks</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                <AlertTriangle className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: All alerts list - no resolve */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">All Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Bell className="h-8 w-8 text-success" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                All Clear
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No alerts at this time
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-start gap-4 rounded-lg border border-border/60 p-4 py-3"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      alert.type === "temp" && "bg-destructive/10",
                      alert.type === "humidity" && "bg-warning/10",
                      alert.type === "door" && "bg-info/10"
                    )}
                  >
                    {alert.type === "temp" && (
                      <Thermometer className="h-5 w-5 text-destructive" />
                    )}
                    {alert.type === "humidity" && (
                      <Droplets className="h-5 w-5 text-warning" />
                    )}
                    {alert.type === "door" && (
                      <AlertTriangle className="h-5 w-5 text-info" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{alert.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {alert.message}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5" />
                        {alert.truck}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {alert.time}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
