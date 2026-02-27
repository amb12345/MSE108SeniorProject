/**
 * Cost Engine — TypeScript implementation for the Next.js API route.
 *
 * Scenario-based action comparison with continue / reroute / detour.
 * Mirrors backend/cost_engine.py exactly.
 *
 * Quantile scoring rule (lower score wins):
 *   risk_threshold = 0.25  →  score = p75  (conservative)
 *   risk_threshold = 0.50  →  score = p50  (balanced)
 *   risk_threshold = 0.75  →  score = p25  (aggressive)
 *
 * Mapping: quantile_used = 1 − risk_threshold
 */

// ── Seedable PRNG (Mulberry32) ──────────────────────────────────────

function createRng(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function uniform(rng: () => number, lo: number, hi: number): number {
  return lo + rng() * (hi - lo)
}

function triangular(rng: () => number, lo: number, mode: number, hi: number): number {
  const u = rng()
  const fc = (mode - lo) / (hi - lo)
  if (u < fc) return lo + Math.sqrt(u * (hi - lo) * (mode - lo))
  return hi - Math.sqrt((1 - u) * (hi - lo) * (hi - mode))
}

function percentile(sorted: Float64Array, p: number): number {
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

// ── Action definitions ──────────────────────────────────────────────

export const ACTIONS = [
  { name: 'continue', extra_travel_minutes: 0,  extra_handling_minutes: 0,  fixed_cost: 0 },
  { name: 'reroute',  extra_travel_minutes: 45, extra_handling_minutes: 3,  fixed_cost: 500 },
  { name: 'detour',   extra_travel_minutes: 30, extra_handling_minutes: 50, fixed_cost: 2000 },
] as const

// ── Types ───────────────────────────────────────────────────────────

export interface ScenarioRow {
  truck_id: number
  node_id: number
  minutes_above_temp: number
  future_violation_if_continue: number
  reroute_reduction: number
  detour_repair_benefit: number
  slack_minutes: number
  door_open: number   // 0 or 1
  high_humidity: number // 0 or 1
  distance_base_miles: number
  delay_base_minutes: number
  spoilage_time_base_hours: number
  shipment_value: number | null
  recommended_action: string | null
}

export interface CostStats {
  mean: number
  median: number
  std: number
  min: number
  max: number
  p05: number
  p25: number
  p50: number
  p75: number
  p95: number
}

export interface ActionResult {
  stats: CostStats
  percentiles: { p05: number; p25: number; p50: number; p75: number; p95: number }
  breakdown_means: {
    operating_travel: number
    delay_service: number
    spoilage: number
    fixed_cost: number
  }
  score: number
}

export interface ScenarioResult {
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
  per_action: Record<string, ActionResult>
  recommended_action: string
  risk_threshold: number
  quantile_used: string
  rationale: string
}

// ── Business logic ──────────────────────────────────────────────────

/**
 * Additional violation minutes based on action type.
 *
 * continue – inherits all projected future violations.
 * reroute  – reduces future violations but pays extra time if cargo
 *            is already above temperature threshold.
 * detour   – extra time offset by repair benefit (cold-chain service stop).
 */
function extraViolationMinutes(
  actionName: string,
  extraTime: number,
  row: ScenarioRow,
): number {
  const future = row.future_violation_if_continue

  if (actionName === 'continue') return future

  if (actionName === 'reroute') {
    const reducedFuture = Math.max(0, future - row.reroute_reduction)
    const payTime = row.minutes_above_temp > 0 ? extraTime : 0
    return reducedFuture + payTime
  }

  if (actionName === 'detour') {
    return Math.max(0, extraTime - row.detour_repair_benefit)
  }

  return future
}

// ── Simulation ──────────────────────────────────────────────────────

interface SimArrays {
  total_cost: Float64Array
  operating_travel: Float64Array
  delay_service: Float64Array
  spoilage: Float64Array
}

function simulateCostDistribution(
  distance: number,
  doorOpen: boolean,
  humidity: boolean,
  delayMinutes: number,
  spoilageTimeHours: number,
  shipmentValue: number | null,
  fixedCost: number,
  n: number,
  rng: () => number,
): SimArrays {
  const totalCost = new Float64Array(n)
  const opTravel = new Float64Array(n)
  const delaySvc = new Float64Array(n)
  const spoilageArr = new Float64Array(n)

  const lambda1Base = -Math.log(1 - 0.2) / 1.0
  const lambda6Base = -Math.log(1 - 0.8) / 6.0
  const t = Math.max(spoilageTimeHours, 0)
  const delayMin = Math.max(delayMinutes, 0)
  const doorMult = doorOpen ? 1.5 : 1.0
  const humidityMult = humidity ? 1.2 : 1.0
  const multiplier = doorMult * humidityMult
  const hasShipmentValue = shipmentValue != null && shipmentValue > 0

  for (let i = 0; i < n; i++) {
    const mileCost = uniform(rng, 2.20, 2.35)
    const mph = uniform(rng, 30, 55)
    const ratePerMile = (mileCost * mph) / 60.0
    const handlingFee = uniform(rng, 100, 500)
    const travelCost = ratePerMile * distance
    const operatingTravel = travelCost + handlingFee

    const shipmentVal = hasShipmentValue
      ? shipmentValue!
      : triangular(rng, 50_000, 75_000, 100_000)

    const otifCost = 0.03 * shipmentVal
    const detentionRate = uniform(rng, 0.5, 0.83)
    const detentionCost = detentionRate * delayMin
    const delayService = otifCost + detentionCost

    const l1 = lambda1Base * uniform(rng, 0.95, 1.05)
    const l6 = lambda6Base * uniform(rng, 0.95, 1.05)

    let pLoss: number
    if (t <= 4) {
      pLoss = 1 - Math.exp(-l1 * t)
    } else {
      const frac = Math.min(Math.max((t - 4) / 2.0, 0), 1)
      const lambdaT = l1 + frac * (l6 - l1)
      pLoss = 1 - Math.exp(-lambdaT * t)
    }

    const spoilageCost = shipmentVal * pLoss * multiplier

    opTravel[i] = operatingTravel
    delaySvc[i] = delayService
    spoilageArr[i] = spoilageCost
    totalCost[i] = operatingTravel + delayService + spoilageCost + fixedCost
  }

  return { total_cost: totalCost, operating_travel: opTravel, delay_service: delaySvc, spoilage: spoilageArr }
}

// ── Stats ───────────────────────────────────────────────────────────

function computeStats(arr: Float64Array): CostStats {
  const sorted = new Float64Array(arr).sort()
  const n = sorted.length
  let sum = 0
  for (let i = 0; i < n; i++) sum += sorted[i]
  const mean = sum / n

  let variance = 0
  for (let i = 0; i < n; i++) variance += (sorted[i] - mean) ** 2
  const std = Math.sqrt(variance / n)

  return {
    mean,
    median: percentile(sorted, 50),
    std,
    min: sorted[0],
    max: sorted[n - 1],
    p05: percentile(sorted, 5),
    p25: percentile(sorted, 25),
    p50: percentile(sorted, 50),
    p75: percentile(sorted, 75),
    p95: percentile(sorted, 95),
  }
}

function arrayMean(arr: Float64Array): number {
  let s = 0
  for (let i = 0; i < arr.length; i++) s += arr[i]
  return s / arr.length
}

// ── Evaluate all actions for one scenario row ───────────────────────

export function evaluateScenario(
  row: ScenarioRow,
  riskThreshold: number = 0.5,
  n: number = 20_000,
  seed: number = 42,
): ScenarioResult {
  const rng = createRng(seed)
  const quantilePct = 1.0 - riskThreshold
  const quantileLabel = `p${Math.round(quantilePct * 100)}`

  const perAction: Record<string, ActionResult> = {}
  const scores: Record<string, number> = {}

  for (const actionDef of ACTIONS) {
    const { name, extra_travel_minutes, extra_handling_minutes, fixed_cost } = actionDef
    const extraTime = extra_travel_minutes + extra_handling_minutes

    const distance = row.distance_base_miles * (1 + extraTime / 300.0)

    const doorOpen = name === 'detour' ? false : Boolean(row.door_open)
    const humidity = name === 'detour' ? false : Boolean(row.high_humidity)

    const netDelay = Math.max(0, row.delay_base_minutes + extraTime - row.slack_minutes)

    const ev = extraViolationMinutes(name, extraTime, row)
    const spoilageTime = row.spoilage_time_base_hours + (row.minutes_above_temp + ev) / 60.0

    const result = simulateCostDistribution(
      distance, doorOpen, humidity, netDelay, spoilageTime,
      row.shipment_value, fixed_cost, n, rng,
    )

    const stats = computeStats(result.total_cost)
    const sorted = new Float64Array(result.total_cost).sort()
    const score = percentile(sorted, quantilePct * 100)

    perAction[name] = {
      stats,
      percentiles: { p05: stats.p05, p25: stats.p25, p50: stats.p50, p75: stats.p75, p95: stats.p95 },
      breakdown_means: {
        operating_travel: arrayMean(result.operating_travel),
        delay_service: arrayMean(result.delay_service),
        spoilage: arrayMean(result.spoilage),
        fixed_cost,
      },
      score,
    }
    scores[name] = score
  }

  // Use the action from the CSV/DB if provided; otherwise fall back to quantile scoring
  let chosenAction: string
  let rationale: string
  const riskLabels: Record<number, string> = { 0.25: '25% Safe', 0.5: '50% Balanced', 0.75: '75% Cheap' }
  const riskLabel = riskLabels[riskThreshold] ?? `${Math.round(riskThreshold * 100)}%`

  if (row.recommended_action && scores[row.recommended_action] !== undefined) {
    chosenAction = row.recommended_action
    rationale = `Action '${chosenAction}' from routing decision data (${quantileLabel} cost: $${Math.round(scores[chosenAction]).toLocaleString()} at ${riskLabel} risk)`
  } else {
    chosenAction = ACTIONS[0].name
    for (const [action, score] of Object.entries(scores)) {
      if (score < scores[chosenAction]) chosenAction = action
    }
    rationale = `Selected '${chosenAction}' because it minimizes ${quantileLabel} cost ($${Math.round(scores[chosenAction]).toLocaleString()}) at ${riskLabel} risk tolerance`
  }

  return {
    truck_id: row.truck_id,
    node_id: row.node_id,
    inputs: {
      minutes_above_temp: row.minutes_above_temp,
      future_violation_if_continue: row.future_violation_if_continue,
      reroute_reduction: row.reroute_reduction,
      detour_repair_benefit: row.detour_repair_benefit,
      slack_minutes: row.slack_minutes,
      door_open: row.door_open,
      high_humidity: row.high_humidity,
      distance_base_miles: row.distance_base_miles,
      delay_base_minutes: row.delay_base_minutes,
      spoilage_time_base_hours: row.spoilage_time_base_hours,
      shipment_value: row.shipment_value,
    },
    per_action: perAction,
    recommended_action: chosenAction,
    risk_threshold: riskThreshold,
    quantile_used: quantileLabel,
    rationale,
  }
}

// ── Derive a ScenarioRow from fleet data (DB or static) ─────────────

export function deriveScenarioFromFleetData(truck: {
  truck_id: number
  gps: any
  sensor: any
  decision?: any
}): ScenarioRow | null {
  const { sensor, gps } = truck
  if (!sensor) return null

  const violationMin = parseFloat(String(sensor.violation_min ?? '0'))
  const edgeTravelMin = parseFloat(
    String(sensor.edge_travel_time_min ?? gps?.edge_travel_time_min ?? '30'),
  )
  const speedMph: number = gps?.speed_mph ?? 42.5
  const slackMin: number = sensor.remaining_slack_min ?? 0
  const humidityPct =
    typeof sensor.humidity_pct === 'string'
      ? parseFloat(sensor.humidity_pct)
      : (sensor.humidity_pct ?? 0)

  const minutesAboveTemp = violationMin
  const futureViolation = minutesAboveTemp + edgeTravelMin * 0.3

  return {
    truck_id: truck.truck_id,
    node_id: sensor.current_node ?? gps?.current_node ?? 0,
    minutes_above_temp: minutesAboveTemp,
    future_violation_if_continue: futureViolation,
    reroute_reduction: futureViolation * 0.6,
    detour_repair_benefit: Math.min(60, 30 + minutesAboveTemp * 0.5),
    slack_minutes: Math.max(0, slackMin),
    door_open: sensor.door_open ? 1 : 0,
    high_humidity: humidityPct >= 80 ? 1 : 0,
    distance_base_miles: (edgeTravelMin * speedMph) / 60,
    delay_base_minutes: Math.max(0, -slackMin),
    spoilage_time_base_hours: Math.max(0, -slackMin) / 60,
    shipment_value: sensor.shipment_value ?? null,
    recommended_action: truck.decision?.recommended_action ?? null,
  }
}
