"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { FleetTruckData } from "@/hooks/use-fleet-data"

export interface FleetBackendState {
  fleetData: FleetTruckData[] | null
  /** All decision rows (one per DB row) for cost/env aggregation. Backend mode only. */
  allDecisions: any[] | null
  stats: {
    counts: { trucks: number; gpsRecords: number; sensorRecords: number; decisionRecords: number }
    timeRange: { oldest?: string; newest?: string }
    averages: { temperature_c?: number; humidity_pct?: number; speed_mph?: number }
  } | null
  historyMap: Record<
    number,
    { gps: any[]; sensor: any[]; decision: any[] }
  >
  loading: boolean
  error: string | null
}

interface FleetBackendContextValue extends FleetBackendState {
  refresh: () => Promise<void>
  isBackendMode: boolean
}

const FleetBackendContext = createContext<FleetBackendContextValue | null>(null)
const STORAGE_KEY = "fleet_backend_cache"

function serializeTs(ts: unknown): string {
  if (!ts) return ""
  if (typeof ts === "string") return ts
  const iso = (ts as { toISOString?: () => string }).toISOString
  if (typeof iso === "function") return iso.call(ts)
  return String(ts)
}

/** Extract gps, sensor, decision from a raw fleet_decisions_full_6 row */
function rowToExtracts(row: Record<string, unknown>): {
  gps: Record<string, unknown>
  sensor: Record<string, unknown>
  decision: Record<string, unknown>
} {
  const ts = serializeTs(row.ts)
  const nextNode = row.chosen_next ?? row.planned_next ?? null

  let route: Record<string, unknown> = {
    current_node: row.current_node,
    planned_next: row.planned_next,
    chosen_next: row.chosen_next,
    valid_outgoing_next_nodes: [],
  }
  try {
    const vjson = row.valid_outgoing_next_nodes_json
    if (vjson) {
      route.valid_outgoing_next_nodes =
        typeof vjson === "string" ? JSON.parse(vjson) : vjson
    }
  } catch {
    /* ignore */
  }

  let allActions: Array<{ action: string; next_node?: number; mean_cost?: number }> = []
  try {
    const ajson = row.all_actions_json
    if (ajson) {
      allActions =
        typeof ajson === "string" ? JSON.parse(ajson) : (ajson as [])
    }
  } catch {
    /* ignore */
  }
  if (allActions.length === 0) {
    if (row.continue_next_node != null || row.continue_mean_total != null) {
      allActions.push({
        action: "continue",
        next_node: row.continue_next_node as number,
        mean_cost: row.continue_mean_total as number,
      })
    }
    if (row.reroute_next_node != null || row.reroute_mean_total != null) {
      allActions.push({
        action: "reroute",
        next_node: row.reroute_next_node as number,
        mean_cost: row.reroute_mean_total as number,
      })
    }
    if (row.detour_next_node != null || row.detour_mean_total != null) {
      allActions.push({
        action: "detour",
        next_node: row.detour_next_node as number,
        mean_cost: row.detour_mean_total as number,
      })
    }
  }
  if (allActions.length === 0) {
    allActions = [
      {
        action: (row.recommended_action || row.best_action || "continue") as string,
        mean_cost: (row.mean_total_cost ?? row.best_mean_cost ?? 0) as number,
      },
    ]
  }

  const meanCost = Number(row.mean_total_cost ?? row.best_mean_cost ?? 0)
  const recommended =
    String(row.recommended_action || row.best_action || "continue").trim() ||
    "continue"

  const gps = {
    truck_id: row.truck_id,
    timestamp: ts,
    latitude: row.latitude,
    longitude: row.longitude,
    speed_mph: row.speed_mph,
    current_node: row.current_node,
    next_node: nextNode,
    destination_node: row.destination_node,
    edge_progress_frac: row.edge_progress_frac,
  }
  const sensor = {
    truck_id: row.truck_id,
    timestamp: ts,
    temperature_c: row.temperature_c,
    humidity_pct: row.humidity_pct,
    door_open: row.door_open,
    shipment_value: row.shipment_value,
    remaining_slack_min: row.remaining_slack_min,
    violation_min: row.violation_min,
    current_node: row.current_node,
    next_node: nextNode,
    destination_node: row.destination_node,
    edge_progress_frac: row.edge_progress_frac,
  }
  const decision: Record<string, unknown> = {
    truck_id: row.truck_id,
    timestamp: ts,
    recommended_action: recommended,
    mean_cost: meanCost,
    route,
    all_actions: allActions,
  }
  for (const key of [
    "total_tonnes_carbon_saved",
    "environmental_value",
    "expected_spoilage_cost_saved",
    "total_sustainability_value",
    "diff_max_min_total_cost",
    "diff_environmental_value",
    "diff_env_spoilage_cost",
    "diff_env_cost_2",
    "max_total_env_cost",
    "min_total_env_cost",
    "max_environmental_value",
    "min_environmental_value",
    "max_env_spoilage_cost",
    "min_env_spoilage_cost",
    "continue_environmental_value",
    "reroute_environmental_value",
    "detour_environmental_value",
    "continue_env_spoilage_cost",
    "reroute_env_spoilage_cost",
    "detour_env_spoilage_cost",
    "continue_total_env_cost",
    "reroute_total_env_cost",
    "detour_total_env_cost",
    "continue_mean_operating",
    "reroute_mean_operating",
    "detour_mean_operating",
    "continue_mean_delay",
    "reroute_mean_delay",
    "detour_mean_delay",
    "continue_mean_spoilage",
    "reroute_mean_spoilage",
    "detour_mean_spoilage",
    "continue_mean_total",
    "reroute_mean_total",
    "detour_mean_total",
  ]) {
    if ((row as Record<string, unknown>)[key] != null) {
      decision[key] = (row as Record<string, unknown>)[key]
    }
  }

  return { gps, sensor, decision }
}

