import { NextResponse } from 'next/server'
import {
  evaluateScenario,
  deriveScenarioFromFleetData,
} from '@/lib/cost-engine'
import {
  computeTruckEnvironmentalImpact,
  DEFAULT_CARGO_TONS,
  EPA_CARBON_MULTIPLIER,
} from '@/lib/environmental-engine'
import { fetchFleetListFromAiven } from '@/lib/fleet-from-aiven'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([])
  }

  try {
    const { searchParams } = new URL(request.url)
    const riskThreshold = parseFloat(searchParams.get('risk') ?? '0.50')
    const n = parseInt(searchParams.get('n') ?? '5000', 10)
    const cargoTons = parseFloat(searchParams.get('cargo_tons') ?? String(DEFAULT_CARGO_TONS))
    const carbonPrice = parseFloat(searchParams.get('carbon_price') ?? String(EPA_CARBON_MULTIPLIER))
    const seed = 42

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

        const costResult = evaluateScenario(scenario, riskThreshold, n, seed + truck.truck_id)
        return computeTruckEnvironmentalImpact(
          costResult,
          scenario.distance_base_miles,
          cargoTons,
          carbonPrice
        )
      })
    )

    return NextResponse.json(results.filter(Boolean))
  } catch (error) {
    console.error('Error computing environmental impact:', error)
    return NextResponse.json([])
  }
}
