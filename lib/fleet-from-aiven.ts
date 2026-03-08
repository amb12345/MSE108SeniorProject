/**
 * Fetch fleet data from fleet_decisions_full_6 on Aiven.
 * Used by Next.js API routes when DATABASE_URL points to Aiven.
 */

import { prisma } from '@/lib/db'

export interface FleetRow {
  truck_id: number
  ts: string
  latitude?: number
  longitude?: number
  speed_mph?: number
  current_node?: number
  planned_next?: number
  chosen_next?: number
  destination_node?: number
  valid_outgoing_next_nodes_json?: string
  edge_progress_frac?: number
  is_facility_node?: number
  edge_travel_time_min?: number
  door_open?: number
  humidity_pct?: number
  remaining_slack_min?: number
  temperature_c?: number
  shipment_value?: number
  violation_min?: number
  recommended_action?: string
  best_action?: string
  best_mean_cost?: number
  mean_total_cost?: number
  reason?: string
  mc_samples?: number
  all_actions_json?: string
  continue_next_node?: number
  continue_mean_total?: number
  reroute_next_node?: number
  reroute_mean_total?: number
  detour_next_node?: number
  detour_mean_total?: number
  [key: string]: unknown
}

export interface FleetListEntry {
  truck_id: number
  gps: {
    latitude: number
    longitude: number
    speed_mph: number
    timestamp: string
    current_node?: number
    next_node?: number
    destination_node?: number
    at_node?: boolean
    edge_progress_frac?: string
  } | null
  sensor: {
    temperature_c: number
    humidity_pct: number
    door_open: boolean
    shipment_value: number
    remaining_slack_min: number
    violation_min: number
    timestamp: string
  } | null
  decision: {
    recommended_action: string
    mean_cost: number
    timestamp: string
    route: unknown
    all_actions?: Array<{
      action: string
      next_node?: number
      mean_cost?: number
      mean_cost_components?: { operating_travel?: number; delay_service?: number; spoilage?: number }
    }>
    total_tonnes_carbon_saved?: number
    environmental_value?: number
    expected_spoilage_cost_saved?: number
    total_sustainability_value?: number
    diff_max_min_total_cost?: number
    diff_environmental_value?: number
    diff_env_spoilage_cost?: number
  } | null
}

function serializeTs(ts: unknown): string {
  if (!ts) return ''
  if (typeof ts === 'string') return ts
  if (typeof (ts as { toISOString?: () => string }).toISOString === 'function') {
    return (ts as { toISOString: () => string }).toISOString()
  }
  return String(ts)
}

function rowToFleetEntry(row: FleetRow): FleetListEntry {
  const ts = serializeTs(row.ts)
  const nextNode = row.chosen_next ?? row.planned_next ?? null

  let route: unknown = {
    current_node: row.current_node,
    planned_next: row.planned_next,
    chosen_next: row.chosen_next,
    valid_outgoing_next_nodes: [],
  }
  try {
    const vjson = row.valid_outgoing_next_nodes_json
    if (vjson) {
      ;(route as Record<string, unknown>).valid_outgoing_next_nodes = JSON.parse(
        typeof vjson === 'string' ? vjson : String(vjson)
      )
    }
  } catch {
    /* ignore */
  }

  let allActions: Array<{ action: string; next_node?: number; mean_cost?: number }> = []
  try {
    const ajson = row.all_actions_json
    if (ajson) {
      allActions = JSON.parse(typeof ajson === 'string' ? ajson : String(ajson))
    }
  } catch {
    /* ignore */
  }
  if (allActions.length === 0) {
    if (row.continue_next_node != null || row.continue_mean_total != null) {
      allActions.push({ action: 'continue', next_node: row.continue_next_node ?? undefined, mean_cost: row.continue_mean_total })
    }
    if (row.reroute_next_node != null || row.reroute_mean_total != null) {
      allActions.push({ action: 'reroute', next_node: row.reroute_next_node ?? undefined, mean_cost: row.reroute_mean_total })
    }
    if (row.detour_next_node != null || row.detour_mean_total != null) {
      allActions.push({ action: 'detour', next_node: row.detour_next_node ?? undefined, mean_cost: row.detour_mean_total })
    }
  }
  if (allActions.length === 0) {
    allActions = [{ action: row.recommended_action || row.best_action || 'continue', mean_cost: row.mean_total_cost || row.best_mean_cost || 0 }]
  }

  const meanCost = Number(row.mean_total_cost ?? row.best_mean_cost ?? 0)
  const recommended = String(row.recommended_action || row.best_action || 'continue').trim() || 'continue'

  return {
    truck_id: Number(row.truck_id),
    gps: {
      latitude: Number(row.latitude ?? 0),
      longitude: Number(row.longitude ?? 0),
      speed_mph: Number(row.speed_mph ?? 0),
      timestamp: ts,
      current_node: row.current_node ?? undefined,
      next_node: nextNode ?? undefined,
      destination_node: row.destination_node ?? undefined,
      edge_progress_frac: row.edge_progress_frac != null ? String(row.edge_progress_frac) : undefined,
    },
    sensor: {
      temperature_c: Number(row.temperature_c ?? 0),
      humidity_pct: Number(row.humidity_pct ?? 0),
      door_open: Boolean(row.door_open),
      shipment_value: Number(row.shipment_value ?? 0),
      remaining_slack_min: Number(row.remaining_slack_min ?? 0),
      violation_min: Number(row.violation_min ?? 0),
      timestamp: ts,
    },
    decision: {
      recommended_action: recommended,
      mean_cost: meanCost,
      timestamp: ts,
      route,
      all_actions: allActions,
      total_tonnes_carbon_saved: row.total_tonnes_carbon_saved != null ? Number(row.total_tonnes_carbon_saved) : undefined,
      environmental_value: row.environmental_value != null ? Number(row.environmental_value) : undefined,
      expected_spoilage_cost_saved: row.expected_spoilage_cost_saved != null ? Number(row.expected_spoilage_cost_saved) : undefined,
      total_sustainability_value: row.total_sustainability_value != null ? Number(row.total_sustainability_value) : undefined,
      diff_max_min_total_cost: row.diff_max_min_total_cost != null ? Number(row.diff_max_min_total_cost) : undefined,
      diff_environmental_value: row.diff_environmental_value != null ? Number(row.diff_environmental_value) : undefined,
      diff_env_spoilage_cost: row.diff_env_spoilage_cost != null ? Number(row.diff_env_spoilage_cost) : undefined,
    },
  }
}

