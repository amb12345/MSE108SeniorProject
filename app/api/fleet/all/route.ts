import { NextResponse } from 'next/server'
import { fetchFleetFromAiven } from '@/lib/fleet-from-aiven'

export const dynamic = 'force-static'

/**
 * Returns ALL rows from fleet_decisions_full_6 (no deduplication by truck).
 * Used for cost and environmental aggregations that need to sum over every row.
 */
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([])
  }

  try {
    const data = await fetchFleetFromAiven()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching all fleet data:', error)
    return NextResponse.json([])
  }
}
