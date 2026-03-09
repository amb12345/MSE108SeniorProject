import { NextResponse } from 'next/server'
import { fleetToCostResults } from '@/lib/fleet-cost-adapter'

export const dynamic = 'force-static'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([])
  }

  try {
    const { fetchFleetListFromAiven } = await import('@/lib/fleet-from-aiven')

    const fleetData = await fetchFleetListFromAiven()
    const trucks = Array.isArray(fleetData) ? fleetData : fleetData ? [fleetData] : []

    const results = fleetToCostResults(
      trucks.map((t) => ({
        truck_id: t.truck_id,
        gps: t.gps,
        sensor: t.sensor,
        decision: t.decision,
      }))
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error computing costs:', error)
    return NextResponse.json([])
  }
}
