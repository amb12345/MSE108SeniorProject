import { NextResponse } from 'next/server'
import {
  evaluateScenario,
  deriveScenarioFromFleetData,
  type ScenarioRow,
} from '@/lib/cost-engine'

export const dynamic = 'force-static'

export async function GET(request: Request) {
  if (process.env.NEXT_PUBLIC_BUILD_MODE === 'static') {
    return NextResponse.json([])
  }

  const { prisma } = await import('@/lib/db')

  try {
    const { searchParams } = new URL(request.url)
    const riskThreshold = parseFloat(searchParams.get('risk_threshold') ?? '0.50')
    const n = parseInt(searchParams.get('n') ?? '20000', 10)
    const seed = parseInt(searchParams.get('seed') ?? '42', 10)

    const trucks = await prisma.gpsData.findMany({
      distinct: ['truck_id'],
      select: { truck_id: true },
      orderBy: { truck_id: 'asc' },
    })

    const results = await Promise.all(
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

        if (!latestSensor) return null

        const scenario = deriveScenarioFromFleetData({
          truck_id,
          gps: latestGps,
          sensor: latestSensor,
          decision: latestDecision,
        })
        if (!scenario) return null

        return evaluateScenario(scenario, riskThreshold, n, seed + truck_id)
      }),
    )

    return NextResponse.json(results.filter(Boolean))
  } catch (error) {
    console.error('Error computing costs:', error)
    return NextResponse.json(
      { error: 'Failed to compute cost analysis' },
      { status: 500 },
    )
  }
}
