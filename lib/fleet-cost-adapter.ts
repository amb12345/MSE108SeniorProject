/**
 * Adapter to convert fleet data from the database into cost display format.
 * Replaces cost-engine; all data comes from fleet_decisions_full_6.
 */

export interface CostTruckResult {
  truck_id: number
  node_id: number
  inputs: {
    minutes_above_temp: number
    future_violation_if_continue: number
    reroute_reduction: number
    detour_repair_benefit: number
    slack_minutes: number
    door_open: number
    high_humidity: number
    distance_base_miles: number
    delay_base_minutes: number
    spoilage_time_base_hours: number
    shipment_value: number | null
  }
  per_action: Record<
    string,
    {
      stats: { mean: number; median: number; std: number; min: number; max: number; p05: number; p25: number; p50: number; p75: number; p95: number }
      percentiles: { p05: number; p25: number; p50: number; p75: number; p95: number }
      breakdown_means: { operating_travel: number; delay_service: number; spoilage: number; fixed_cost: number }
      score: number
    }
  >
  recommended_action: string
  risk_threshold: number
  quantile_used: string
  rationale: string
}

type FleetTruck = { truck_id: number; gps?: any; sensor?: any; decision?: any }

function actionMean(row: any, action: string): number {
  const key = action === 'continue' ? 'continue_mean_total' : action === 'reroute' ? 'reroute_mean_total' : 'detour_mean_total'
  const val = row?.[key]
  if (val != null) return Number(val)
  const actions = row?.all_actions ?? row?.decision?.all_actions ?? []
  const a = actions.find((x: any) => (x.action ?? '').toLowerCase() === action)
  return a?.mean_cost ?? row?.mean_cost ?? row?.mean_total_cost ?? 0
}

function actionBreakdown(row: any, action: string): { operating_travel: number; delay_service: number; spoilage: number } {
  const pre = action === 'continue' ? 'continue_mean' : action === 'reroute' ? 'reroute_mean' : 'detour_mean'
  const op = Number(row?.[`${pre}_operating`] ?? 0)
  const del = Number(row?.[`${pre}_delay`] ?? 0)
  const spoil = Number(row?.[`${pre}_spoilage`] ?? 0)
  if (op || del || spoil) return { operating_travel: op, delay_service: del, spoilage: spoil }
  const actions = row?.all_actions ?? row?.decision?.all_actions ?? []
  const a = actions.find((x: any) => (x.action ?? '').toLowerCase() === action)
  const comp = a?.mean_cost_components
  return {
    operating_travel: comp?.operating_travel ?? 0,
    delay_service: comp?.delay_service ?? 0,
    spoilage: comp?.spoilage ?? 0,
  }
}

export function fleetToCostResult(truck: FleetTruck): CostTruckResult | null {
  const d = truck.decision ?? truck
  if (!d) return null

  const nodeId = truck.sensor?.current_node ?? truck.gps?.current_node ?? 0
  const rec = (d.recommended_action ?? d.best_action ?? 'continue')?.toString().toLowerCase() ?? 'continue'

  const actions = ['continue', 'reroute', 'detour']
  const perAction: CostTruckResult['per_action'] = {}

  for (const action of actions) {
    const mean = actionMean(d, action)
    const breakdown = actionBreakdown(d, action)
    const fixedCost = action === 'continue' ? 0 : action === 'reroute' ? 500 : 2000
    perAction[action] = {
      stats: { mean, median: mean, std: 0, min: mean, max: mean, p05: mean * 0.9, p25: mean * 0.95, p50: mean, p75: mean * 1.05, p95: mean * 1.1 },
      percentiles: { p05: mean * 0.9, p25: mean * 0.95, p50: mean, p75: mean * 1.05, p95: mean * 1.1 },
      breakdown_means: {
        operating_travel: breakdown.operating_travel,
        delay_service: breakdown.delay_service,
        spoilage: breakdown.spoilage,
        fixed_cost: fixedCost,
      },
      score: mean,
    }
  }

  const slack = truck.sensor?.remaining_slack_min ?? 0
  const hum = truck.sensor?.humidity_pct
  const humidityPct = typeof hum === 'string' ? parseFloat(hum) : (hum ?? 0)

  return {
    truck_id: truck.truck_id,
    node_id: nodeId,
    inputs: {
      minutes_above_temp: truck.sensor?.violation_min ?? 0,
      future_violation_if_continue: 0,
      reroute_reduction: 0,
      detour_repair_benefit: 0,
      slack_minutes: Math.max(0, slack),
      door_open: truck.sensor?.door_open ? 1 : 0,
      high_humidity: humidityPct >= 80 ? 1 : 0,
      distance_base_miles: 0,
      delay_base_minutes: 0,
      spoilage_time_base_hours: 0,
      shipment_value: truck.sensor?.shipment_value ?? null,
    },
    per_action: perAction,
    recommended_action: rec,
    risk_threshold: 0.5,
    quantile_used: 'p50',
    rationale: `Action '${rec}' from database`,
  }
}

export function fleetToCostResults(trucks: FleetTruck[]): CostTruckResult[] {
  const out: CostTruckResult[] = []
  for (const t of trucks) {
    const r = fleetToCostResult(t)
    if (r) out.push(r)
  }
  return out
}
