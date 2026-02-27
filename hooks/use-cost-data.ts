import { useEffect, useState, useCallback } from 'react'
import { DATA_SOURCE } from '@/lib/use-data-source'
import {
  evaluateScenario,
  deriveScenarioFromFleetData,
  type ScenarioResult,
} from '@/lib/cost-engine'

export type { ScenarioResult }
export type CostTruckResult = ScenarioResult

/**
 * In static/mock mode, compute cost scenarios client-side from static fleet data.
 */
async function computeStaticCosts(
  riskThreshold: number,
  n: number,
): Promise<ScenarioResult[]> {
  const { staticFleetData } = await import('@/lib/static-fleet-data')
  const results: ScenarioResult[] = []

  for (const truck of staticFleetData) {
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

  const fetchCosts = useCallback(async () => {
    try {
      setLoading(true)

      if (DATA_SOURCE === 'mock') {
        const results = await computeStaticCosts(riskThreshold, n)
        setData(results)
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
  }, [riskThreshold, n])

  useEffect(() => {
    fetchCosts()
  }, [fetchCosts])

  return { data, loading, error, refetch: fetchCosts }
}
