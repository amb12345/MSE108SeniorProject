"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Shield,
  Zap,
  Scale,
  Truck,
} from "lucide-react"
import { useFleetData } from "@/hooks/use-fleet-data"
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

// ── Summary cards (Avg, Lowest, Highest Mean) ─────────────────────────

function SummaryCards({
  data,
}: {
  data: FleetTruckData[]
}) {
  const { avgMeanCost, minMean, maxMean } = useMemo(() => {
    if (!data.length) return { avgMeanCost: 0, minMean: 0, maxMean: 0 }
    let sum = 0
    let min = Infinity
    let max = -Infinity
    for (const t of data) {
      const m = getMeanCost(t)
      sum += m
      if (m < min) min = m
      if (m > max) max = m
    }
    return {
      avgMeanCost: sum / data.length,
      minMean: min === Infinity ? 0 : min,
      maxMean: max === -Infinity ? 0 : max,
    }
  }, [data])

  return (
    <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Cost (chosen)</p>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {formatCostFull(avgMeanCost)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2">
              <TrendingDown className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lowest Mean</p>
              <p className="text-lg font-bold tabular-nums text-success">
                {formatCostFull(minMean)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-destructive/10 p-2">
              <TrendingUp className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Highest Mean</p>
              <p className="text-lg font-bold tabular-nums text-destructive">
                {formatCostFull(maxMean)}
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

      {/* Summary cards at top - centered */}
      {fleetList.length > 0 && (
        <SummaryCards data={fleetList} />
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
