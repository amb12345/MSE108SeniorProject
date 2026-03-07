import { useEffect, useState, useCallback } from 'react'
import {
  evaluateScenario,
  deriveScenarioFromFleetData,
  type ScenarioResult,
} from '@/lib/cost-engine'
import { useFleetBackend } from '@/contexts/fleet-backend-context'

export type { ScenarioResult }
export type CostTruckResult = ScenarioResult

/**
 * Compute cost scenarios client-side from fleet data.
 */
function computeCostsFromFleet(
  fleetData: { truck_id: number; gps: any; sensor: any; decision?: any }[],
  riskThreshold: number,
  n: number,
): ScenarioResult[] {
  const results: ScenarioResult[] = []
  for (const truck of fleetData) {
    const scenario = deriveScenarioFromFleetData(truck)
    if (!scenario) continue
    results.push(evaluateScenario(scenario, riskThreshold, n, 42 + truck.truck_id))
  }
  return results
}

export function useCostData(riskThreshold: number = 0.5, n: number = 20_000) {
  const [data, setData] = useState<ScenarioResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { fleetData: backendFleetData, isBackendMode } = useFleetBackend()

  const fetchCosts = useCallback(async () => {
    try {
      setLoading(true)

      if (isBackendMode) {
        if (backendFleetData && backendFleetData.length > 0) {
          const results = computeCostsFromFleet(backendFleetData, riskThreshold, n)
          setData(results)
        }
        setError(null)
        setLoading(false)
        return
      }

      const url = `/api/costs?risk_threshold=${riskThreshold}&n=${n}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      setData(await response.json())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cost data')
      console.error('Error fetching cost data:', err)
    } finally {
      setLoading(false)
    }
  }, [riskThreshold, n, isBackendMode, backendFleetData])

  useEffect(() => {
    fetchCosts()
  }, [fetchCosts])

  return { data, loading, error, refetch: fetchCosts }
}
