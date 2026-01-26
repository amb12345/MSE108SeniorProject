"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Truck, AlertTriangle, TrendingUp, TrendingDown, Thermometer, Droplets, Activity, Gauge, DollarSign, TrendingUp as TrendingUpIcon } from "lucide-react"
import { telemetryData, sensorData } from "@/lib/data"
import { FleetMap } from "./fleet-map"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar } from "recharts"

export function Overview() {
  // Helper function to generate alert summaries
  const generateAlertSummary = useMemo(() => {
    const alerts: Array<{ type: string; title: string; truck: string }> = []
    
    // Check for temperature anomalies
    sensorData.forEach((sensor, index) => {
      if (index === 0) return
      const prevSensor = sensorData[index - 1]
      const tempChange = Math.abs(sensor.temperature_f - prevSensor.temperature_f)
      
      if (tempChange > 15 && sensor.temperature_f > 25) {
        alerts.push({
          type: "critical",
          title: "Temperature Anomaly",
          truck: `Truck ${sensor.truck_id}`,
        })
      }
      
      if (sensor.humidity_pct > 90) {
        alerts.push({
          type: "warning",
          title: "High Humidity",
          truck: `Truck ${sensor.truck_id}`,
        })
      }
    })
    
    // Check for speed anomalies
    telemetryData.forEach((telemetry, index) => {
      if (index === 0) return
      const prevTelemetry = telemetryData[index - 1]
      
      if (prevTelemetry.speed > 50 && telemetry.speed < 10 && prevTelemetry.truck_id === telemetry.truck_id) {
        alerts.push({
          type: "warning",
          title: "Sudden Speed Drop",
          truck: `Truck ${telemetry.truck_id}`,
        })
      }
    })
    
    // Group by type
    const critical = alerts.filter(a => a.type === "critical")
    const warnings = alerts.filter(a => a.type === "warning")
    
    return { critical, warnings, all: alerts }
  }, [])

  // Calculate statistics from real data
  const stats = useMemo(() => {
    const uniqueTrucks = new Set(telemetryData.map(t => t.truck_id))
    const totalTrucks = uniqueTrucks.size
    const totalRecords = telemetryData.length
    
    // Calculate average speed
    const speeds = telemetryData.map(t => t.speed).filter(s => s > 0)
    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0
    
    // Calculate active trucks (speed > 0)
    const activeTrucks = new Set(
      telemetryData
        .filter(t => t.speed > 0)
        .map(t => t.truck_id)
    ).size
    
    // Calculate idle trucks (speed === 0)
    const idleTrucks = new Set(
      telemetryData
        .filter(t => t.speed === 0)
        .map(t => t.truck_id)
    ).size
    
    // Calculate temperature statistics
    const temps = sensorData.map(s => s.temperature_f)
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
    const maxTemp = Math.max(...temps)
    const minTemp = Math.min(...temps)
    
    // Count temperature anomalies (spikes > 25°F)
    const tempAnomalies = sensorData.filter((s, i) => {
      if (i === 0) return false
      const prev = sensorData[i - 1]
      return Math.abs(s.temperature_f - prev.temperature_f) > 15 && s.temperature_f > 25
    }).length
    
    // Count high humidity alerts (> 90%)
    const highHumidityAlerts = sensorData.filter(s => s.humidity_pct > 90).length
    
    // Calculate route status (for demonstration, based on truck activity)
    let completedRoutes = 0
    let inProgressRoutes = 0
    const allTruckIds = Array.from(uniqueTrucks)
    let completedTruckIds: number[] = []
    let inProgressTruckIds: number[] = []
    
    if (totalTrucks === 1) {
      inProgressRoutes = 1
      inProgressTruckIds = allTruckIds
    } else if (totalTrucks >= 2) {
      completedRoutes = Math.floor(totalTrucks * 0.4)
      inProgressRoutes = totalTrucks - completedRoutes
      completedTruckIds = allTruckIds.slice(0, completedRoutes)
      inProgressTruckIds = allTruckIds.slice(completedRoutes)
    }
    
    return {
      totalTrucks,
      totalRecords,
      avgSpeed: Math.round(avgSpeed),
      activeTrucks,
      idleTrucks,
      avgTemp: Math.round(avgTemp),
      maxTemp,
      minTemp,
      tempAnomalies,
      highHumidityAlerts,
      totalAlerts: tempAnomalies + highHumidityAlerts,
      completedRoutes,
      inProgressRoutes,
      completedTruckIds,
      inProgressTruckIds,
    }
  }, [])

  // Generate mock cost data
  const costData = useMemo(() => {
    return [
      { name: 'Fuel', value: 45, color: '#3b82f6' },
      { name: 'Maintenance', value: 25, color: '#8b5cf6' },
      { name: 'Labor', value: 20, color: '#06b6d4' },
      { name: 'Other', value: 10, color: '#64748b' },
    ]
  }, [])

  // Generate mock SROI trend data
  const sroiData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      value: 2.5 + Math.random() * 1.5
    }))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      </div>

      {/* Top Row: Status Cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Total Trucks Card */}
        <Card className="relative overflow-hidden border-border shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">{stats.totalTrucks}</p>
                <p className="mt-1 text-xs text-muted-foreground">Active in fleet</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3">
                <Truck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
        </Card>

        {/* Route Status Card - Hoverable */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="relative overflow-hidden border-border shadow-sm transition-all hover:shadow-md cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Route Status</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                      {stats.completedRoutes}/{stats.totalTrucks}
                    </p>
                  </div>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                  {stats.completedRoutes > 0 && (
                    <div 
                      className="bg-success"
                      style={{ width: `${(stats.completedRoutes / stats.totalTrucks) * 100}%` }}
                    />
                  )}
                  {stats.inProgressRoutes > 0 && (
                    <div 
                      className="bg-primary"
                      style={{ width: `${(stats.inProgressRoutes / stats.totalTrucks) * 100}%` }}
                    />
                  )}
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
            </Card>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2">
              <div>
                <p className="font-semibold text-success mb-1">Completed ({stats.completedRoutes})</p>
                <p className="text-xs text-muted-foreground">{stats.completedTruckIds.map(id => `Truck ${id}`).join(', ') || 'None'}</p>
              </div>
              <div>
                <p className="font-semibold text-primary mb-1">In Progress ({stats.inProgressRoutes})</p>
                <p className="text-xs text-muted-foreground">{stats.inProgressTruckIds.map(id => `Truck ${id}`).join(', ')}</p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Alerts Card - Hoverable */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="relative overflow-hidden border-destructive/30 bg-destructive/5 shadow-sm transition-all hover:shadow-md cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-destructive/80">Alerts</p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-destructive">{stats.totalAlerts}</p>
                    <p className="mt-1 text-xs text-destructive/70">Require attention</p>
                  </div>
                  <div className="rounded-xl bg-destructive/20 p-3">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-destructive" />
            </Card>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-2">
              {generateAlertSummary.all.length === 0 ? (
                <p>No active alerts</p>
              ) : (
                <>
                  {generateAlertSummary.critical.length > 0 && (
                    <div>
                      <p className="font-semibold text-destructive mb-1">Critical ({generateAlertSummary.critical.length})</p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {generateAlertSummary.critical.slice(0, 3).map((alert, idx) => (
                          <li key={idx}>{alert.title} - {alert.truck}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {generateAlertSummary.warnings.length > 0 && (
                    <div>
                      <p className="font-semibold text-warning mb-1">Warnings ({generateAlertSummary.warnings.length})</p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {generateAlertSummary.warnings.slice(0, 3).map((alert, idx) => (
                          <li key={idx}>{alert.title} - {alert.truck}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Compact Sensor Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Temperature - Compact */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <Thermometer className="h-4 w-4 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Avg Temp</p>
                <p className="text-lg font-bold text-foreground">{stats.avgTemp}°F</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Range: {stats.minTemp}°F - {stats.maxTemp}°F
            </div>
          </CardContent>
        </Card>

        {/* Humidity - Compact */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-info/10 p-2">
                <Droplets className="h-4 w-4 text-info" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Humidity Alerts</p>
                <p className="text-lg font-bold text-foreground">{stats.highHumidityAlerts}</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Threshold: &gt; 90%
            </div>
          </CardContent>
        </Card>

        {/* Speed - Compact */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Gauge className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Avg Speed</p>
                <p className="text-lg font-bold text-foreground">{stats.avgSpeed} mph</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Across fleet
            </div>
          </CardContent>
        </Card>

        {/* Data Points - Compact */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <Activity className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Data Points</p>
                <p className="text-lg font-bold text-foreground">{stats.totalRecords}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-success">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Live telemetry
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost and SROI Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Cost Breakdown */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-3xl font-bold text-foreground">$12,450</p>
              <p className="text-xs text-muted-foreground">Monthly operating costs</p>
            </div>
            <div className="space-y-2">
              {costData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-sm" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SROI */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">SROI</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-3xl font-bold text-foreground">3.2x</p>
              <p className="text-xs text-muted-foreground">Return on investment</p>
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sroiData}>
                  <defs>
                    <linearGradient id="sroiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    interval={2}
                  />
                  <YAxis hide />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                  labelStyle={{
                    fontSize: '11px',
                    color: 'hsl(var(--foreground))',
                    fontWeight: 'bold',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}x`, 'SROI']}
                />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    fill="url(#sroiGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Map */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Live Fleet Map</CardTitle>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-xs text-success">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FleetMap />
        </CardContent>
      </Card>
    </div>
  )
}
