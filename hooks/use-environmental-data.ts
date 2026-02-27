import { useEffect, useState, useCallback } from 'react'
import { DATA_SOURCE } from '@/lib/use-data-source'
import {
  computeFleetEnvironmentalImpact,
  type TruckEnvironmentalImpact,
  DEFAULT_CARGO_TONS,
  EPA_CARBON_MULTIPLIER,
} from '@/lib/environmental-engine'

export type { TruckEnvironmentalImpact }

async function computeStaticImpact(
  riskThreshold: number,
  n: number,
  cargoTons: number,
  carbonPrice: number,
): Promise<TruckEnvironmentalImpact[]> {
  const { staticFleetData } = await import('@/lib/static-fleet-data')
  return computeFleetEnvironmentalImpact(
    staticFleetData, riskThreshold, n, cargoTons, carbonPrice,
  )
}

export function useEnvironmentalData(
  riskThreshold: number = 0.5,
  n: number = 5_000,
  cargoTons: number = DEFAULT_CARGO_TONS,
  carbonPrice: number = EPA_CARBON_MULTIPLIER,
) {
  const [data, setData] = useState<TruckEnvironmentalImpact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      setLoading(true)

      if (DATA_SOURCE === 'mock') {
        const results = await computeStaticImpact(riskThreshold, n, cargoTons, carbonPrice)
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
  }, [riskThreshold, n, cargoTons, carbonPrice])

  useEffect(() => { fetch_() }, [fetch_])

  return { data, loading, error, refetch: fetch_ }
}
