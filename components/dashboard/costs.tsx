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
  ChevronDown,
  ChevronUp,
  Thermometer,
  Droplets,
  DoorOpen,
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
  const r = d as Record<string, unknown>
  const best = r.best_action
  if (best != null && String(best).trim() !== "") {
    return String(best).trim()
  }
  return (d.recommended_action ?? "").toString().trim()
}

function getMeanCost(truck: FleetTruckData): number {
  const d = truck.decision
  if (!d) return 0
  return (
    Number((d as Record<string, unknown>).mean_total_cost) ??
    Number((d as Record<string, unknown>).best_mean_cost) ??
    Number(d.mean_cost) ??
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

function getChosenNext(truck: FleetTruckData): number | string {
  const r = truck.decision?.route as Record<string, unknown> | undefined
  const n = truck.gps?.next_node ?? r?.chosen_next ?? r?.next_node
  if (n == null) return "—"
  return Number(n)
}

function getOptionCost(truck: FleetTruckData, action: string): number {
  const val = getOptionCostOrNull(truck, action)
  return val ?? 0
}

function getOptionCostOrNull(truck: FleetTruckData, action: string): number | null {
  const d = truck.decision as Record<string, unknown> | null
  if (!d) return null
  const key =
    action === "continue"
      ? "continue_mean_total"
      : action === "detour"
        ? "detour_mean_total"
        : action === "reroute"
          ? "reroute_mean_total"
          : null
  if (key && d[key] != null) return Number(d[key])
  const actions = (d.all_actions ?? []) as Array<{ action?: string; mean_cost?: number }>
  const match = actions.find((a) => (a.action?.toLowerCase?.() ?? "") === action)
  if (match?.mean_cost != null) return Number(match.mean_cost)
  return null
}

function formatOptionCost(truck: FleetTruckData, action: string): string {
  const val = getOptionCostOrNull(truck, action)
  if (val == null) return "N/A"
  return formatCostFull(val)
}

function getEffectiveChosenAction(
  truck: FleetTruckData,
  riskThreshold: number
): string {
  const bestAction = getBestAction(truck).toLowerCase().trim()
  if (riskThreshold >= 0.5) {
    return bestAction === "continue" || bestAction === "detour" || bestAction === "reroute"
      ? bestAction
      : "continue"
  }
  const costs = [
    { key: "continue", cost: getOptionCostOrNull(truck, "continue") },
    { key: "detour", cost: getOptionCostOrNull(truck, "detour") },
    { key: "reroute", cost: getOptionCostOrNull(truck, "reroute") },
  ].filter((x) => x.cost != null) as { key: string; cost: number }[]
  if (costs.length === 0) return bestAction || "continue"
  const max = costs.reduce((a, b) => (a.cost >= b.cost ? a : b))
  return max.key
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

// ── Summary tiles: Total Cost (row 1) + 3 breakdown tiles (row 2) ────────

function CostSummaryTiles({ summary }: { summary: NonNullable<ReturnType<typeof computeCostMeanSummary>> }) {
  return (
    <div className="w-full space-y-4">
      {/* Row 1: Total Cost - large, full width, light gray background */}
      <div className="rounded-lg bg-muted/50 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-2xl sm:text-3xl font-bold tabular-nums text-foreground">
              {formatCostFull(summary.totalMeanCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Breakdown tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
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
    </div>
  )
}

// ── Truck row with expandable details ────────────────────────────────

function TruckRow({
  truck,
  isExpanded,
  onToggle,
  riskThreshold,
}: {
  truck: FleetTruckData
  isExpanded: boolean
  onToggle: () => void
  riskThreshold: number
}) {
  const bestAction = getBestAction(truck)
  const effectiveAction = getEffectiveChosenAction(truck, riskThreshold)
  const displayedCost = getOptionCostOrNull(truck, effectiveAction) ?? getMeanCost(truck)
  const currentNode = getCurrentNode(truck)
  const chosenNext = getChosenNext(truck)

  const doorOpen = Boolean(truck.sensor?.door_open)
  const humidityPct = Number(truck.sensor?.humidity_pct ?? 0)
  const tempF = Number(truck.sensor?.temperature_c ?? 0)

  const flags: string[] = []
  if (doorOpen) flags.push("door")
  if (humidityPct > 90) flags.push("humid")
  if (tempF > 64.4) flags.push("temp")

  const actionLabel =
    effectiveAction ? ACTION_LABELS[effectiveAction.toLowerCase()] ?? effectiveAction : "—"

  const chosenActionKey = effectiveAction?.toLowerCase?.() ?? "continue"

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full grid-cols-4 items-center gap-4 px-4 py-3 text-left hover:bg-muted/30"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Truck {truck.truck_id}</p>
            <p className="text-[10px] text-muted-foreground">Node {currentNode}</p>
          </div>
        </div>

        <div>
          <Badge variant="outline" className="font-normal">
            {actionLabel}
          </Badge>
        </div>

        <div className="text-left font-semibold tabular-nums text-foreground text-xs">
          {formatCostFull(displayedCost)}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          {flags.length > 0 ? (
            flags.map((f) => (
              <span
                key={f}
                className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive"
              >
                {f}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground/50">—</span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border bg-muted/20 px-4 py-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full px-4">
            {/* Pathway details */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pathway Details
              </p>
              <div className="rounded-md bg-background p-3 text-sm">
                <p>
                  <span className="font-medium">Path:</span>{" "}
                  <span className="tabular-nums">{currentNode}</span> →{" "}
                  <span className="tabular-nums">{chosenNext}</span>
                </p>
                <p className="mt-1">
                  <span className="font-medium">
                    Best action:
                  </span>{" "}
                  {actionLabel}
                </p>
              </div>
            </div>

            {/* Alerts (green if ok, red if alert) */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Alerts
              </p>
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    tempF > 64.4 ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
                  }`}
                >
                  <Thermometer className="h-4 w-4 shrink-0" />
                  <span>
                    temperature: <span className="tabular-nums font-medium">{tempF.toFixed(1)}°F</span>
                    {tempF > 64.4 && " (alert)"}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    humidityPct > 90 ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
                  }`}
                >
                  <Droplets className="h-4 w-4 shrink-0" />
                  <span>
                    humidity: <span className="tabular-nums font-medium">{humidityPct}%</span>
                    {humidityPct > 90 && " (alert)"}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    doorOpen ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
                  }`}
                >
                  <DoorOpen className="h-4 w-4 shrink-0" />
                  <span>
                    door {doorOpen ? "open" : "closed"}
                    {doorOpen && " (alert)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Options and chosen */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Options
              </p>
              <div className="space-y-2">
                {[
                  { key: "continue", label: "Continue" },
                  { key: "detour", label: "Detour" },
                  { key: "reroute", label: "Reroute" },
                ].map(({ key, label }) => {
                  const isChosen = key === chosenActionKey
                  const costStr = formatOptionCost(truck, key)
                  return (
                    <div
                      key={key}
                      className={`rounded-md px-3 py-2 text-sm ${
                        isChosen
                          ? "bg-primary/15 font-medium text-primary ring-1 ring-primary/30"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      <span>{label}</span>{" "}
                      <span className="tabular-nums font-medium">
                        {costStr}
                        {isChosen && " ✓"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Costs page ─────────────────────────────────────────────────

export function Costs() {
  const [riskThreshold, setRiskThreshold] = useState(0.5)
  const [expandedTruckId, setExpandedTruckId] = useState<number | null>(null)

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

      {/* Risk Threshold - choose action highlighting rule */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Risk Threshold
          </p>
          <div
            role="group"
            aria-label="Risk threshold options"
            className="inline-flex rounded-lg bg-muted p-1 gap-1"
          >
            {RISK_OPTIONS.map((opt) => {
              const isActive = riskThreshold === opt.value
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRiskThreshold(opt.value)}
                  className={`flex items-center gap-1.5 rounded-md px-4 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                  aria-pressed={isActive}
                  aria-label={`${opt.label}${isActive ? ", selected" : ""}`}
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
              Per-Truck Breakdown
            </CardTitle>
            <div className="mt-3 grid grid-cols-4 items-center gap-4 px-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <div>Truck</div>
              <div>Action</div>
              <div className="text-left">Mean Cost</div>
              <div>Flags</div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {fleetList.map((truck) => (
              <TruckRow
                key={truck.truck_id}
                truck={truck}
                isExpanded={expandedTruckId === truck.truck_id}
                onToggle={() =>
                  setExpandedTruckId((id) =>
                    id === truck.truck_id ? null : truck.truck_id
                  )
                }
                riskThreshold={riskThreshold}
              />
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
