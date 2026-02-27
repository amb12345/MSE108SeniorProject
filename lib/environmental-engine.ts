/**
 * Environmental Impact (SROI) Engine — TypeScript implementation.
 *
 * Mirrors backend/environmental_engine.py.
 * Reuses the cost engine's Monte Carlo results to derive environmental
 * and economic sustainability metrics per truck decision.
 *
 * Constants:
 *   EPA Social Cost of Carbon: $190 / metric ton CO₂
 *   Emissions factor (medium/heavy trucks): 161.8 g CO₂ per ton-mile
 */

import {
  ACTIONS,
  evaluateScenario,
  deriveScenarioFromFleetData,
  type ScenarioRow,
  type ScenarioResult,
} from './cost-engine'

// ── Constants ────────────────────────────────────────────────────────

export const EPA_CARBON_MULTIPLIER = 190     // $ per metric ton CO₂
export const EMISSIONS_FACTOR = 161.8        // grams CO₂ per ton-mile
export const DEFAULT_CARGO_TONS = 20.0

// ── Types ────────────────────────────────────────────────────────────

export interface EnvironmentalAssumptions {
  epa_carbon_multiplier: number
  emissions_factor_g_per_ton_mile: number
  cargo_tons: number
  original_distance_miles: number
  optimized_distance_miles: number
  note?: string
}

export interface EnvironmentalSROI {
  distance_saved: number
  ton_miles_saved: number
  total_tonnes_carbon_saved: number
  environmental_value: number
  assumptions: EnvironmentalAssumptions
}

export interface SpoilageSavings {
  baseline_expected_spoilage_cost: number
  chosen_expected_spoilage_cost: number
  expected_spoilage_cost_saved: number
}

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
  assumptions: EnvironmentalAssumptions
}

// ── Core environmental SROI calculation ──────────────────────────────

export function calculateEnvironmentalSROI(
  originalDistance: number,
  optimizedDistance: number,
  cargoTons: number = DEFAULT_CARGO_TONS,
  carbonPrice: number = EPA_CARBON_MULTIPLIER,
): EnvironmentalSROI {
  const distanceSaved = originalDistance - optimizedDistance

  if (distanceSaved <= 0) {
    return {
      distance_saved: 0,
      ton_miles_saved: 0,
      total_tonnes_carbon_saved: 0,
      environmental_value: 0,
      assumptions: {
        epa_carbon_multiplier: carbonPrice,
        emissions_factor_g_per_ton_mile: EMISSIONS_FACTOR,
        cargo_tons: cargoTons,
        original_distance_miles: originalDistance,
        optimized_distance_miles: optimizedDistance,
        note: 'No distance saved — optimised route is equal or longer',
      },
    }
  }

  const tonMilesSaved = distanceSaved * cargoTons
  const totalTonnesCarbonSaved = (tonMilesSaved * EMISSIONS_FACTOR) / 1_000_000
  const environmentalValue = carbonPrice * totalTonnesCarbonSaved

  return {
    distance_saved: +distanceSaved.toFixed(4),
    ton_miles_saved: +tonMilesSaved.toFixed(4),
    total_tonnes_carbon_saved: +totalTonnesCarbonSaved.toFixed(6),
    environmental_value: +environmentalValue.toFixed(4),
    assumptions: {
      epa_carbon_multiplier: carbonPrice,
      emissions_factor_g_per_ton_mile: EMISSIONS_FACTOR,
      cargo_tons: cargoTons,
      original_distance_miles: +originalDistance.toFixed(4),
      optimized_distance_miles: +optimizedDistance.toFixed(4),
    },
  }
}

// ── Spoilage cost savings ────────────────────────────────────────────

export function spoilageCostSaved(
  scenarioResult: ScenarioResult,
  chosenAction: string,
): SpoilageSavings {
  const baselineSpoilage = scenarioResult.per_action['continue']?.breakdown_means.spoilage ?? 0
  const chosenSpoilage = scenarioResult.per_action[chosenAction]?.breakdown_means.spoilage ?? 0

  return {
    baseline_expected_spoilage_cost: +baselineSpoilage.toFixed(2),
    chosen_expected_spoilage_cost: +chosenSpoilage.toFixed(2),
    expected_spoilage_cost_saved: +(baselineSpoilage - chosenSpoilage).toFixed(2),
  }
}

