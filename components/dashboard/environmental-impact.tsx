"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Leaf,
  Truck,
  ChevronRight,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts"
import { useAllFleetRows } from "@/hooks/use-fleet-data"
import {
  computeEnvDiffsSummary,
  computeEnvDiffsForRow,
} from "@/lib/compute-env-diffs"
import { cn } from "@/lib/utils"

// ── Helpers ──────────────────────────────────────────────────────────

const fmt$ = (v: number) => `$${Math.round(v).toLocaleString()}`

const BAR_GREEN = "#22c55e"

export interface TruckEnvRow {
  truck_id: number
  best_action: string
  diff_env_cost_2: number
  diff_environmental_value: number
  diff_env_spoilage_cost: number
}

// ── Per-truck expandable row ─────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  continue: "Continue",
  reroute: "Reroute",
  detour: "Detour",
}

function TruckRow({ truck }: { truck: TruckEnvRow }) {
  const [open, setOpen] = useState(false)
  const hasSavings = truck.diff_env_cost_2 > 0

  const actionLabel =
    truck.best_action
      ? ACTION_LABELS[truck.best_action.toLowerCase()] ?? truck.best_action
      : "—"

  const contributionData = [
    {
      name: "Environmental Value",
      value: Math.max(0, truck.diff_environmental_value),
      color: BAR_GREEN,
    },
    {
      name: "Spoilage Cost",
      value: Math.max(0, truck.diff_env_spoilage_cost),
      color: BAR_GREEN,
    },
  ]

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
          open ? "bg-muted/50" : "hover:bg-muted/30"
        )}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90"
          )}
        />
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
          <Truck className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="min-w-[100px]">
          <p className="text-sm font-semibold text-foreground">
            Truck {truck.truck_id}
          </p>
        </div>

        {/* Best next action */}
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            {actionLabel}
          </Badge>
        </div>

        {/* Value on the right */}
        <div className="hidden sm:flex items-center gap-5 ml-auto text-xs text-muted-foreground">
          <div className="text-right min-w-[70px]">
            <span className="text-muted-foreground">Value </span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                hasSavings ? "text-success" : "text-muted-foreground"
              )}
            >
              {fmt$(truck.diff_env_cost_2)}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded: SUSTAINABILITY VALUE BREAKDOWN */}
      {open && (
        <div className="border-t border-border bg-card p-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Sustainability Value Breakdown
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">
                  Total
                </span>
                <span className="text-lg font-bold tabular-nums text-foreground">
                  {fmt$(truck.diff_env_cost_2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Environmental Value
                </span>
                <span className="text-sm font-semibold tabular-nums text-success">
                  {fmt$(truck.diff_environmental_value)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Spoilage Cost
                </span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {fmt$(truck.diff_env_spoilage_cost)}
                </span>
              </div>
            </div>
          </div>

          {/* Bar chart breakdown */}
          <div className="h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributionData} layout="vertical" barSize={18}>
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => fmt$(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  formatter={(value: number) => [fmt$(value), "Value"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {contributionData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main tab component ───────────────────────────────────────────────

function getTs(row: Record<string, unknown>): string {
  const ts =
    row.ts ??
    (row.gps as Record<string, unknown>)?.timestamp ??
    (row.sensor as Record<string, unknown>)?.timestamp ??
    ""
  return String(ts)
}

function getBestAction(row: Record<string, unknown>): string {
  const d = row.decision ?? row
  const r = d as Record<string, unknown>
  const v =
    r.best_action ??
    r.recommended_action ??
    row.best_action ??
    row.recommended_action
  if (v == null) return ""
  return String(v).trim() || ""
}

export function EnvironmentalImpact() {
  const { data: allRows, loading: rowsLoading } = useAllFleetRows(60000)

  const envSummary = useMemo(() => {
    if (!allRows || !Array.isArray(allRows)) return null
    return computeEnvDiffsSummary(allRows)
  }, [allRows])

  // Group allRows by truck_id: sum diffs from all rows, use latest row for current_node/chosen_next
  const truckList = useMemo((): TruckEnvRow[] => {
    if (!allRows || !Array.isArray(allRows)) return []
    const byTruck = new Map<
      number,
      {
        diff_env_cost_2: number
        diff_environmental_value: number
        diff_env_spoilage_cost: number
        latestRow: Record<string, unknown>
      }
    >()
    for (const row of allRows) {
      const raw = row as Record<string, unknown>
      const tid = Number(raw.truck_id)
      if (!Number.isFinite(tid)) continue
      const diffs = computeEnvDiffsForRow(raw)
      const existing = byTruck.get(tid)
      const ts = getTs(raw)
      const newSum = {
        diff_env_cost_2: (existing?.diff_env_cost_2 ?? 0) + diffs.diff_env_cost_2,
        diff_environmental_value:
          (existing?.diff_environmental_value ?? 0) + diffs.diff_environmental_value,
        diff_env_spoilage_cost:
          (existing?.diff_env_spoilage_cost ?? 0) + diffs.diff_env_spoilage_cost,
        latestRow:
          !existing || ts > getTs(existing.latestRow) ? raw : existing.latestRow,
      }
      byTruck.set(tid, newSum)
    }
    return Array.from(byTruck.entries())
      .map(([truck_id, agg]) => ({
        truck_id,
        best_action: getBestAction(agg.latestRow),
        diff_env_cost_2: agg.diff_env_cost_2,
        diff_environmental_value: agg.diff_environmental_value,
        diff_env_spoilage_cost: agg.diff_env_spoilage_cost,
      }))
      .sort((a, b) => b.diff_env_cost_2 - a.diff_env_cost_2)
  }, [allRows])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Environmental Impact
        </h1>
      </div>

      {/* Loading skeleton */}
      {(rowsLoading || !envSummary) && (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border shadow-sm animate-pulse">
              <CardContent className="p-5 h-24" />
            </Card>
          ))}
        </div>
      )}

      {/* Top tile: diff_env_cost_2 */}
      {envSummary && (
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Environmental Cost Difference
                </p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-success">
                  {fmt$(envSummary.diff_env_cost_2)}
                </p>
              </div>
              <div className="rounded-xl bg-success/10 p-3">
                <Leaf className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Second row: diff_environmental_value and diff_env_spoilage_cost */}
      {envSummary && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Environmental Value
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                    {fmt$(envSummary.diff_environmental_value)}
                  </p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5">
                  <Leaf className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Spoilage Cost
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                    {fmt$(envSummary.diff_env_spoilage_cost)}
                  </p>
                </div>
                <div className="rounded-xl bg-success/10 p-2.5">
                  <Leaf className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Total Value Saved per Truck */}
      {!rowsLoading && truckList.length > 0 && (
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Environmental Cost Difference per Truck
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={truckList.map((t) => ({
                    name: `T${t.truck_id}`,
                    value: t.diff_env_cost_2,
                  }))}
                  barSize={16}
                >
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={45}
                    tickFormatter={(v: number) => fmt$(v)}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                    formatter={(value: number) => [fmt$(value), "Value"]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={BAR_GREEN}>
                    {truckList.map((t, idx) => (
                      <Cell key={idx} fill={BAR_GREEN} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-truck list */}
      {!rowsLoading && truckList.length > 0 && (
        <div>
          <div className="flex items-center gap-3 px-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
            <div className="w-4" />
            <div className="w-8" />
            <div className="min-w-[100px]">Truck</div>
            <div>Best Next Action</div>
            <div className="hidden sm:flex items-center gap-5 ml-auto">
              <div className="w-[70px] text-right">Value</div>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            {truckList.map((truck) => (
              <TruckRow key={truck.truck_id} truck={truck} />
            ))}
          </div>
        </div>
      )}

      {!rowsLoading && truckList.length === 0 && (
        <Card className="border-border shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">
            No fleet data available to compute environmental impact.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
