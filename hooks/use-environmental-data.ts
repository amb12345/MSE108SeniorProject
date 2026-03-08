import { useEffect, useState, useCallback } from 'react'
import {
  fleetToEnvImpacts,
  type TruckEnvironmentalImpact,
} from '@/lib/fleet-env-adapter'
import { DEFAULT_CARGO_TONS, EPA_CARBON_MULTIPLIER } from '@/lib/constants'
import { useFleetBackend } from '@/contexts/fleet-backend-context'

export type { TruckEnvironmentalImpact }

export function useEnvironmentalData(
  _riskThreshold: number = 0.5,
  _n: number = 5_000,
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
          const results = fleetToEnvImpacts(backendFleetData, cargoTons, carbonPrice)
          setData(results)
        }
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
  }, [cargoTons, carbonPrice, isBackendMode, backendFleetData])

  useEffect(() => { fetch_() }, [fetch_])

  return { data, loading, error, refetch: fetch_ }
}
