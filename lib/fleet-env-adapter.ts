/**
 * Adapter to convert fleet data from the database into environmental impact format.
 * Replaces environmental-engine; all data comes from fleet_decisions_full_6.
 */

import { DEFAULT_CARGO_TONS, EPA_CARBON_MULTIPLIER } from './constants'

export interface TruckEnvironmentalImpact {
  truck_id: number
  node_id: number
  baseline_action: string
  chosen_action: string
  distance_saved: number
  ton_miles_saved: number
  total_tonnes_carbon_saved: number
  environmental_value: number
  expected_spoilage_cost_saved: number
  baseline_expected_spoilage_cost: number
  chosen_expected_spoilage_cost: number
  total_sustainability_value: number
  cost_difference_vs_baseline: number
  sustainability_roi_ratio: number
  carbon_saved_per_dollar: number
  assumptions: {
    epa_carbon_multiplier: number
    emissions_factor_g_per_ton_mile: number
    cargo_tons: number
    original_distance_miles: number
    optimized_distance_miles: number
    note?: string
  }
}

type FleetTruck = { truck_id: number; gps?: any; sensor?: any; decision?: any }

export function fleetToEnvImpact(
  truck: FleetTruck,
  _cargoTons: number = DEFAULT_CARGO_TONS,
  _carbonPrice: number = EPA_CARBON_MULTIPLIER,
): TruckEnvironmentalImpact | null {
  const d = truck.decision ?? truck
  if (!d) return null

  const nodeId = truck.sensor?.current_node ?? truck.gps?.current_node ?? 0
  const chosen = (d.recommended_action ?? d.best_action ?? 'continue')?.toString().toLowerCase() ?? 'continue'
  const baseline = 'continue'

  const envVal = Number(d.environmental_value ?? d.diff_environmental_value ?? 0)
  const spoilSaved = Number(d.expected_spoilage_cost_saved ?? d.diff_env_spoilage_cost ?? 0)
  const carbonSaved = Number(d.total_tonnes_carbon_saved ?? 0)

  const totalSustainability = envVal + spoilSaved
  const costDiff = Number(d.diff_max_min_total_cost ?? 0)
  const absCost = Math.max(Math.abs(costDiff), 1)
  const roiRatio = totalSustainability / absCost
  const carbonPerDollar = carbonSaved / absCost

  return {
    truck_id: truck.truck_id,
    node_id: nodeId,
    baseline_action: baseline,
    chosen_action: chosen,
    distance_saved: 0,
    ton_miles_saved: 0,
    total_tonnes_carbon_saved: carbonSaved,
    environmental_value: envVal,
    expected_spoilage_cost_saved: spoilSaved,
    baseline_expected_spoilage_cost: 0,
    chosen_expected_spoilage_cost: 0,
    total_sustainability_value: totalSustainability,
    cost_difference_vs_baseline: costDiff,
    sustainability_roi_ratio: roiRatio,
    carbon_saved_per_dollar: carbonPerDollar,
    assumptions: {
      epa_carbon_multiplier: _carbonPrice,
      emissions_factor_g_per_ton_mile: 161.8,
      cargo_tons: _cargoTons,
      original_distance_miles: 0,
      optimized_distance_miles: 0,
      note: 'Data from database',
    },
  }
}

export function fleetToEnvImpacts(
  trucks: FleetTruck[],
  cargoTons: number = DEFAULT_CARGO_TONS,
  carbonPrice: number = EPA_CARBON_MULTIPLIER,
): TruckEnvironmentalImpact[] {
  const out: TruckEnvironmentalImpact[] = []
  for (const t of trucks) {
    const r = fleetToEnvImpact(t, cargoTons, carbonPrice)
    if (r) out.push(r)
  }
  return out
}
