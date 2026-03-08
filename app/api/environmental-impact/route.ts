import { NextResponse } from 'next/server'
import {
  fleetToEnvImpacts,
} from '@/lib/fleet-env-adapter'
import { DEFAULT_CARGO_TONS, EPA_CARBON_MULTIPLIER } from '@/lib/constants'
import { fetchFleetListFromAiven } from '@/lib/fleet-from-aiven'

export const dynamic = 'force-static'

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([])
  }

  try {
    const { searchParams } = new URL(request.url)
    const cargoTons = parseFloat(searchParams.get('cargo_tons') ?? String(DEFAULT_CARGO_TONS))
    const carbonPrice = parseFloat(searchParams.get('carbon_price') ?? String(EPA_CARBON_MULTIPLIER))

    const fleetData = await fetchFleetListFromAiven()
    const trucks = Array.isArray(fleetData) ? fleetData : fleetData ? [fleetData] : []

    const results = fleetToEnvImpacts(
      trucks.map((t) => ({
        truck_id: t.truck_id,
        gps: t.gps,
        sensor: t.sensor,
        decision: t.decision,
      })),
      cargoTons,
      carbonPrice
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error computing environmental impact:', error)
    return NextResponse.json([])
  }
}