/** Fetch all fleet data from fleet_decisions_full_6 and return as FleetListEntry[] */
export async function fetchFleetFromAiven(): Promise<FleetListEntry[]> {
  const rows = await prisma.$queryRawUnsafe<FleetRow[]>(
    'SELECT * FROM fleet_decisions_full_6'
  )
  return rows.map(rowToFleetEntry)
}

/** Fetch fleet data and group by truck_id (latest per truck) */
export async function fetchFleetListFromAiven(
  truckId?: number
): Promise<FleetListEntry | FleetListEntry[] | null> {
  const entries = await fetchFleetFromAiven()
  if (entries.length === 0) return truckId != null ? null : []

  const byTruck = new Map<number, FleetListEntry[]>()
  for (const e of entries) {
    const list = byTruck.get(e.truck_id) || []
    list.push(e)
    byTruck.set(e.truck_id, list)
  }

  const latestPerTruck: FleetListEntry[] = []
  for (const [tid, list] of byTruck) {
    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.gps?.timestamp || 0).getTime() -
        new Date(a.gps?.timestamp || 0).getTime()
    )
    latestPerTruck.push(sorted[0])
  }
  latestPerTruck.sort((a, b) => a.truck_id - b.truck_id)

  if (truckId != null) {
    const truck = latestPerTruck.find((t) => t.truck_id === truckId)
    return truck ?? null
  }
  return latestPerTruck
}

/** Compute stats from fleet data */
export async function fetchFleetStatsFromAiven(): Promise<{
  counts: { trucks: number; gpsRecords: number; sensorRecords: number; decisionRecords: number }
  timeRange: { oldest?: string; newest?: string }
  averages: { temperature_c?: number; humidity_pct?: number; speed_mph?: number }
}> {
  const entries = await fetchFleetFromAiven()
  const trucks = new Set(entries.map((e) => e.truck_id))
  const n = entries.length

  let oldest: string | undefined
  let newest: string | undefined
  let sumTemp = 0
  let sumHumidity = 0
  let sumSpeed = 0
  let countTemp = 0
  let countHumidity = 0
  let countSpeed = 0

  for (const e of entries) {
    const ts = e.gps?.timestamp || e.sensor?.timestamp || ''
    if (ts) {
      if (!oldest || ts < oldest) oldest = ts
      if (!newest || ts > newest) newest = ts
    }
    if (e.sensor) {
      sumTemp += e.sensor.temperature_c
      countTemp++
      sumHumidity += e.sensor.humidity_pct
      countHumidity++
    }
    if (e.gps) {
      sumSpeed += e.gps.speed_mph
      countSpeed++
    }
  }

  return {
    counts: {
      trucks: trucks.size,
      gpsRecords: n,
      sensorRecords: n,
      decisionRecords: n,
    },
    timeRange: { oldest, newest },
    averages: {
      temperature_c: countTemp ? sumTemp / countTemp : undefined,
      humidity_pct: countHumidity ? sumHumidity / countHumidity : undefined,
      speed_mph: countSpeed ? sumSpeed / countSpeed : undefined,
    },
  }
}

/** Fetch history for a truck from fleet_decisions_full_6 */
export async function fetchFleetHistoryFromAiven(
  truckId: number,
  type: 'gps' | 'sensor' | 'decision' | 'all',
  limit: number
): Promise<unknown> {
  const entries = await fetchFleetFromAiven()
  const filtered = entries.filter((e) => e.truck_id === truckId)
  const sorted = filtered.sort(
    (a, b) =>
      new Date(b.gps?.timestamp || 0).getTime() -
      new Date(a.gps?.timestamp || 0).getTime()
  )
  const sliced = sorted.slice(0, limit)

  if (type === 'gps') return sliced.map((e) => e.gps).filter(Boolean)
  if (type === 'sensor') return sliced.map((e) => e.sensor).filter(Boolean)
  if (type === 'decision') return sliced.map((e) => e.decision).filter(Boolean)
  return {
    gps: sliced.map((e) => e.gps).filter(Boolean),
    sensor: sliced.map((e) => e.sensor).filter(Boolean),
    decision: sliced.map((e) => e.decision).filter(Boolean),
  }
}