// ── Action distance helper ───────────────────────────────────────────

const ACTION_DEFS = Object.fromEntries(ACTIONS.map(a => [a.name, a]))

function actionDistance(name: string, distanceBaseMiles: number): number {
  const a = ACTION_DEFS[name]
  if (!a) return distanceBaseMiles
  const extra = a.extra_travel_minutes + a.extra_handling_minutes
  return distanceBaseMiles * (1 + extra / 300.0)
}

// ── Full environmental impact for one truck ──────────────────────────

export function computeTruckEnvironmentalImpact(
  scenarioResult: ScenarioResult,
  distanceBaseMiles: number,
  cargoTons: number = DEFAULT_CARGO_TONS,
  carbonPrice: number = EPA_CARBON_MULTIPLIER,
): TruckEnvironmentalImpact {
  const chosenAction = scenarioResult.recommended_action
  const baselineAction = 'continue'

  const originalDistance = actionDistance(baselineAction, distanceBaseMiles)
  const optimizedDistance = actionDistance(chosenAction, distanceBaseMiles)

  const env = calculateEnvironmentalSROI(
    originalDistance, optimizedDistance, cargoTons, carbonPrice,
  )

  const spoilage = spoilageCostSaved(scenarioResult, chosenAction)

  const totalSustainabilityValue = env.environmental_value + spoilage.expected_spoilage_cost_saved

  const baselineTotalCost = scenarioResult.per_action[baselineAction]?.stats.mean ?? 0
  const chosenTotalCost = scenarioResult.per_action[chosenAction]?.stats.mean ?? 0
  const costDifference = chosenTotalCost - baselineTotalCost

  const absCostDiff = Math.max(Math.abs(costDifference), 1)
  const sustainabilityRoiRatio = totalSustainabilityValue / absCostDiff
  const carbonSavedPerDollar = env.total_tonnes_carbon_saved / absCostDiff

  return {
    truck_id: scenarioResult.truck_id,
    node_id: scenarioResult.node_id,
    baseline_action: baselineAction,
    chosen_action: chosenAction,
    distance_saved: env.distance_saved,
    ton_miles_saved: env.ton_miles_saved,
    total_tonnes_carbon_saved: env.total_tonnes_carbon_saved,
    environmental_value: env.environmental_value,
    expected_spoilage_cost_saved: spoilage.expected_spoilage_cost_saved,
    baseline_expected_spoilage_cost: spoilage.baseline_expected_spoilage_cost,
    chosen_expected_spoilage_cost: spoilage.chosen_expected_spoilage_cost,
    total_sustainability_value: +totalSustainabilityValue.toFixed(4),
    cost_difference_vs_baseline: +costDifference.toFixed(2),
    sustainability_roi_ratio: +sustainabilityRoiRatio.toFixed(4),
    carbon_saved_per_dollar: +carbonSavedPerDollar.toFixed(6),
    assumptions: env.assumptions,
  }
}

// ── Batch: compute environmental impact for the whole fleet ──────────

export function computeFleetEnvironmentalImpact(
  fleetData: Array<{ truck_id: number; gps: any; sensor: any; decision?: any }>,
  riskThreshold: number = 0.5,
  n: number = 5_000,
  cargoTons: number = DEFAULT_CARGO_TONS,
  carbonPrice: number = EPA_CARBON_MULTIPLIER,
): TruckEnvironmentalImpact[] {
  const results: TruckEnvironmentalImpact[] = []

  for (const truck of fleetData) {
    const scenario = deriveScenarioFromFleetData(truck)
    if (!scenario) continue

    const costResult = evaluateScenario(scenario, riskThreshold, n, 42 + truck.truck_id)
    const impact = computeTruckEnvironmentalImpact(
      costResult, scenario.distance_base_miles, cargoTons, carbonPrice,
    )
    results.push(impact)
  }

  return results
}