/** Transform raw rows from fleet_decisions_full_6 into fleetData, stats, historyMap */
function transformRawRowsToBackendState(
  rows: Record<string, unknown>[]
): {
  fleetData: FleetTruckData[]
  stats: FleetBackendState["stats"]
  historyMap: FleetBackendState["historyMap"]
} {
  const truckIds = new Set<number>()
  const gpsByTruck: Record<number, any[]> = {}
  const sensorByTruck: Record<number, any[]> = {}
  const decisionByTruck: Record<number, any[]> = {}

  for (const row of rows) {
    const tid = Number(row.truck_id)
    if (Number.isNaN(tid) || row.ts == null) continue
    truckIds.add(tid)
    const { gps, sensor, decision } = rowToExtracts(row)
    if (!gpsByTruck[tid]) gpsByTruck[tid] = []
    gpsByTruck[tid].push(gps)
    if (!sensorByTruck[tid]) sensorByTruck[tid] = []
    sensorByTruck[tid].push(sensor)
    if (!decisionByTruck[tid]) decisionByTruck[tid] = []
    decisionByTruck[tid].push(decision)
  }

  const sortByTs = (a: { timestamp?: string }, b: { timestamp?: string }) =>
    new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()

  const fleetData: FleetTruckData[] = Array.from(truckIds)
    .sort((a, b) => a - b)
    .map((tid) => {
      const gpsList = (gpsByTruck[tid] || []).sort(sortByTs)
      const sensorList = (sensorByTruck[tid] || []).sort(sortByTs)
      const decisionList = (decisionByTruck[tid] || []).sort(sortByTs)
      const latestGps = gpsList[0]
      const latestSensor = sensorList[0]
      const latestDecision = decisionList[0]

      return {
        truck_id: tid,
        gps: latestGps
          ? {
              latitude: Number(latestGps.latitude),
              longitude: Number(latestGps.longitude),
              speed_mph: Number(latestGps.speed_mph),
              timestamp: String(latestGps.timestamp ?? ""),
              current_node: latestGps.current_node,
              next_node: latestGps.next_node,
              destination_node: latestGps.destination_node,
              at_node: latestGps.at_node,
              edge_progress_frac: String(latestGps.edge_progress_frac ?? ""),
            }
          : null,
        sensor: latestSensor
          ? {
              temperature_c: Number(latestSensor.temperature_c),
              humidity_pct: Number(latestSensor.humidity_pct),
              door_open: Boolean(latestSensor.door_open),
              shipment_value: Number(latestSensor.shipment_value ?? 0),
              remaining_slack_min: Number(latestSensor.remaining_slack_min ?? 0),
              violation_min: Number(latestSensor.violation_min ?? 0),
              timestamp: String(latestSensor.timestamp ?? ""),
            }
          : null,
        decision: latestDecision
          ? {
              recommended_action: latestDecision.recommended_action ?? "",
              mean_cost: Number(latestDecision.mean_cost ?? 0),
              timestamp: String(latestDecision.timestamp ?? ""),
              route: latestDecision.route,
              all_actions: latestDecision.all_actions ?? undefined,
              total_tonnes_carbon_saved: latestDecision.total_tonnes_carbon_saved ?? undefined,
              environmental_value: latestDecision.environmental_value ?? undefined,
              expected_spoilage_cost_saved:
                latestDecision.expected_spoilage_cost_saved ?? undefined,
              total_sustainability_value:
                latestDecision.total_sustainability_value ?? undefined,
              diff_max_min_total_cost:
                latestDecision.diff_max_min_total_cost ?? undefined,
              diff_environmental_value:
                latestDecision.diff_environmental_value ?? undefined,
              diff_env_spoilage_cost:
                latestDecision.diff_env_spoilage_cost ?? undefined,
            }
          : null,
      }
    })

  const latestSensors = fleetData
    .map((t) => t.sensor)
    .filter(Boolean) as { temperature_c: number; humidity_pct: number }[]
  const avgTemp =
    latestSensors.length > 0
      ? latestSensors.reduce((s, x) => s + x.temperature_c, 0) /
        latestSensors.length
      : 0
  const avgHumidity =
    latestSensors.length > 0
      ? latestSensors.reduce((s, x) => s + x.humidity_pct, 0) /
        latestSensors.length
      : 0
  const avgSpeed =
    fleetData.length > 0
      ? fleetData.reduce((s, t) => s + (t.gps?.speed_mph ?? 0), 0) /
        fleetData.length
      : 0

  const allTimestamps = rows
    .map((r) => {
      const s = serializeTs(r.ts)
      if (!s) return NaN
      const t = new Date(s).getTime()
      return Number.isFinite(t) ? t : NaN
    })
    .filter((t) => Number.isFinite(t)) as number[]
  const oldest =
    allTimestamps.length > 0
      ? new Date(Math.min(...allTimestamps)).toISOString()
      : undefined
  const newest =
    allTimestamps.length > 0
      ? new Date(Math.max(...allTimestamps)).toISOString()
      : undefined

  const historyMap: FleetBackendState["historyMap"] = {}
  truckIds.forEach((tid) => {
    const gpsList = (gpsByTruck[tid] || []).sort(sortByTs)
    const sensorList = (sensorByTruck[tid] || []).sort(sortByTs)
    const decisionList = (decisionByTruck[tid] || []).sort(sortByTs)
    historyMap[tid] = {
      gps: gpsList,
      sensor: sensorList,
      decision: decisionList,
    }
  })

  return {
    fleetData,
    stats: {
      counts: {
        trucks: truckIds.size,
        gpsRecords: rows.length,
        sensorRecords: rows.length,
        decisionRecords: rows.length,
      },
      timeRange: { oldest, newest },
      averages: {
        temperature_c: avgTemp,
        humidity_pct: avgHumidity,
        speed_mph: avgSpeed,
      },
    },
    historyMap,
  }
}

