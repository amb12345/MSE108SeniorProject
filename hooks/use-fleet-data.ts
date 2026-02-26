import { useEffect, useState } from 'react'

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
 * Hook to fetch and poll fleet data from the database
 * @param truckId - Optional truck ID to fetch specific truck data
 * @param pollInterval - Polling interval in milliseconds (default: 60000 = 1 minute)
 */
export function useFleetData(truckId?: number, pollInterval: number = 60000) {
  const [data, setData] = useState<FleetTruckData | FleetTruckData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const url = truckId 
          ? `/api/fleet?truckId=${truckId}`
          : '/api/fleet'
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch fleet data')
        console.error('Error fetching fleet data:', err)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Set up polling if pollInterval > 0
    if (pollInterval > 0) {
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
        const url = `/api/fleet/history?truckId=${truckId}&type=${type}&limit=${limit}`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
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
 * Hook to fetch fleet statistics
 */
export function useFleetStats(pollInterval: number = 300000) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/fleet/stats')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setStats(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchStats()

    // Set up polling
    if (pollInterval > 0) {
      const interval = setInterval(fetchStats, pollInterval)
      return () => clearInterval(interval)
    }
  }, [pollInterval])

  return { stats, loading, error }
}
