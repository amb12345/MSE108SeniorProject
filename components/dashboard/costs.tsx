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
  ChevronRight,
  Truck,
  AlertTriangle,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Cell,
  ReferenceLine,
} from "recharts"
import { useCostData, type CostTruckResult } from "@/hooks/use-cost-data"

const ACTION_COLORS: Record<string, string> = {
  continue: "hsl(var(--success))",
  detour: "hsl(var(--warning))",
  reroute: "hsl(var(--info))",
}

const ACTION_LABELS: Record<string, string> = {
  continue: "Continue",
  detour: "Detour",
  reroute: "Reroute",
}

const RISK_OPTIONS = [
  { value: 0.25, label: "25% Safe", icon: Shield, description: "Conservative" },
  { value: 0.50, label: "50% Balanced", icon: Scale, description: "Balanced" },
  { value: 0.75, label: "75% Cheap", icon: Zap, description: "Aggressive" },
]

function formatCost(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${Math.round(value).toLocaleString()}`
}

function formatCostFull(value: number): string {
  return `$${Math.round(value).toLocaleString()}`
}

function formatNum(value: number, decimals = 1): string {
  return value.toFixed(decimals)
}

// ── Mini box-plot chart ─────────────────────────────────────────────

function ActionComparisonChart({ truckData }: { truckData: CostTruckResult }) {
  const chartData = useMemo(() => {
    return Object.entries(truckData.per_action).map(([action, data]) => ({
      action: ACTION_LABELS[action] ?? action,
      actionKey: action,
      range_lower: data.percentiles.p25,
      range_size: data.percentiles.p75 - data.percentiles.p25,
    }))
  }, [truckData])

  return (
    <div className="h-28">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 60, right: 20, top: 5, bottom: 5 }}>
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v: number) => formatCost(v)}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="action"
            tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
            tickLine={false}
            axisLine={false}
            width={55}
          />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "11px",
            }}
            formatter={(value: number, name: string) => [formatCostFull(value), name]}
          />
          <Bar dataKey="range_lower" stackId="box" fill="transparent" />
          <Bar dataKey="range_size" stackId="box" radius={[4, 4, 4, 4]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.actionKey}
                fill={
                  entry.actionKey === truckData.recommended_action
                    ? ACTION_COLORS[entry.actionKey] ?? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground)/0.3)"
                }
              />
            ))}
          </Bar>
          <ReferenceLine x={0} stroke="transparent" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Percentile table ────────────────────────────────────────────────

function PercentileTable({ truckData }: { truckData: CostTruckResult }) {
  const actions = Object.keys(truckData.per_action)
  const pctLabels = [
    { key: "p05", label: "5th (best case)" },
    { key: "p25", label: "25th" },
    { key: "p50", label: "50th (median)" },
    { key: "p75", label: "75th" },
    { key: "p95", label: "95th (worst case)" },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 pr-4 text-left font-medium text-muted-foreground">Percentile</th>
            {actions.map((action) => (
              <th
                key={action}
                className={`py-2 px-3 text-right font-medium ${
                  action === truckData.recommended_action ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {ACTION_LABELS[action] ?? action}
                {action === truckData.recommended_action && (
                  <span className="ml-1 text-[10px] text-success">*</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pctLabels.map(({ key, label }) => {
            const isScoring = truckData.quantile_used === key
            return (
              <tr key={key} className={`border-b border-border/50 ${isScoring ? "bg-primary/5" : ""}`}>
                <td className="py-1.5 pr-4 text-muted-foreground">
                  {label}
                  {isScoring && (
                    <span className="ml-1 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-semibold text-primary">
                      SCORING
                    </span>
                  )}
                </td>
                {actions.map((action) => (
                  <td
                    key={action}
                    className={`py-1.5 px-3 text-right tabular-nums ${
                      action === truckData.recommended_action && isScoring
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatCostFull(
                      truckData.per_action[action].percentiles[key as keyof typeof truckData.per_action[typeof action]["percentiles"]],
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Scenario inputs display ─────────────────────────────────────────

function ScenarioInputs({ inputs }: { inputs: CostTruckResult["inputs"] }) {
  const fields = [
    { label: "Mins above temp", value: formatNum(inputs.minutes_above_temp) },
    { label: "Future violation", value: `${formatNum(inputs.future_violation_if_continue)} min` },
    { label: "Reroute reduction", value: `${formatNum(inputs.reroute_reduction)} min` },
    { label: "Detour repair", value: `${formatNum(inputs.detour_repair_benefit)} min` },
    { label: "Slack", value: `${formatNum(inputs.slack_minutes)} min` },
    { label: "Distance base", value: `${formatNum(inputs.distance_base_miles)} mi` },
    { label: "Delay base", value: `${formatNum(inputs.delay_base_minutes)} min` },
    { label: "Spoilage base", value: `${formatNum(inputs.spoilage_time_base_hours)}h` },
    { label: "Shipment value", value: inputs.shipment_value ? formatCostFull(inputs.shipment_value) : "—" },
    { label: "Door open", value: inputs.door_open ? "Yes" : "No" },
    { label: "High humidity", value: inputs.high_humidity ? "Yes" : "No" },
  ]

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Scenario Inputs</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1.5">
        {fields.map((f) => (
          <div key={f.label} className="flex items-baseline justify-between gap-2 text-xs">
            <span className="text-muted-foreground truncate">{f.label}</span>
            <span className="font-medium tabular-nums text-foreground shrink-0">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Expandable truck list row ───────────────────────────────────────

function TruckListItem({ truck }: { truck: CostTruckResult }) {
  const [expanded, setExpanded] = useState(false)
  const actions = Object.keys(truck.per_action)
  const chosenData = truck.per_action[truck.recommended_action]

  const actionBadgeClass =
    truck.recommended_action === "continue"
      ? "bg-success/15 text-success border-success/30"
      : truck.recommended_action === "reroute"
        ? "bg-info/15 text-info border-info/30"
        : "bg-warning/15 text-warning border-warning/30"

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <div className="text-muted-foreground transition-transform duration-200" style={{ transform: expanded ? "rotate(90deg)" : undefined }}>
          <ChevronRight className="h-4 w-4" />
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Truck className="h-4 w-4 text-primary" />
        </div>

        <div className="min-w-[100px]">
          <p className="text-sm font-semibold text-foreground">Truck {truck.truck_id}</p>
          <p className="text-[10px] text-muted-foreground">Node {truck.node_id}</p>
        </div>

        <Badge className={`shrink-0 ${actionBadgeClass}`}>
          {ACTION_LABELS[truck.recommended_action] ?? truck.recommended_action}
        </Badge>

        <div className="hidden sm:flex items-center gap-4 ml-auto text-xs text-muted-foreground">
          <div className="text-right">
            <span className="text-muted-foreground">Mean </span>
            <span className="font-semibold tabular-nums text-foreground">{formatCost(chosenData.stats.mean)}</span>
          </div>
          <div className="text-right min-w-[100px]">
            <span className="tabular-nums text-muted-foreground">
              {formatCost(chosenData.percentiles.p05)} – {formatCost(chosenData.percentiles.p95)}
            </span>
          </div>
          {truck.inputs.door_open === 1 && <span className="text-destructive">Door</span>}
          {truck.inputs.high_humidity === 1 && <span className="text-info">Humid</span>}
        </div>

        <div className="ml-auto sm:hidden text-right">
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatCost(chosenData.stats.mean)}</p>
          <p className="text-[10px] text-muted-foreground">mean cost</p>
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-border/50 bg-muted/20 px-4 py-4 space-y-5 animate-fade-in">
          {/* Scenario inputs */}
          <ScenarioInputs inputs={truck.inputs} />

          {/* Per-action comparison */}
          <div className="grid gap-2 grid-cols-3">
            {actions.map((action) => {
              const data = truck.per_action[action]
              const isChosen = action === truck.recommended_action
              const fc = data.breakdown_means.fixed_cost
              return (
                <div
                  key={action}
                  className={`rounded-lg border p-3 transition-all ${
                    isChosen ? "border-primary/40 bg-primary/5" : "border-border bg-background"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {ACTION_LABELS[action] ?? action}
                    </span>
                    {isChosen && (
                      <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                        BEST
                      </span>
                    )}
                  </div>
                  <p className={`text-lg font-bold tabular-nums ${isChosen ? "text-foreground" : "text-muted-foreground"}`}>
                    {formatCost(data.stats.mean)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    mean · score {formatCost(data.score)}
                  </p>
                  {fc > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      +{formatCostFull(fc)} fixed
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span>{formatCost(data.percentiles.p05)}</span>
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: isChosen
                            ? ACTION_COLORS[action] ?? "hsl(var(--primary))"
                            : "hsl(var(--muted-foreground))",
                          marginLeft: `${Math.max(0, ((data.percentiles.p25 - data.percentiles.p05) / (data.percentiles.p95 - data.percentiles.p05)) * 100)}%`,
                          width: `${Math.max(5, ((data.percentiles.p75 - data.percentiles.p25) / (data.percentiles.p95 - data.percentiles.p05)) * 100)}%`,
                          opacity: isChosen ? 1 : 0.4,
                        }}
                      />
                    </div>
                    <span>{formatCost(data.percentiles.p95)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chart + Breakdown */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Cost Range (p25–p75)</p>
              <ActionComparisonChart truckData={truck} />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Breakdown — {ACTION_LABELS[truck.recommended_action] ?? truck.recommended_action} (averages)
              </p>
              <div className="space-y-2">
                {[
                  { label: "Operating & Travel", value: chosenData.breakdown_means.operating_travel, color: "hsl(var(--primary))" },
                  { label: "Delay & Service", value: chosenData.breakdown_means.delay_service, color: "hsl(var(--warning))" },
                  { label: "Spoilage", value: chosenData.breakdown_means.spoilage, color: "hsl(var(--destructive))" },
                  ...(chosenData.breakdown_means.fixed_cost > 0
                    ? [{ label: "Fixed Cost", value: chosenData.breakdown_means.fixed_cost, color: "hsl(var(--muted-foreground))" }]
                    : []),
                ].map((item) => {
                  const total =
                    chosenData.breakdown_means.operating_travel +
                    chosenData.breakdown_means.delay_service +
                    chosenData.breakdown_means.spoilage +
                    chosenData.breakdown_means.fixed_cost
                  const pct = total > 0 ? (item.value / total) * 100 : 0
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="font-medium tabular-nums text-foreground">
                          {formatCostFull(item.value)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Rationale */}
          <p className="text-[11px] text-muted-foreground italic">{truck.rationale}</p>

          {/* Percentile table */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Outputs with Different Probabilities</p>
            <PercentileTable truckData={truck} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Fleet summary ───────────────────────────────────────────────────

function FleetSummary({ data }: { data: CostTruckResult[] }) {
  const summary = useMemo(() => {
    if (!data.length) return null

    const actionCounts: Record<string, number> = {}
    let totalMeanCost = 0
    let minMean = Infinity
    let maxMean = -Infinity
    let riskTrucks = 0

    for (const truck of data) {
      const action = truck.recommended_action
      actionCounts[action] = (actionCounts[action] ?? 0) + 1
      const mean = truck.per_action[action].stats.mean
      totalMeanCost += mean
      if (mean < minMean) minMean = mean
      if (mean > maxMean) maxMean = mean
      if (truck.inputs.spoilage_time_base_hours > 3) riskTrucks++
    }

    return {
      totalTrucks: data.length,
      avgMeanCost: totalMeanCost / data.length,
      minMean,
      maxMean,
      actionCounts,
      riskTrucks,
    }
  }, [data])

  if (!summary) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Cost (chosen)</p>
              <p className="text-lg font-bold tabular-nums text-foreground">{formatCostFull(summary.avgMeanCost)}</p>
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
              <p className="text-lg font-bold tabular-nums text-success">{formatCostFull(summary.minMean)}</p>
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
              <p className="text-lg font-bold tabular-nums text-destructive">{formatCostFull(summary.maxMean)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">At-Risk Trucks</p>
              <p className="text-lg font-bold tabular-nums text-warning">{summary.riskTrucks}</p>
              <p className="text-[10px] text-muted-foreground">&gt;3h spoilage exposure</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Action distribution bar ─────────────────────────────────────────

function ActionDistribution({ data }: { data: CostTruckResult[] }) {
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const t of data) c[t.recommended_action] = (c[t.recommended_action] ?? 0) + 1
    return c
  }, [data])

  const total = data.length
  if (!total) return null

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 h-3 overflow-hidden rounded-full bg-muted">
        {Object.entries(counts).map(([action, count]) => (
          <div
            key={action}
            style={{
              width: `${(count / total) * 100}%`,
              backgroundColor: ACTION_COLORS[action] ?? "hsl(var(--primary))",
            }}
            title={`${ACTION_LABELS[action] ?? action}: ${count}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs">
        {Object.entries(counts).map(([action, count]) => (
          <div key={action} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: ACTION_COLORS[action] ?? "hsl(var(--primary))" }}
            />
            <span className="text-muted-foreground">
              {ACTION_LABELS[action] ?? action}: <span className="font-medium text-foreground">{count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Costs page ─────────────────────────────────────────────────

export function Costs() {
  const [riskThreshold, setRiskThreshold] = useState(0.50)
  const [simCount, setSimCount] = useState(20_000)
  const [showSimInput, setShowSimInput] = useState(false)

  const { data, loading, error } = useCostData(riskThreshold, simCount)

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aMean = a.per_action[a.recommended_action]?.stats.mean ?? 0
      const bMean = b.per_action[b.recommended_action]?.stats.mean ?? 0
      return bMean - aMean
    })
  }, [data])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Optimization</h1>
          <p className="text-sm text-muted-foreground">
            Monte Carlo decision engine — {data.length} trucks · continue / reroute / detour
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Computing…
            </div>
          )}
          {!loading && data.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-success">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Analysis Ready
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Risk Threshold</p>
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
                      <span className="hidden sm:inline">{opt.label}</span>
                      <span className="sm:hidden">{opt.description}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSimInput(!showSimInput)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSimInput ? "Hide" : "Simulations:"} {simCount.toLocaleString()}
              </button>
              {showSimInput && (
                <input
                  type="number"
                  value={simCount}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    if (v > 0 && v <= 100_000) setSimCount(v)
                  }}
                  className="w-24 rounded-md border border-border bg-background px-2 py-1 text-xs tabular-nums"
                  min={1000}
                  max={100000}
                  step={1000}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {data.length > 0 && (
        <>
          <FleetSummary data={data} />

          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Recommended Action Distribution
              </p>
              <ActionDistribution data={data} />
            </CardContent>
          </Card>
        </>
      )}

      {/* Truck list */}
      {sortedData.length > 0 && (
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-0 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Per-Truck Cost Breakdown</CardTitle>
              <span className="text-xs text-muted-foreground">{sortedData.length} trucks · click to expand</span>
            </div>
            <div className="mt-3 flex items-center gap-3 px-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <div className="w-4" />
              <div className="w-8" />
              <div className="min-w-[100px]">Truck</div>
              <div>Action</div>
              <div className="hidden sm:flex items-center gap-4 ml-auto">
                <div className="w-[70px] text-right">Mean</div>
                <div className="w-[100px] text-right">Range</div>
                <div className="w-[80px]">Flags</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {sortedData.map((truck) => (
              <TruckListItem key={truck.truck_id} truck={truck} />
            ))}
          </CardContent>
        </Card>
      )}

      {!loading && data.length === 0 && !error && (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm text-muted-foreground">No truck data available for cost analysis</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
