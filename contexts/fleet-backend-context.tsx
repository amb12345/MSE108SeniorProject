"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { FleetTruckData } from "@/hooks/use-fleet-data"

export interface FleetBackendState {
  fleetData: FleetTruckData[] | null
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

function toFleetTruckData(
  truckId: number,
  gpsRows: any[],
  sensorRows: any[],
  decisionRows: any[]
): FleetTruckData {
  const latestGps = gpsRows
    .filter((r) => r.truck_id === truckId)
    .sort(
      (a, b) =>
        new Date(b.timestamp || 0).getTime() -
        new Date(a.timestamp || 0).getTime()
    )[0]
  const latestSensor = sensorRows
    .filter((r) => r.truck_id === truckId)
    .sort(
      (a, b) =>
        new Date(b.timestamp || 0).getTime() -
        new Date(a.timestamp || 0).getTime()
    )[0]
  const latestDecision = decisionRows
    .filter((r) => r.truck_id === truckId)
    .sort(
      (a, b) =>
        new Date(b.timestamp || 0).getTime() -
        new Date(a.timestamp || 0).getTime()
    )[0]

  return {
    truck_id: truckId,
    gps: latestGps
      ? {
          latitude: Number(latestGps.latitude),
          longitude: Number(latestGps.longitude),
          speed_mph: Number(latestGps.speed_mph),
          timestamp:
            typeof latestGps.timestamp === "string"
              ? latestGps.timestamp
              : latestGps.timestamp?.toISO?.() ?? "",
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
          timestamp:
            typeof latestSensor.timestamp === "string"
              ? latestSensor.timestamp
              : latestSensor.timestamp?.toISO?.() ?? "",
        }
      : null,
    decision: latestDecision
      ? {
          recommended_action: latestDecision.recommended_action ?? "",
          mean_cost: Number(latestDecision.mean_cost ?? 0),
          timestamp:
            typeof latestDecision.timestamp === "string"
              ? latestDecision.timestamp
              : latestDecision.timestamp?.toISO?.() ?? "",
          route: latestDecision.route,
        }
      : null,
  }
}

function transformBackendResponse(
  decisions: any[],
  gps: any[],
  sensors: any[]
): {
  fleetData: FleetTruckData[]
  stats: FleetBackendState["stats"]
  historyMap: FleetBackendState["historyMap"]
} {
  const truckIds = new Set<number>()
  gps.forEach((r) => truckIds.add(Number(r.truck_id)))
  sensors.forEach((r) => truckIds.add(Number(r.truck_id)))
  decisions.forEach((r) => truckIds.add(Number(r.truck_id)))

  const fleetData: FleetTruckData[] = Array.from(truckIds)
    .sort((a, b) => a - b)
    .map((tid) => toFleetTruckData(tid, gps, sensors, decisions))

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

  const allGpsTimestamps = gps
    .map((r) => r.timestamp && new Date(r.timestamp).getTime())
    .filter(Boolean) as number[]
  const oldest = allGpsTimestamps.length
    ? new Date(Math.min(...allGpsTimestamps)).toISOString()
    : undefined
  const newest = allGpsTimestamps.length
    ? new Date(Math.max(...allGpsTimestamps)).toISOString()
    : undefined

  const historyMap: FleetBackendState["historyMap"] = {}
  truckIds.forEach((tid) => {
    historyMap[tid] = {
      gps: gps
        .filter((r) => r.truck_id === tid)
        .sort(
          (a, b) =>
            new Date(b.timestamp || 0).getTime() -
            new Date(a.timestamp || 0).getTime()
        ),
      sensor: sensors
        .filter((r) => r.truck_id === tid)
        .sort(
          (a, b) =>
            new Date(b.timestamp || 0).getTime() -
            new Date(a.timestamp || 0).getTime()
        ),
      decision: decisions
        .filter((r) => r.truck_id === tid)
        .sort(
          (a, b) =>
            new Date(b.timestamp || 0).getTime() -
            new Date(a.timestamp || 0).getTime()
        ),
    }
  })

  return {
    fleetData,
    stats: {
      counts: {
        trucks: truckIds.size,
        gpsRecords: gps.length,
        sensorRecords: sensors.length,
        decisionRecords: decisions.length,
      },
      timeRange: { oldest, newest },
      averages: { temperature_c: avgTemp, humidity_pct: avgHumidity, speed_mph: avgSpeed },
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
    return parsed.fleetData?.length ? parsed : null
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
      const { decisions = [], gps = [], sensors = [] } = json
      const { fleetData, stats, historyMap } = transformBackendResponse(
        decisions,
        gps,
        sensors
      )
      const newState = {
        fleetData,
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
