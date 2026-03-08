"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Truck, AlertTriangle, Thermometer, Droplets, ChevronDown, ChevronUp, DollarSign, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFleetData, useFleetStats, useAllFleetRows } from "@/hooks/use-fleet-data"

interface OverviewProps {
  onNavigate?: (tab: string) => void
}

export function Overview({ onNavigate }: OverviewProps) {
  // Fetch real-time fleet data (latest per truck) and ALL rows for cost/env sums
  const { data: dbFleetData, loading: fleetLoading } = useFleetData(undefined, 60000)
  const { data: allRows, loading: rowsLoading } = useAllFleetRows(60000)
  const { stats: dbStats, loading: statsLoading } = useFleetStats(300000) // Poll every 5 minutes

  const [alertsExpanded, setAlertsExpanded] = useState(false)
  const [costView, setCostView] = useState<"savings" | "mean">("savings")

  // Calculate statistics from real data
  const stats = useMemo(() => {
    if (dbFleetData && Array.isArray(dbFleetData)) {
      // Total Vehicles: count of unique truck_ids from Aiven
      const totalTrucks = new Set(dbFleetData.map((t: any) => t.truck_id)).size
      
      // Route status: Active = current_node != destination_node, Completed = current_node == destination_node
      // Uses gps.current_node and gps.destination_node from Aiven
      const activeTrucks = dbFleetData.filter((truck: any) => {
        const curr = truck.gps?.current_node
        const dest = truck.gps?.destination_node
        return curr != null && dest != null && curr !== dest
      })
      const completedTrucks = dbFleetData.filter((truck: any) => {
        const curr = truck.gps?.current_node
        const dest = truck.gps?.destination_node
        return curr != null && dest != null && curr === dest
      })
      
      const activeRoutes = activeTrucks.length
      const completedRoutes = completedTrucks.length
      const activeTruckIds = activeTrucks.map((t: any) => t.truck_id)
      const completedTruckIds = completedTrucks.map((t: any) => t.truck_id)
      
      // Alerts: temp > 64.4, humidity > 80%, door_open true
      const tempTruckIds = dbFleetData
        .filter((t: any) => t.sensor && t.sensor.temperature_c > 64.4)
        .map((t: any) => t.truck_id)
      const humidityTruckIds = dbFleetData
        .filter((t: any) => t.sensor && parseFloat(t.sensor.humidity_pct) > 90)
        .map((t: any) => t.truck_id)
      const doorOpenTruckIds = dbFleetData
        .filter((t: any) => t.sensor?.door_open)
        .map((t: any) => t.truck_id)

      const tempAnomalies = tempTruckIds.length
      const humidityAlerts = humidityTruckIds.length
      const doorOpenAlerts = doorOpenTruckIds.length
      const totalAlertsCount = tempAnomalies + humidityAlerts + doorOpenAlerts
      
      return {
        totalTrucks,
        totalRecords: dbStats?.counts?.gpsRecords ?? 0,
        avgSpeed: Math.round(dbStats?.averages?.speed_mph || 0),
        activeTrucks: activeRoutes,
        idleTrucks: completedRoutes,
        tempAnomalies,
        humidityAlerts,
        doorOpenAlerts,
        totalAlerts: totalAlertsCount,
        tempTruckIds,
        humidityTruckIds,
        doorOpenTruckIds,
        completedRoutes,
        activeRoutes,
        completedTruckIds,
        activeTruckIds,
      }
    }
    
    return {
      totalTrucks: 0, totalRecords: 0, avgSpeed: 0, activeTrucks: 0, idleTrucks: 0,
      tempAnomalies: 0, humidityAlerts: 0, doorOpenAlerts: 0,
      totalAlerts: 0, tempTruckIds: [] as number[], humidityTruckIds: [] as number[], doorOpenTruckIds: [] as number[],
      completedRoutes: 0, activeRoutes: 0,
      completedTruckIds: [] as number[], activeTruckIds: [] as number[],
    }
  }, [dbFleetData, dbStats])

  // Cost data: SUM over ALL rows (allRows from DB). Backend: flat decisions; Next.js: FleetListEntry with decision nested.
  const costSavingsSummary = useMemo(() => {
    if (!allRows || !Array.isArray(allRows)) return null
    let sumDiffTotal = 0
    let sumDiffOp = 0, sumDiffDelay = 0, sumDiffSpoilage = 0
    for (const row of allRows) {
      const d = row.decision ?? row
      sumDiffTotal += Number(d?.diff_max_min_total_cost ?? 0)

      const actions = d?.all_actions ?? []
      const byAction = Object.fromEntries(
        actions.map((a: any) => [a.action?.toLowerCase?.() ?? a.action, a])
      )
      const cont = byAction["continue"], reroute = byAction["reroute"], detour = byAction["detour"]
      const compC = cont?.mean_cost_components
      const compR = reroute?.mean_cost_components
      const compD = detour?.mean_cost_components
      if (compC && compR && compD) {
        const opC = compC.operating_travel ?? 0, opR = compR.operating_travel ?? 0, opD = compD.operating_travel ?? 0
        const dC = compC.delay_service ?? 0, dR = compR.delay_service ?? 0, dD = compD.delay_service ?? 0
        const sC = compC.spoilage ?? 0, sR = compR.spoilage ?? 0, sD = compD.spoilage ?? 0
        sumDiffOp += Math.max(opC, opR, opD) - Math.min(opC, opR, opD)
        sumDiffDelay += Math.max(dC, dR, dD) - Math.min(dC, dR, dD)
        sumDiffSpoilage += Math.max(sC, sR, sD) - Math.min(sC, sR, sD)
      }
    }
    return {
      sumDiffTotal,
      sumDiffOp,
      sumDiffDelay,
      sumDiffSpoilage,
      hasBreakdown: sumDiffOp + sumDiffDelay + sumDiffSpoilage > 0,
      rowCount: allRows.length,
    }
  }, [allRows])

  const costMeanSummary = useMemo(() => {
    if (!allRows || !Array.isArray(allRows)) return null
    let totalMeanCost = 0, totalOp = 0, totalDelay = 0, totalSpoilage = 0
    for (const row of allRows) {
      const d = row.decision ?? row
      const rec = d?.recommended_action?.toLowerCase?.()
      const actions = d?.all_actions ?? []
      const chosen = actions.find((a: any) => (a.action?.toLowerCase?.() ?? a.action) === rec)
      const meanCost = d?.mean_cost ?? chosen?.mean_cost ?? 0
      totalMeanCost += Number(meanCost)
      const comp = chosen?.mean_cost_components
      if (comp) {
        totalOp += comp.operating_travel ?? 0
        totalDelay += comp.delay_service ?? 0
        totalSpoilage += comp.spoilage ?? 0
      }
    }
    return {
      totalMeanCost,
      totalOp,
      totalDelay,
      totalSpoilage,
      count: allRows.length,
      hasBreakdown: totalOp + totalDelay + totalSpoilage > 0,
    }
  }, [allRows])

  const costDisplayData = useMemo(() => {
    const items = [
      { name: 'Operating & Travel', color: 'hsl(var(--primary))' },
      { name: 'Delay & Service', color: 'hsl(var(--warning))' },
      { name: 'Spoilage', color: 'hsl(var(--destructive))' },
    ]
    if (costView === "savings" && costSavingsSummary && costSavingsSummary.sumDiffTotal > 0) {
      const t = costSavingsSummary.sumDiffTotal
      if (costSavingsSummary.hasBreakdown) {
        return [
          { ...items[0], value: Math.round((costSavingsSummary.sumDiffOp / t) * 100), useGreenBar: true },
          { ...items[1], value: Math.round((costSavingsSummary.sumDiffDelay / t) * 100), useGreenBar: true },
          { ...items[2], value: Math.round((costSavingsSummary.sumDiffSpoilage / t) * 100), useGreenBar: true },
        ]
      }
      return [{ name: 'Total', color: 'hsl(var(--primary))', value: 100, useGreenBar: true }]
    }
    if (costView === "mean" && costMeanSummary && costMeanSummary.totalMeanCost > 0) {
      const t = costMeanSummary.totalMeanCost
      if (costMeanSummary.hasBreakdown) {
        let v0 = Math.round((costMeanSummary.totalOp / t) * 100)
        let v1 = Math.round((costMeanSummary.totalDelay / t) * 100)
        let v2 = Math.round((costMeanSummary.totalSpoilage / t) * 100)
        const sum = v0 + v1 + v2
        const delta = sum - 100
        if (delta !== 0) {
          const idx = [v0, v1, v2].indexOf(Math.max(v0, v1, v2))
          if (idx === 0) v0 = Math.max(0, v0 - delta)
          else if (idx === 1) v1 = Math.max(0, v1 - delta)
          else v2 = Math.max(0, v2 - delta)
        }
        return [
          { ...items[0], value: v0, useGreenBar: true },
          { ...items[1], value: v1, useGreenBar: true },
          { ...items[2], value: v2, useGreenBar: true },
        ]
      }
      return [{ name: 'Total', color: 'hsl(var(--primary))', value: 100, useGreenBar: true }]
    }
    return items.map((c) => ({ ...c, value: 0, useGreenBar: false }))
  }, [costView, costSavingsSummary, costMeanSummary])

  const envSummary = useMemo(() => {
    if (!allRows || !Array.isArray(allRows)) return null
    let sumDiffTotal = 0, envVal = 0, spoilVal = 0
    for (const row of allRows) {
      const d = row.decision ?? row
      sumDiffTotal += Number(d?.diff_max_min_total_cost ?? 0)
      envVal += Number(d?.diff_environmental_value ?? 0)
      spoilVal += Number(d?.diff_env_spoilage_cost ?? 0)
    }
    return { sumDiffTotal, envVal, spoilVal, count: allRows.length }
  }, [allRows])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Home</h1>
        {(fleetLoading || statsLoading || rowsLoading) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading data...
          </div>
        )}
        {!fleetLoading && !statsLoading && dbFleetData && (
          <div className="flex items-center gap-2 text-sm text-success">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Data Loaded
          </div>
        )}
      </div>

      {/* Row 1: Total Vehicles + Route Status - full width */}
      <div className="grid gap-4 grid-cols-2">
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

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="relative overflow-hidden border-border shadow-sm transition-all hover:shadow-md cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Route Status</p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        <span className="text-lg font-bold text-success">{stats.completedRoutes || 0}</span>
                        <span className="text-xs text-muted-foreground">Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full border border-muted-foreground/40 bg-transparent" />
                        <span className="text-lg font-bold text-muted-foreground">{stats.activeRoutes || 0}</span>
                        <span className="text-xs text-muted-foreground">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                  {(stats.completedRoutes || 0) > 0 && (
                    <div
                      className="bg-success shrink-0"
                      style={{ width: `${((stats.completedRoutes || 0) / (stats.totalTrucks || 1)) * 100}%` }}
                    />
                  )}
                  {(stats.activeRoutes || 0) > 0 && (
                    <div
                      className="bg-transparent shrink-0"
                      style={{ width: `${((stats.activeRoutes || 0) / (stats.totalTrucks || 1)) * 100}%` }}
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
      </div>

      {/* Row 2: Alerts - full width, expandable */}
      <div className="space-y-4">
        <Card
          className={cn(
            "relative overflow-hidden border-destructive/30 bg-destructive/5 shadow-sm transition-all hover:shadow-md cursor-pointer",
            alertsExpanded && "border-destructive/50"
          )}
          onClick={() => setAlertsExpanded((p) => !p)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-destructive/80">Alerts</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-destructive">{stats.totalAlerts}</p>
                <p className="mt-1 text-xs text-destructive/70">
                  {alertsExpanded ? "Click to collapse" : "Click to expand"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-destructive/20 p-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                {alertsExpanded ? (
                  <ChevronUp className="h-5 w-5 text-destructive/70" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-destructive/70" />
                )}
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-destructive" />
        </Card>

        {alertsExpanded && (
          <div className="grid gap-4 grid-cols-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border-border shadow-sm overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-destructive/10 p-2">
                        <Thermometer className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Temp &gt; 64.4°F</p>
                        <p className="text-2xl font-bold text-foreground">{stats.tempAnomalies}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold mb-1">Trucks: {stats.tempTruckIds?.length || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.tempTruckIds && stats.tempTruckIds.length > 0
                    ? stats.tempTruckIds.slice(0, 8).map((id) => `Truck ${id}`).join(", ") +
                      (stats.tempTruckIds.length > 8 ? "..." : "")
                    : "None"}
                </p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border-border shadow-sm overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-warning/10 p-2">
                        <Droplets className="h-4 w-4 text-warning" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Humidity &gt; 90%</p>
                        <p className="text-2xl font-bold text-foreground">{stats.humidityAlerts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold mb-1">Trucks: {stats.humidityTruckIds?.length || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.humidityTruckIds && stats.humidityTruckIds.length > 0
                    ? stats.humidityTruckIds.slice(0, 8).map((id) => `Truck ${id}`).join(", ") +
                      (stats.humidityTruckIds.length > 8 ? "..." : "")
                    : "None"}
                </p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border-border shadow-sm overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-destructive/10 p-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Door Open</p>
                        <p className="text-2xl font-bold text-foreground">{stats.doorOpenAlerts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold mb-1">Trucks: {stats.doorOpenTruckIds?.length || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.doorOpenTruckIds && stats.doorOpenTruckIds.length > 0
                    ? stats.doorOpenTruckIds.slice(0, 8).map((id) => `Truck ${id}`).join(", ") +
                      (stats.doorOpenTruckIds.length > 8 ? "..." : "")
                    : "None"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Cost and SROI Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Costs - Toggle: Cost Savings | Mean Costs */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Costs</CardTitle>
              <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                <button
                  type="button"
                  onClick={() => setCostView("savings")}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                    costView === "savings" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Cost Savings
                </button>
                <button
                  type="button"
                  onClick={() => setCostView("mean")}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                    costView === "mean" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Mean Costs
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-3xl font-bold text-foreground">
                {costView === "savings" && costSavingsSummary
                  ? `$${Math.round(costSavingsSummary.sumDiffTotal).toLocaleString()}`
                  : costView === "mean" && costMeanSummary
                  ? `$${Math.round(costMeanSummary.totalMeanCost).toLocaleString()}`
                  : '—'}
              </p>
            </div>
            <div className="space-y-3">
              {costDisplayData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">{item.value}%</span>
                  </div>
                  <div className="relative h-5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                        item.useGreenBar ? "bg-success" : ""
                      )}
                      style={{
                        width: `${item.value}%`,
                        ...(!item.useGreenBar ? { backgroundColor: item.color } : {}),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Environmental Impact</CardTitle>
              <Leaf className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-3xl font-bold text-success">
                {envSummary != null
                  ? `$${envSummary.sumDiffTotal >= 1000 ? `${(envSummary.sumDiffTotal / 1000).toFixed(1)}k` : Math.round(envSummary.sumDiffTotal).toLocaleString()}`
                  : '—'}
              </p>
              {envSummary != null && (
                <p className="text-xs text-muted-foreground mt-1">
                  diff_max_min_total_cost: {envSummary.sumDiffTotal.toLocaleString()} · diff_environmental_value: {envSummary.envVal.toLocaleString()} · diff_env_spoilage_cost: {envSummary.spoilVal.toLocaleString()}
                </p>
              )}
            </div>
            <div className="space-y-3">
              {(() => {
                if (!envSummary) return null
                const items = [
                  { label: 'Environmental Value', value: envSummary.envVal },
                  { label: 'Spoilage Cost Saved', value: envSummary.spoilVal },
                ]
                const total = envSummary.envVal + envSummary.spoilVal
                return items.map((item, idx) => {
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          ${item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value.toFixed(2)}
                        </span>
                      </div>
                      <div className="relative h-5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 bg-success"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
