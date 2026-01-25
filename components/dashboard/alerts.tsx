"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, Clock, Bell, Filter, Truck, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { sensorData, telemetryData } from "@/lib/data"

interface Alert {
  id: string
  type: "critical" | "warning" | "info" | "success"
  title: string
  message: string
  truck: string
  time: string
  acknowledged: boolean
}

// Generate alerts from sensor data anomalies
const generateAlertsFromData = (): Alert[] => {
  const alerts: Alert[] = []
  let alertId = 1

  // Check for temperature anomalies (spikes or drops)
  sensorData.forEach((sensor, index) => {
    if (index === 0) return

    const prevSensor = sensorData[index - 1]
    const tempChange = Math.abs(sensor.temperature_f - prevSensor.temperature_f)

    // Critical: Temperature spike (e.g., > 15°F change)
    if (tempChange > 15 && sensor.temperature_f > 25) {
      const timeAgo = getTimeAgo(sensor.timestamp)
      alerts.push({
        id: `A${String(alertId++).padStart(3, '0')}`,
        type: "critical",
        title: "Temperature Anomaly Detected",
        message: `Temperature spike to ${sensor.temperature_f}°F (${tempChange.toFixed(1)}°F increase) with ${sensor.humidity_pct}% humidity.`,
        truck: `Truck ${sensor.truck_id}`,
        time: timeAgo,
        acknowledged: false,
      })
    }

    // Warning: High humidity (> 90%)
    if (sensor.humidity_pct > 90 && !alerts.some(a => a.truck === `Truck ${sensor.truck_id}` && a.type === "warning" && a.message.includes("High humidity"))) {
      const timeAgo = getTimeAgo(sensor.timestamp)
      alerts.push({
        id: `A${String(alertId++).padStart(3, '0')}`,
        type: "warning",
        title: "High Humidity Alert",
        message: `Humidity at ${sensor.humidity_pct}% - above recommended threshold.`,
        truck: `Truck ${sensor.truck_id}`,
        time: timeAgo,
        acknowledged: false,
      })
    }
  })

  // Check telemetry for speed anomalies
  telemetryData.forEach((telemetry, index) => {
    if (index === 0) return

    const prevTelemetry = telemetryData[index - 1]
    
    // Warning: Sudden speed drop (potential issue)
    if (prevTelemetry.speed > 50 && telemetry.speed < 10 && prevTelemetry.truck_id === telemetry.truck_id) {
      const timeAgo = getTimeAgo(telemetry.timestamp)
      if (!alerts.some(a => a.truck === `Truck ${telemetry.truck_id}` && a.message.includes("Sudden speed drop"))) {
        alerts.push({
          id: `A${String(alertId++).padStart(3, '0')}`,
          type: "warning",
          title: "Sudden Speed Drop",
          message: `Speed dropped from ${prevTelemetry.speed} mph to ${telemetry.speed} mph.`,
          truck: `Truck ${telemetry.truck_id}`,
          time: timeAgo,
          acknowledged: false,
        })
      }
    }

    // Info: Vehicle stopped
    if (telemetry.speed === 0 && prevTelemetry.speed > 0 && prevTelemetry.truck_id === telemetry.truck_id) {
      const timeAgo = getTimeAgo(telemetry.timestamp)
      alerts.push({
        id: `A${String(alertId++).padStart(3, '0')}`,
        type: "info",
        title: "Vehicle Stopped",
        message: `Truck has come to a stop at location ${telemetry.latitude.toFixed(4)}, ${telemetry.longitude.toFixed(4)}.`,
        truck: `Truck ${telemetry.truck_id}`,
        time: timeAgo,
        acknowledged: true,
      })
    }
  })

  return alerts.sort((a, b) => {
    const timeA = sensorData.find(s => s.truck_id.toString() === a.truck.replace('Truck ', ''))?.timestamp || ''
    const timeB = sensorData.find(s => s.truck_id.toString() === b.truck.replace('Truck ', ''))?.timestamp || ''
    return timeB.localeCompare(timeA)
  })
}

const getTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? 's' : ''} ago`
}

const alertsData = generateAlertsFromData()

const alertConfig = {
  critical: {
    icon: XCircle,
    label: "Critical",
    bgClass: "bg-destructive/5 border-destructive/20",
    iconClass: "text-destructive",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/30",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    bgClass: "bg-warning/5 border-warning/20",
    iconClass: "text-warning",
    badgeClass: "bg-warning/10 text-warning border-warning/30",
  },
  info: {
    icon: Info,
    label: "Info",
    bgClass: "bg-info/5 border-info/20",
    iconClass: "text-info",
    badgeClass: "bg-info/10 text-info border-info/30",
  },
  success: {
    icon: CheckCircle,
    label: "Resolved",
    bgClass: "bg-success/5 border-success/20",
    iconClass: "text-success",
    badgeClass: "bg-success/10 text-success border-success/30",
  },
}

export function Alerts() {
  const [alerts, setAlerts] = useState(alertsData)
  const [filter, setFilter] = useState<string>("all")

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true
    if (filter === "unacknowledged") return !alert.acknowledged
    return alert.type === filter
  })

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    )
  }

  const criticalCount = alerts.filter((a) => a.type === "critical" && !a.acknowledged).length
  const warningCount = alerts.filter((a) => a.type === "warning" && !a.acknowledged).length
  const infoCount = alerts.filter((a) => a.type === "info" && !a.acknowledged).length
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Telemetry Alerts</h1>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "w-fit",
            unacknowledgedCount > 0 
              ? "border-destructive/30 bg-destructive/10 text-destructive" 
              : "border-success/30 bg-success/10 text-success"
          )}
        >
          <Bell className="mr-1.5 h-3.5 w-3.5" />
          {unacknowledgedCount} Unread
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{alerts.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-destructive/80">Critical</p>
                <p className="mt-1 text-3xl font-bold text-destructive">{criticalCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-warning/5 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-warning/80">Warnings</p>
                <p className="mt-1 text-3xl font-bold text-warning">{warningCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-success/5 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-success/80">Resolved</p>
                <p className="mt-1 text-3xl font-bold text-success">
                  {alerts.filter((a) => a.acknowledged).length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All", count: alerts.length },
          { id: "unacknowledged", label: "Unread", count: unacknowledgedCount },
          { id: "critical", label: "Critical", count: criticalCount },
          { id: "warning", label: "Warnings", count: warningCount },
          { id: "info", label: "Info", count: infoCount },
        ].map((item) => (
          <Button
            key={item.id}
            variant={filter === item.id ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(item.id)}
            className={cn(
              "gap-2",
              filter === item.id 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            <Badge 
              variant="secondary" 
              className={cn(
                "h-5 px-1.5 text-[10px]",
                filter === item.id ? "bg-primary-foreground/20 text-primary-foreground" : ""
              )}
            >
              {item.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Filter className="h-5 w-5 text-muted-foreground" />
            {filter === "all" ? "All Alerts" : filter.charAt(0).toUpperCase() + filter.slice(1)}
            <span className="text-sm font-normal text-muted-foreground">({filteredAlerts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">All Clear</h3>
              <p className="mt-1 text-sm text-muted-foreground">No alerts match the current filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert, index) => {
                const config = alertConfig[alert.type]
                const Icon = config.icon
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "relative flex flex-col gap-4 rounded-xl border p-4 transition-all sm:flex-row sm:items-start",
                      config.bgClass,
                      alert.acknowledged && "opacity-60"
                    )}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      alert.type === "critical" && "bg-destructive/10",
                      alert.type === "warning" && "bg-warning/10",
                      alert.type === "info" && "bg-info/10",
                      alert.type === "success" && "bg-success/10"
                    )}>
                      <Icon className={cn("h-5 w-5", config.iconClass)} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{alert.title}</p>
                        <Badge variant="outline" className={config.badgeClass}>
                          {config.label}
                        </Badge>
                        {alert.acknowledged && (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
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
                    
                    {/* Action */}
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcknowledge(alert.id)}
                        className="shrink-0 bg-card hover:bg-muted"
                      >
                        <CheckCircle className="mr-1.5 h-4 w-4" />
                        Acknowledge
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
