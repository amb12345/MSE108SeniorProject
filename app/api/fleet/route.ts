import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const truckId = searchParams.get('truckId')
    
    // Get all unique truck IDs
    const trucks = await prisma.gpsData.findMany({
      distinct: ['truck_id'],
      select: { truck_id: true },
      orderBy: { truck_id: 'asc' },
    })
    
    // Get latest data for each truck
    const fleetData = await Promise.all(
      trucks.map(async ({ truck_id }) => {
        const [latestGps, latestSensor, latestDecision] = await Promise.all([
          prisma.gpsData.findFirst({
            where: { truck_id },
            orderBy: { timestamp: 'desc' },
          }),
          prisma.sensorData.findFirst({
            where: { truck_id },
            orderBy: { timestamp: 'desc' },
          }),
          prisma.decisionData.findFirst({
            where: { truck_id },
            orderBy: { timestamp: 'desc' },
          }),
        ])
        
        return {
          truck_id,
          gps: latestGps,
          sensor: latestSensor,
          decision: latestDecision,
        }
      })
    )
    
    // If truckId specified, return only that truck's data
    if (truckId) {
      const truck = fleetData.find(t => t.truck_id === parseInt(truckId))
      return NextResponse.json(truck || null)
    }
    
    return NextResponse.json(fleetData)
  } catch (error) {
    console.error('Error fetching fleet data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fleet data' },
      { status: 500 }
    )
  }
}
