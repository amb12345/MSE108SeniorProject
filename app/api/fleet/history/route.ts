import { NextResponse } from 'next/server'
import { fetchFleetHistoryFromAiven } from '@/lib/fleet-from-aiven'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ gps: [], sensor: [], decision: [] })
  }

  try {
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
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
