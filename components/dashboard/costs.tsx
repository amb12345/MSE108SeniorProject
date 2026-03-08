"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Shield,
  Zap,
  Scale,
  Truck,
} from "lucide-react"
import { useFleetData, useAllFleetRows } from "@/hooks/use-fleet-data"
import type { FleetTruckData } from "@/hooks/use-fleet-data"

const ACTION_LABELS: Record<string, string> = {
  continue: "Continue",
  detour: "Detour",
  reroute: "Reroute",
}

const RISK_OPTIONS = [
  { value: 0.25, label: "Risk Averse", icon: Shield },
  { value: 0.50, label: "Risk Neutral", icon: Scale },
  { value: 0.75, label: "Risk Prone", icon: Zap },
]

function formatCostFull(value: number): string {
  return `$${Math.round(value).toLocaleString()}`
}

function getBestAction(truck: FleetTruckData): string {
  const d = truck.decision
  if (!d) return ""
  return (
    (d as Record<string, unknown>).best_action ??
    d.recommended_action ??
    ""
  ).toString().trim()
}

function getMeanCost(truck: FleetTruckData): number {
  const d = truck.decision
  if (!d) return 0
  return (
    Number((d as Record<string, unknown>).best_mean_cost) ??
    Number(d.mean_cost) ??
    Number((d as Record<string, unknown>).mean_total_cost) ??
    0
  )
}

function getCurrentNode(truck: FleetTruckData): number | string {
  const n =
    truck.gps?.current_node ??
    (truck.sensor as Record<string, unknown>)?.current_node
  if (n == null) return "—"
  return Number(n)
}

// ── Cost summary from allRows (matches Home Total Costs) ─────────────────

function computeCostMeanSummary(rows: unknown[]) {
  if (!rows || !Array.isArray(rows)) return null
  let totalMeanCost = 0
  let totalOp = 0
  let totalDelay = 0
  let totalSpoilage = 0
  for (const row of rows) {
    const d = (row as Record<string, unknown>).decision ?? row
    const r = d as Record<string, unknown>
    const rec = (r?.recommended_action ?? r?.best_action ?? "continue")?.toString().toLowerCase?.()
    const meanCost = r?.mean_cost ?? r?.mean_total_cost ?? r?.best_mean_cost ?? 0
    totalMeanCost += Number(meanCost)
    let op = 0
    let del = 0
    let spoil = 0
    if (rec === "continue") {
      op = Number(r?.continue_mean_operating ?? 0)
      del = Number(r?.continue_mean_delay ?? 0)
      spoil = Number(r?.continue_mean_spoilage ?? 0)
    } else if (rec === "reroute") {
      op = Number(r?.reroute_mean_operating ?? 0)
      del = Number(r?.reroute_mean_delay ?? 0)
      spoil = Number(r?.reroute_mean_spoilage ?? 0)
    } else if (rec === "detour") {
      op = Number(r?.detour_mean_operating ?? 0)
      del = Number(r?.detour_mean_delay ?? 0)
      spoil = Number(r?.detour_mean_spoilage ?? 0)
    }
    const hasDirect = op || del || spoil
    if (hasDirect) {
      totalOp += op
      totalDelay += del
      totalSpoilage += spoil
    } else {
      const actions = (r?.all_actions ?? []) as Array<{ action?: string; mean_cost_components?: { operating_travel?: number; delay_service?: number; spoilage?: number } }>
      const chosen = actions.find((a) => (a.action?.toLowerCase?.() ?? a.action) === rec)
      const comp = chosen?.mean_cost_components
      if (comp) {
        totalOp += comp.operating_travel ?? 0
        totalDelay += comp.delay_service ?? 0
        totalSpoilage += comp.spoilage ?? 0
      }
    }
  }
  return { totalMeanCost, totalOp, totalDelay, totalSpoilage }
}

// ── Summary tiles: Total Cost + 3 breakdown tiles ──────────────────────

