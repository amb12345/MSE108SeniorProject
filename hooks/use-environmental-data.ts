import { useEffect, useState, useCallback } from 'react'
import { DATA_SOURCE } from '@/lib/use-data-source'
import {
  computeFleetEnvironmentalImpact,
  type TruckEnvironmentalImpact,
  DEFAULT_CARGO_TONS,
  EPA_CARBON_MULTIPLIER,
} from '@/lib/environmental-engine'
import { useFleetBackend } from '@/contexts/fleet-backend-context'

export type { TruckEnvironmentalImpact }

export function useEnvironmentalData(
  riskThreshold: number = 0.5,
  n: number = 5_000,
  cargoTons: number = DEFAULT_CARGO_TONS,
  carbonPrice: number = EPA_CARBON_MULTIPLIER,
) {
  const [data, setData] = useState<TruckEnvironmentalImpact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { fleetData: backendFleetData, isBackendMode } = useFleetBackend()

  const fetch_ = useCallback(async () => {
    try {
      setLoading(true)

      if (isBackendMode) {
        if (backendFleetData && backendFleetData.length > 0) {
          const results = computeFleetEnvironmentalImpact(
            backendFleetData, riskThreshold, n, cargoTons, carbonPrice,
          )
          setData(results)
        }
        setError(null)
        setLoading(false)
        return
      }

      if (DATA_SOURCE === 'mock') {
        const { staticFleetData } = await import('../lib/static-fleet-data')
        const results = computeFleetEnvironmentalImpact(
          staticFleetData, riskThreshold, n, cargoTons, carbonPrice,
        )
        setData(results)
        setError(null)
        setLoading(false)
        return
      }

      const params = new URLSearchParams({
        risk: String(riskThreshold),
        n: String(n),
        cargo_tons: String(cargoTons),
        carbon_price: String(carbonPrice),
      })
      const res = await fetch(`/api/environmental-impact?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch environmental data')
      console.error('Error fetching environmental data:', err)
    } finally {
      setLoading(false)
    }
  }, [riskThreshold, n, cargoTons, carbonPrice, isBackendMode, backendFleetData])

  useEffect(() => { fetch_() }, [fetch_])

  return { data, loading, error, refetch: fetch_ }
}
