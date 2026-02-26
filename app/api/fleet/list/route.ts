import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function GET(request: Request) {
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'static') {
    return NextResponse.json([])
  }

  const { prisma } = await import('@/lib/db')
  try {
    const { searchParams } = new URL(request.url)
    const truckId = searchParams.get('truckId')
    
    const trucks = await prisma.gpsData.findMany({
      distinct: ['truck_id'],
      select: { truck_id: true },
      orderBy: { truck_id: 'asc' },
    })
    
    const fleetData = await Promise.all(
      trucks.map(async ({ truck_id }: { truck_id: number }) => {
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
