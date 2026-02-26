import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get counts and statistics
    const [gpsCount, sensorCount, decisionCount] = await Promise.all([
      prisma.gpsData.count(),
      prisma.sensorData.count(),
      prisma.decisionData.count(),
    ])
    
    // Get unique trucks
    const trucks = await prisma.gpsData.findMany({
      distinct: ['truck_id'],
      select: { truck_id: true },
    })
    
    // Get time range
    const [oldestGps, newestGps] = await Promise.all([
      prisma.gpsData.findFirst({
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true },
      }),
      prisma.gpsData.findFirst({
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      }),
    ])
    
    // Calculate fleet-wide averages from latest sensor data
    const latestSensors = await prisma.sensorData.findMany({
      where: {
        truck_id: { in: trucks.map(t => t.truck_id) },
      },
      distinct: ['truck_id'],
      orderBy: { timestamp: 'desc' },
    })
    
    const avgTemp = latestSensors.reduce((sum, s) => sum + s.temperature_c, 0) / latestSensors.length
    const avgHumidity = latestSensors.reduce((sum, s) => sum + s.humidity_pct, 0) / latestSensors.length
    const avgSpeed = await prisma.gpsData.aggregate({
      _avg: { speed_mph: true },
    })
    
    return NextResponse.json({
      counts: {
        trucks: trucks.length,
        gpsRecords: gpsCount,
        sensorRecords: sensorCount,
        decisionRecords: decisionCount,
      },
      timeRange: {
        oldest: oldestGps?.timestamp,
        newest: newestGps?.timestamp,
      },
      averages: {
        temperature_c: avgTemp,
        humidity_pct: avgHumidity,
        speed_mph: avgSpeed._avg.speed_mph,
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
