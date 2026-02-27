"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Leaf,
  Truck,
  TrendingDown,
  DollarSign,
  ChevronRight,
  Gauge,
  Settings2,
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
import {
  useEnvironmentalData,
  type TruckEnvironmentalImpact,
} from "@/hooks/use-environmental-data"
import { cn } from "@/lib/utils"
import { EPA_CARBON_MULTIPLIER, DEFAULT_CARGO_TONS } from "@/lib/environmental-engine"

// ── Helpers ──────────────────────────────────────────────────────────

const fmt$ = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(2)}`

const fmtTonnes = (v: number) =>
  v >= 1 ? `${v.toFixed(2)} t` : `${(v * 1000).toFixed(1)} kg`

const ACTION_LABELS: Record<string, string> = {
  continue: "Continue",
  reroute: "Reroute",
  detour: "Detour",
}

const ACTION_COLORS: Record<string, string> = {
  continue: "hsl(var(--success))",
  reroute: "hsl(var(--info))",
  detour: "hsl(var(--warning))",
}

// ── Summary Card ─────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  sub: string
  icon: React.ElementType
  color: string
}) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
          </div>
          <div className={cn("rounded-xl p-2.5", `bg-${color}/10`)}>
            <Icon className={cn("h-5 w-5", `text-${color}`)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Per-truck expandable row ─────────────────────────────────────────

function TruckRow({ truck }: { truck: TruckEnvironmentalImpact }) {
  const [open, setOpen] = useState(false)
  const hasSavings = truck.total_sustainability_value > 0

  const contributionData = [
    {
      name: "Environmental",
      value: Math.max(0, truck.environmental_value),
      color: "hsl(var(--success))",
    },
    {
      name: "Spoilage Saved",
      value: Math.max(0, truck.expected_spoilage_cost_saved),
      color: "hsl(var(--primary))",
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
          <p className="text-[10px] text-muted-foreground">
            Node {truck.node_id}
          </p>
        </div>

        {/* Action badges */}
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="text-[10px] bg-muted/50 border-border"
          >
            {ACTION_LABELS[truck.baseline_action] ?? truck.baseline_action}
          </Badge>
          <span className="text-muted-foreground text-xs">→</span>
          <Badge
            variant="outline"
            className="text-[10px]"
            style={{
              borderColor: ACTION_COLORS[truck.chosen_action],
              color: ACTION_COLORS[truck.chosen_action],
            }}
          >
            {ACTION_LABELS[truck.chosen_action] ?? truck.chosen_action}
          </Badge>
        </div>

        {/* Key metrics on the right */}
        <div className="hidden sm:flex items-center gap-5 ml-auto text-xs text-muted-foreground">
          <div className="text-right">
            <span className="text-muted-foreground">CO₂ </span>
            <span className="font-semibold tabular-nums text-foreground">
              {fmtTonnes(truck.total_tonnes_carbon_saved)}
            </span>
          </div>
          <div className="text-right min-w-[70px]">
            <span className="text-muted-foreground">Value </span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                hasSavings ? "text-success" : "text-muted-foreground"
              )}
            >
              {fmt$(truck.total_sustainability_value)}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded detail panel */}
      {open && (
        <div className="border-t border-border bg-card p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Left: Distance & Ton-miles */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Distance & Cargo
              </h4>
              <div className="space-y-2">
                <Metric
                  label="Distance Saved"
                  value={`${truck.distance_saved.toFixed(1)} mi`}
                />
                <Metric
                  label="Ton-Miles Saved"
                  value={`${truck.ton_miles_saved.toFixed(1)}`}
                />
                <Metric
                  label="Cargo Weight"
                  value={`${truck.assumptions.cargo_tons} tons`}
                />
              </div>
            </div>

            {/* Middle: Carbon & Environmental */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Carbon & Environmental
              </h4>
              <div className="space-y-2">
                <Metric
                  label="CO₂ Saved"
                  value={fmtTonnes(truck.total_tonnes_carbon_saved)}
                />
                <Metric
                  label="Environmental Value"
                  value={fmt$(truck.environmental_value)}
                  highlight="success"
                />
                <Metric
                  label="Spoilage Cost Saved"
                  value={fmt$(truck.expected_spoilage_cost_saved)}
                  highlight="primary"
                />
              </div>
            </div>

            {/* Right: Sustainability & ROI */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sustainability & ROI
              </h4>
              <div className="space-y-2">
                <Metric
                  label="Total Sustainability Value"
                  value={fmt$(truck.total_sustainability_value)}
                  highlight={hasSavings ? "success" : undefined}
                />
                <Metric
                  label="ROI Ratio"
                  value={`${truck.sustainability_roi_ratio.toFixed(2)}x`}
                />
                <Metric
                  label="Cost Δ vs Baseline"
                  value={`${truck.cost_difference_vs_baseline >= 0 ? "+" : ""}${fmt$(truck.cost_difference_vs_baseline)}`}
                />
              </div>
            </div>
          </div>

          {/* Contribution bar chart */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Sustainability Value Breakdown
            </h4>
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
                    width={100}
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

          {/* Assumptions */}
          <div className="text-[10px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-border">
            <span>
              Carbon price: ${truck.assumptions.epa_carbon_multiplier}/tCO₂
            </span>
            <span>
              Emissions: {truck.assumptions.emissions_factor_g_per_ton_mile} g
              CO₂/ton-mi
            </span>
            <span>
              Original: {truck.assumptions.original_distance_miles.toFixed(1)} mi
            </span>
            <span>
              Optimised: {truck.assumptions.optimized_distance_miles.toFixed(1)}{" "}
              mi
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: "success" | "primary" | "destructive"
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          highlight ? `text-${highlight}` : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  )
}

// ── Main tab component ───────────────────────────────────────────────

export function EnvironmentalImpact() {
  const [cargoTons, setCargoTons] = useState(DEFAULT_CARGO_TONS)
  const [carbonPrice, setCarbonPrice] = useState(EPA_CARBON_MULTIPLIER)
  const [showSettings, setShowSettings] = useState(false)

  const { data, loading } = useEnvironmentalData(0.5, 5_000, cargoTons, carbonPrice)

  // Fleet-wide totals
  const totals = useMemo(() => {
    if (!data.length) return null
    let co2 = 0,
      envVal = 0,
      spoilVal = 0,
      susVal = 0
    for (const t of data) {
      co2 += t.total_tonnes_carbon_saved
      envVal += t.environmental_value
      spoilVal += t.expected_spoilage_cost_saved
      susVal += t.total_sustainability_value
    }
    return {
      co2,
      envVal,
      spoilVal,
      susVal,
      count: data.length,
    }
  }, [data])

  // Sort trucks: those with savings first, then by sustainability value desc
  const sorted = useMemo(
    () =>
      [...data].sort(
        (a, b) => b.total_sustainability_value - a.total_sustainability_value
      ),
    [data]
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Environmental Impact (SROI)
          </h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Computing sustainability metrics…"
              : `${data.length} trucks · baseline vs risk-optimal action`}
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
            showSettings
              ? "bg-primary/10 border-primary text-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
          )}
        >
          <Settings2 className="h-4 w-4" />
          Parameters
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Cargo Weight (tons per truck)
                </label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  step={1}
                  value={cargoTons}
                  onChange={(e) =>
                    setCargoTons(Math.max(1, parseFloat(e.target.value) || 1))
                  }
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Carbon Shadow Price ($/metric ton CO₂)
                </label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  step={10}
                  value={carbonPrice}
                  onChange={(e) =>
                    setCarbonPrice(Math.max(1, parseFloat(e.target.value) || 1))
                  }
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  EPA default: $190/tCO₂. Adjust to see sensitivity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border shadow-sm animate-pulse">
              <CardContent className="p-5 h-24" />
            </Card>
          ))}
        </div>
      )}

      {/* Summary cards */}
      {totals && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total CO₂ Saved"
            value={fmtTonnes(totals.co2)}
            sub={`Across ${totals.count} trucks`}
            icon={Leaf}
            color="success"
          />
          <SummaryCard
            label="Environmental Value"
            value={fmt$(totals.envVal)}
            sub={`@ $${carbonPrice}/tCO₂`}
            icon={TrendingDown}
            color="success"
          />
          <SummaryCard
            label="Spoilage Cost Saved"
            value={fmt$(totals.spoilVal)}
            sub="Baseline → optimal"
            icon={DollarSign}
            color="primary"
          />
          <SummaryCard
            label="Total Sustainability Value"
            value={fmt$(totals.susVal)}
            sub="Environmental + Spoilage"
            icon={Gauge}
            color="info"
          />
        </div>
      )}

      {/* Fleet CO₂ per-decision indicator */}
      {totals && totals.count > 0 && (
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              CO₂ Saved per Decision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sorted.map((t) => ({
                    name: `T${t.truck_id}`,
                    co2_kg: t.total_tonnes_carbon_saved * 1000,
                    action: t.chosen_action,
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
                    width={40}
                    tickFormatter={(v: number) => `${v.toFixed(0)} kg`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                    formatter={(value: number, _: string, props: any) => [
                      `${value.toFixed(1)} kg CO₂`,
                      ACTION_LABELS[props.payload.action] ?? props.payload.action,
                    ]}
                  />
                  <Bar dataKey="co2_kg" radius={[4, 4, 0, 0]}>
                    {sorted.map((t, idx) => (
                      <Cell
                        key={idx}
                        fill={ACTION_COLORS[t.chosen_action] ?? "hsl(var(--muted))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-truck list */}
      {!loading && data.length > 0 && (
        <div>
          <div className="flex items-center gap-3 px-4 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
            <div className="w-4" />
            <div className="w-8" />
            <div className="min-w-[100px]">Truck</div>
            <div>Action</div>
            <div className="hidden sm:flex items-center gap-5 ml-auto">
              <div className="w-[80px] text-right">CO₂</div>
              <div className="w-[70px] text-right">Value</div>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            {sorted.map((truck) => (
              <TruckRow key={truck.truck_id} truck={truck} />
            ))}
          </div>
        </div>
      )}

      {!loading && data.length === 0 && (
        <Card className="border-border shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">
            No fleet data available to compute environmental impact.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