function loadFromStorage(): FleetBackendState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as FleetBackendState
    if (!parsed.fleetData?.length) return null
    return { ...parsed, allDecisions: parsed.allDecisions ?? null }
  } catch {
    return null
  }
}

function saveToStorage(state: FleetBackendState) {
  if (typeof window === "undefined" || !state.fleetData?.length) return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function FleetBackendProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FleetBackendState>({
    fleetData: null,
    allDecisions: null,
    stats: null,
    historyMap: {},
    loading: false,
    error: null,
  })

  useEffect(() => {
    const cached = loadFromStorage()
    if (cached) setState(cached)
  }, [])

  const backendUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_BACKEND_URL
      : process.env.NEXT_PUBLIC_BACKEND_URL
  const isBackendMode = Boolean(backendUrl?.trim())

  const refresh = useCallback(async () => {
    const url = backendUrl?.trim()
    if (!url) {
      setState((s) => ({ ...s, error: "BACKEND_URL not configured" }))
      return
    }
    const base = url.replace(/\/$/, "")
    const apiUrl = `${base}/api/fleet-data`
    try {
      setState((s) => ({ ...s, loading: true, error: null }))
      const res = await fetch(apiUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const json = await res.json()
      const rows: Record<string, unknown>[] = Array.isArray(json.rows)
        ? json.rows
        : []
      const { fleetData, stats, historyMap } =
        transformRawRowsToBackendState(rows)
      // allDecisions: normalized for cost/env aggregation (mean_cost, all_actions)
      const allDecisions = rows.map((r) => {
        const { decision } = rowToExtracts(r)
        return { ...r, mean_cost: decision.mean_cost, all_actions: decision.all_actions }
      })
      const newState = {
        fleetData,
        allDecisions,
        stats,
        historyMap,
        loading: false,
        error: null,
      }
      setState(newState)
      saveToStorage(newState)
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch from backend",
      }))
      console.error("Fleet backend refresh error:", err)
    }
  }, [backendUrl])

  useEffect(() => {
    if (isBackendMode) refresh()
  }, [isBackendMode, refresh])

  const value: FleetBackendContextValue = {
    ...state,
    refresh,
    isBackendMode,
  }

  return (
    <FleetBackendContext.Provider value={value}>
      {children}
    </FleetBackendContext.Provider>
  )
}

export function useFleetBackend(): FleetBackendContextValue {
  const ctx = useContext(FleetBackendContext)
  if (!ctx) {
    return {
      fleetData: null,
      allDecisions: null,
      stats: null,
      historyMap: {},
      loading: false,
      error: null,
      refresh: async () => {},
      isBackendMode: false,
    }
  }
  return ctx
}
