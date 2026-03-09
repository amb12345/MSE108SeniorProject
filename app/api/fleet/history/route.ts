import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ gps: [], sensor: [], decision: [] })
  }

  try {
    const { fetchFleetHistoryFromAiven } = await import('@/lib/fleet-from-aiven')
    const { searchParams } = new URL(request.url)
    const truckId = searchParams.get('truckId')
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const type = (searchParams.get('type') || 'all') as 'gps' | 'sensor' | 'decision' | 'all'

    if (!truckId) {
      return NextResponse.json(
        { error: 'truckId is required' },
        { status: 400 }
      )
    }

    const parsedTruckId = parseInt(truckId, 10)
    const data = await fetchFleetHistoryFromAiven(parsedTruckId, type, limit)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json({ gps: [], sensor: [], decision: [] })
  }
}
