import { useEffect, useState } from 'react'
import { DATA_SOURCE } from '@/lib/use-data-source'

export interface FleetTruckData {
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
    route: any
  } | null
}

/**
 * Hook to fetch fleet data — uses API when database mode, static file when static mode
 */
export function useFleetData(truckId?: number, pollInterval: number = 60000) {
  const [data, setData] = useState<FleetTruckData | FleetTruckData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        if (DATA_SOURCE === 'mock') {
          const { staticFleetData } = await import('@/lib/static-fleet-data')
          if (truckId !== undefined) {
            const truck = (staticFleetData as any[]).find((t: any) => t.truck_id === truckId)
            setData(truck || null)
          } else {
            setData(staticFleetData as any)
          }
          setError(null)
          setLoading(false)
          return
        }

        const url = truckId
          ? `/api/fleet/list?truckId=${truckId}`
          : '/api/fleet/list'
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        setData(await response.json())
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch fleet data')
        console.error('Error fetching fleet data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    if (DATA_SOURCE === 'database' && pollInterval > 0) {
      const interval = setInterval(fetchData, pollInterval)
      return () => clearInterval(interval)
    }
  }, [truckId, pollInterval])

  return { data, loading, error }
}

/**
 * Hook to fetch historical data for a specific truck
 */
export function useFleetHistory(
  truckId: number,
  type: 'gps' | 'sensor' | 'decision' | 'all' = 'all',
  limit: number = 100
) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)

        if (DATA_SOURCE === 'mock') {
          setData([])
          setError(null)
          setLoading(false)
          return
        }

        const url = `/api/fleet/history?truckId=${truckId}&type=${type}&limit=${limit}`
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        setData(await response.json())
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history')
        console.error('Error fetching history:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [truckId, type, limit])

  return { data, loading, error }
}

/**
 * Hook to fetch fleet statistics — uses API or static data
 */
export function useFleetStats(pollInterval: number = 300000) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        if (DATA_SOURCE === 'mock') {
          const { staticFleetStats } = await import('@/lib/static-fleet-data')
          setStats(staticFleetStats)
          setError(null)
          setLoading(false)
          return
        }

        const response = await fetch('/api/fleet/stats')
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        setStats(await response.json())
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    if (DATA_SOURCE === 'database' && pollInterval > 0) {
      const interval = setInterval(fetchStats, pollInterval)
      return () => clearInterval(interval)
    }
  }, [pollInterval])

  return { stats, loading, error }
}
