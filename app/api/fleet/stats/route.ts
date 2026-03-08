import { NextResponse } from 'next/server'
import { fetchFleetStatsFromAiven } from '@/lib/fleet-from-aiven'

export const dynamic = 'force-static'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      counts: { trucks: 0, gpsRecords: 0, sensorRecords: 0, decisionRecords: 0 },
      timeRange: {},
      averages: {},
    })
  }

  try {
    const stats = await fetchFleetStatsFromAiven()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({
      counts: { trucks: 0, gpsRecords: 0, sensorRecords: 0, decisionRecords: 0 },
      timeRange: {},
      averages: {},
    })
  }
}
