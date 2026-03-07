import { NextResponse } from 'next/server'
import {
  evaluateScenario,
  deriveScenarioFromFleetData,
} from '@/lib/cost-engine'
import { fetchFleetListFromAiven } from '@/lib/fleet-from-aiven'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([])
  }

  try {
    const { searchParams } = new URL(request.url)
    const riskThreshold = parseFloat(searchParams.get('risk_threshold') ?? '0.50')
    const n = parseInt(searchParams.get('n') ?? '20000', 10)
    const seed = parseInt(searchParams.get('seed') ?? '42', 10)

    const fleetData = await fetchFleetListFromAiven()
    const trucks = Array.isArray(fleetData) ? fleetData : fleetData ? [fleetData] : []

    const results = await Promise.all(
      trucks.map(async (truck) => {
        const scenario = deriveScenarioFromFleetData({
          truck_id: truck.truck_id,
          gps: truck.gps,
          sensor: truck.sensor,
          decision: truck.decision,
        })
        if (!scenario) return null
        return evaluateScenario(scenario, riskThreshold, n, seed + truck.truck_id)
      })
    )

    return NextResponse.json(results.filter(Boolean))
  } catch (error) {
    console.error('Error computing costs:', error)
    return NextResponse.json(
      { error: 'Failed to compute cost analysis' },
      { status: 500 }
    )
  }
}