function CostSummaryTiles({ summary }: { summary: NonNullable<ReturnType<typeof computeCostMeanSummary>> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {formatCostFull(summary.totalMeanCost)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Operating & Travel</p>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {formatCostFull(summary.totalOp)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-2">
              <DollarSign className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delay & Service</p>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {formatCostFull(summary.totalDelay)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-destructive/10 p-2">
              <DollarSign className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Spoilage</p>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {formatCostFull(summary.totalSpoilage)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Truck row (simple, from DB) ──────────────────────────────────────

function TruckRow({ truck }: { truck: FleetTruckData }) {
  const bestAction = getBestAction(truck)
  const meanCost = getMeanCost(truck)
  const currentNode = getCurrentNode(truck)

  const doorOpen = truck.sensor?.door_open ?? false
  const humidityPct = Number(truck.sensor?.humidity_pct ?? 0)
  const tempC = Number(truck.sensor?.temperature_c ?? 0)

  const flags: string[] = []
  if (doorOpen) flags.push("door")
  if (humidityPct > 90) flags.push("humid")
  if (tempC > 64.4) flags.push("temp")

  const actionLabel =
    bestAction ? ACTION_LABELS[bestAction.toLowerCase()] ?? bestAction : "—"

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Truck className="h-4 w-4 text-primary" />
      </div>

      <div className="min-w-[100px]">
        <p className="text-sm font-semibold text-foreground">Truck {truck.truck_id}</p>
        <p className="text-[10px] text-muted-foreground">Node {currentNode}</p>
      </div>

      <Badge variant="outline" className="shrink-0">
        {actionLabel}
      </Badge>

      <div className="ml-auto flex items-center gap-4 text-xs">
        <div className="text-right min-w-[80px]">
          <span className="font-semibold tabular-nums text-foreground">
            {formatCostFull(meanCost)}
          </span>
        </div>
        {flags.length > 0 && (
          <div className="flex items-center gap-1.5 min-w-[100px]">
            {flags.map((f) => (
              <span
                key={f}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Costs page ─────────────────────────────────────────────────

export function Costs() {
  const [riskThreshold, setRiskThreshold] = useState(0.5)

  const { data: fleetData, loading, error } = useFleetData()
  const { data: allRows } = useAllFleetRows(60000)

  const costSummary = useMemo(
    () => computeCostMeanSummary(allRows ?? []),
    [allRows]
  )

  const fleetList = useMemo(() => {
    if (!fleetData) return []
    const arr = Array.isArray(fleetData) ? fleetData : [fleetData]
    return [...arr].sort((a, b) => getMeanCost(b) - getMeanCost(a))
  }, [fleetData])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Optimization
        </h1>
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Loading…
            </div>
          )}
          {!loading && fleetList.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-success">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Data Ready
            </div>
          )}
        </div>
      </div>

      {/* Cost summary tiles: Total Cost + breakdown (matches Home Total Costs) */}
      {costSummary && (
        <CostSummaryTiles summary={costSummary} />
      )}

      {/* Risk Threshold - no Simulations */}
      <Card className="border-border shadow-sm max-w-xl mx-auto">
        <CardContent className="p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Risk Threshold
          </p>
          <div className="inline-flex rounded-lg bg-muted p-1">
            {RISK_OPTIONS.map((opt) => {
              const isActive = riskThreshold === opt.value
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  onClick={() => setRiskThreshold(opt.value)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Per-Truck Cost Breakdown - from DB */}
      {fleetList.length > 0 && (
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold">
              Per-Truck Cost Breakdown
            </CardTitle>
            <div className="mt-3 flex items-center gap-3 px-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <div className="w-8" />
              <div className="min-w-[100px]">Truck</div>
              <div>Action</div>
              <div className="ml-auto flex items-center gap-4">
                <div className="w-[80px] text-right">Mean Cost</div>
                <div className="w-[100px]">Flags</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {fleetList.map((truck) => (
              <TruckRow key={truck.truck_id} truck={truck} />
            ))}
          </CardContent>
        </Card>
      )}

      {!loading && fleetList.length === 0 && !error && (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm text-muted-foreground">
              No truck data available for cost analysis
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
