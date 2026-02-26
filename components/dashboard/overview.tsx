"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Truck, AlertTriangle, TrendingUp, TrendingDown, Thermometer, Droplets, Activity, Gauge, DollarSign, TrendingUp as TrendingUpIcon } from "lucide-react"
import { telemetryData, sensorData } from "@/lib/data"
import { FleetMap } from "./fleet-map"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar } from "recharts"
import { useFleetData, useFleetStats } from "@/hooks/use-fleet-data"
import { DATA_SOURCE } from "@/lib/use-data-source"

interface OverviewProps {
  onNavigate?: (tab: string) => void
}

export function Overview({ onNavigate }: OverviewProps) {
  // Fetch real-time fleet data from database (polls every 60 seconds)
  const { data: dbFleetData, loading: fleetLoading } = useFleetData(undefined, 60000)
  const { stats: dbStats, loading: statsLoading } = useFleetStats(300000) // Poll every 5 minutes

  // Helper function to generate alert summaries
  const generateAlertSummary = useMemo(() => {
    const alerts: Array<{ type: string; title: string; truck: string }> = []
    
    // Use database data if available
    if (DATA_SOURCE === 'database' && dbFleetData && Array.isArray(dbFleetData)) {
      dbFleetData.forEach((truck: any) => {
        const sensor = truck.sensor
        if (!sensor) return
        
        // Temperature alerts (> 64.4°F)
        if (sensor.temperature_c > 64.4) {
          alerts.push({
            type: "critical",
            title: `High Temperature: ${sensor.temperature_c.toFixed(1)}°F`,
            truck: `Truck ${truck.truck_id}`,
          })
        }
        
        // Humidity alerts
        if (sensor.humidity_pct >= 90) {
          alerts.push({
            type: "critical",
            title: `Critical Humidity: ${sensor.humidity_pct.toFixed(1)}%`,
            truck: `Truck ${truck.truck_id}`,
          })
        } else if (sensor.humidity_pct >= 80) {
          alerts.push({
            type: "warning",
            title: `High Humidity: ${sensor.humidity_pct.toFixed(1)}%`,
            truck: `Truck ${truck.truck_id}`,
          })
        }
        
        // Door open alert
        if (sensor.door_open) {
          alerts.push({
            type: "warning",
            title: "Door Open",
            truck: `Truck ${truck.truck_id}`,
          })
        }
        
        // Speed alerts
        const gps = truck.gps
        if (gps && gps.speed_mph < 5 && !truck.sensor?.at_node) {
          alerts.push({
            type: "warning",
            title: "Vehicle Stopped",
            truck: `Truck ${truck.truck_id}`,
          })
        }
      })
    } else {
      // Fall back to mock data
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
    }
    
    // Group by type
    const critical = alerts.filter(a => a.type === "critical")
    const warnings = alerts.filter(a => a.type === "warning")
    
    return { critical, warnings, all: alerts }
  }, [dbFleetData])

  // Calculate statistics from real data
  const stats = useMemo(() => {
    // Use database data if available
    if (DATA_SOURCE === 'database' && dbFleetData && Array.isArray(dbFleetData) && dbStats) {
      const totalTrucks = dbStats.counts.trucks
      
      // Calculate route status based on decision data
      // Priority: Check recommended_action FIRST (from decision_data table)
      // Completed: at_node = true (from GPS data)
      // Active (green): not at_node and recommended_action = "continue"
      // Detour (yellow): not at_node and recommended_action = "reroute" or "detour"
      
      const completedTrucks = dbFleetData.filter((truck: any) => 
        truck.gps?.at_node === true
      )
      
      const activeTrucks = dbFleetData.filter((truck: any) => 
        truck.gps?.at_node !== true &&
        truck.decision?.recommended_action === 'continue'
      )
      
      const detourTrucks = dbFleetData.filter((truck: any) => 
        truck.gps?.at_node !== true &&
        (truck.decision?.recommended_action === 'reroute' || 
         truck.decision?.recommended_action === 'detour')
      )
      
      const activeRoutes = activeTrucks.length
      const detourRoutes = detourTrucks.length
      const completedRoutes = completedTrucks.length
      const activeTruckIds = activeTrucks.map((t: any) => t.truck_id)
      const detourTruckIds = detourTrucks.map((t: any) => t.truck_id)
      const completedTruckIds = completedTrucks.map((t: any) => t.truck_id)
      
      // Count critical humidity alerts (>= 90%)
      const criticalHumidityAlerts = dbFleetData.filter((truck: any) => 
        truck.sensor && truck.sensor.humidity_pct >= 90
      ).length
      
      // Count warning humidity alerts (>= 80% but < 90%)
      const warningHumidityAlerts = dbFleetData.filter((truck: any) => 
        truck.sensor && truck.sensor.humidity_pct >= 80 && truck.sensor.humidity_pct < 90
      ).length
      
      const highHumidityAlerts = criticalHumidityAlerts + warningHumidityAlerts
      
      // Count temperature alerts (> 64.4°F)
      const tempAnomalies = dbFleetData.filter((truck: any) => 
        truck.sensor && truck.sensor.temperature_c > 64.4
      ).length
      
      // Count door open alerts
      const doorOpenAlerts = dbFleetData.filter((t: any) => t.sensor?.door_open).length
      
      // Calculate actual avg temp (no conversion needed - already in F)
      const avgTempF = Math.round(dbStats.averages.temperature_c || 0)
      
      return {
        totalTrucks,
        totalRecords: dbStats.counts.gpsRecords,
        avgSpeed: Math.round(dbStats.averages.speed_mph || 0),
        activeTrucks: activeRoutes,
        idleTrucks: completedRoutes,
        avgTemp: avgTempF,
        maxTemp: avgTempF + 15, // Approximate
        minTemp: avgTempF - 15, // Approximate
        tempAnomalies,
        highHumidityAlerts,
        criticalHumidityAlerts,
        warningHumidityAlerts,
        totalAlerts: tempAnomalies + highHumidityAlerts + doorOpenAlerts,
        completedRoutes,
        activeRoutes,
        detourRoutes,
        inProgressRoutes: activeRoutes + detourRoutes,
        completedTruckIds,
        activeTruckIds,
        detourTruckIds,
        inProgressTruckIds: [...activeTruckIds, ...detourTruckIds],
      }
    }
    
    // Fall back to mock data
    const uniqueTrucks = new Set(telemetryData.map(t => t.truck_id))
    const totalTrucks = uniqueTrucks.size
    const totalRecords = telemetryData.length
    
    const speeds = telemetryData.map(t => t.speed).filter(s => s > 0)
    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0
    
    const activeTrucks = new Set(
      telemetryData.filter(t => t.speed > 0).map(t => t.truck_id)
    ).size
    
    const idleTrucks = new Set(
      telemetryData.filter(t => t.speed === 0).map(t => t.truck_id)
    ).size
    
    const temps = sensorData.map(s => s.temperature_f)
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
    const maxTemp = Math.max(...temps)
    const minTemp = Math.min(...temps)
    
    const tempAnomalies = sensorData.filter((s, i) => {
      if (i === 0) return false
      const prev = sensorData[i - 1]
      return Math.abs(s.temperature_f - prev.temperature_f) > 15 && s.temperature_f > 25
    }).length
    
    const highHumidityAlerts = sensorData.filter(s => s.humidity_pct > 90).length
    
    let completedRoutes = 0
    let activeRoutes = 0
    let detourRoutes = 0
    const allTruckIds = Array.from(uniqueTrucks)
    let completedTruckIds: number[] = []
    let activeTruckIds: number[] = []
    let detourTruckIds: number[] = []
    
    if (totalTrucks === 1) {
      activeRoutes = 1
      activeTruckIds = allTruckIds
    } else if (totalTrucks >= 2) {
      completedRoutes = Math.floor(totalTrucks * 0.4)
      activeRoutes = Math.floor(totalTrucks * 0.5)
      detourRoutes = totalTrucks - completedRoutes - activeRoutes
      completedTruckIds = allTruckIds.slice(0, completedRoutes)
      activeTruckIds = allTruckIds.slice(completedRoutes, completedRoutes + activeRoutes)
      detourTruckIds = allTruckIds.slice(completedRoutes + activeRoutes)
    }
    
    // Split humidity alerts for mock data
    const criticalHumidityAlerts = sensorData.filter(s => s.humidity_pct >= 90).length
    const warningHumidityAlerts = sensorData.filter(s => s.humidity_pct >= 80 && s.humidity_pct < 90).length
    
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
      criticalHumidityAlerts,
      warningHumidityAlerts,
      totalAlerts: tempAnomalies + highHumidityAlerts,
      completedRoutes,
      activeRoutes,
      detourRoutes,
      inProgressRoutes: activeRoutes + detourRoutes,
      completedTruckIds,
      activeTruckIds,
      detourTruckIds,
      inProgressTruckIds: [...activeTruckIds, ...detourTruckIds],
    }
  }, [dbFleetData, dbStats])

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        {DATA_SOURCE === 'database' && (fleetLoading || statsLoading) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading real-time data...
          </div>
        )}
        {DATA_SOURCE === 'database' && !fleetLoading && !statsLoading && (
          <div className="flex items-center gap-2 text-sm text-success">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Connected to Database
          </div>
        )}
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
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Route Status</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success"></div>
                        <span className="text-lg font-bold text-success">{stats.activeRoutes || 0}</span>
                        <span className="text-xs text-muted-foreground">Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-warning"></div>
                        <span className="text-lg font-bold text-warning">{stats.detourRoutes || 0}</span>
                        <span className="text-xs text-muted-foreground">Detour</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{stats.completedRoutes || 0} Completed</p>
                  </div>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                  {(stats.activeRoutes || 0) > 0 && (
                    <div 
                      className="bg-success"
                      style={{ width: `${((stats.activeRoutes || 0) / stats.totalTrucks) * 100}%` }}
                    />
                  )}
                  {(stats.detourRoutes || 0) > 0 && (
                    <div 
                      className="bg-warning"
                      style={{ width: `${((stats.detourRoutes || 0) / stats.totalTrucks) * 100}%` }}
                    />
                  )}
                  {(stats.completedRoutes || 0) > 0 && (
                    <div 
                      className="bg-muted-foreground/30"
                      style={{ width: `${((stats.completedRoutes || 0) / stats.totalTrucks) * 100}%` }}
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
                <p className="font-semibold text-success mb-1">Active ({stats.activeRoutes || 0})</p>
                <p className="text-xs text-muted-foreground">
                  {stats.activeTruckIds && stats.activeTruckIds.length > 0 
                    ? stats.activeTruckIds.slice(0, 10).map((id: number) => `Truck ${id}`).join(', ') + (stats.activeTruckIds.length > 10 ? '...' : '')
                    : 'None'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-warning mb-1">Detour ({stats.detourRoutes || 0})</p>
                <p className="text-xs text-muted-foreground">
                  {stats.detourTruckIds && stats.detourTruckIds.length > 0 
                    ? stats.detourTruckIds.slice(0, 10).map((id: number) => `Truck ${id}`).join(', ') + (stats.detourTruckIds.length > 10 ? '...' : '')
                    : 'None'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground mb-1">Completed ({stats.completedRoutes || 0})</p>
                <p className="text-xs text-muted-foreground">
                  {stats.completedTruckIds && stats.completedTruckIds.length > 0 
                    ? stats.completedTruckIds.slice(0, 10).map((id: number) => `Truck ${id}`).join(', ') + (stats.completedTruckIds.length > 10 ? '...' : '')
                    : 'None'}
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Alerts Card - Hoverable */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card 
              className="relative overflow-hidden border-destructive/30 bg-destructive/5 shadow-sm transition-all hover:shadow-md cursor-pointer"
              onClick={() => onNavigate?.('telemetry')}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-destructive/80">Alerts</p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-destructive">{stats.totalAlerts}</p>
                    <p className="mt-1 text-xs text-destructive/70">Click to view all</p>
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
            <div className="mt-2 flex flex-col gap-0.5">
              <div className="text-xs text-muted-foreground">
                Range: {stats.minTemp}°F - {stats.maxTemp}°F
              </div>
              {stats.tempAnomalies > 0 && (
                <div className="text-xs text-destructive">
                  {stats.tempAnomalies} above 64.4°F
                </div>
              )}
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
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-lg font-bold text-destructive">{stats.criticalHumidityAlerts || 0}</p>
                  <span className="text-xs text-muted-foreground">Critical</span>
                  <p className="text-lg font-bold text-warning">{stats.warningHumidityAlerts || 0}</p>
                  <span className="text-xs text-muted-foreground">Warning</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              ≥90% critical, ≥80% warning
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
                <p className="text-lg font-bold text-foreground">{stats.totalRecords.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-success">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              {DATA_SOURCE === 'database' && !statsLoading ? 'Live from DB' : 'Live telemetry'}
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
