import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const truckId = searchParams.get('truckId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const type = searchParams.get('type') // 'gps', 'sensor', 'decision'
    
    if (!truckId) {
      return NextResponse.json(
        { error: 'truckId is required' },
        { status: 400 }
      )
    }
    
    const parsedTruckId = parseInt(truckId)
    
    let data
    switch (type) {
      case 'gps':
        data = await prisma.gpsData.findMany({
          where: { truck_id: parsedTruckId },
          orderBy: { timestamp: 'desc' },
          take: limit,
        })
        break
      case 'sensor':
        data = await prisma.sensorData.findMany({
          where: { truck_id: parsedTruckId },
          orderBy: { timestamp: 'desc' },
          take: limit,
        })
        break
      case 'decision':
        data = await prisma.decisionData.findMany({
          where: { truck_id: parsedTruckId },
          orderBy: { timestamp: 'desc' },
          take: limit,
        })
        break
      default:
        // Get all types
        const [gps, sensor, decision] = await Promise.all([
          prisma.gpsData.findMany({
            where: { truck_id: parsedTruckId },
            orderBy: { timestamp: 'desc' },
            take: limit,
          }),
          prisma.sensorData.findMany({
            where: { truck_id: parsedTruckId },
            orderBy: { timestamp: 'desc' },
            take: limit,
          }),
          prisma.decisionData.findMany({
            where: { truck_id: parsedTruckId },
            orderBy: { timestamp: 'desc' },
            take: limit,
          }),
        ])
        return NextResponse.json({ gps, sensor, decision })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
