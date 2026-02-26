import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper functions to query fleet data

export async function getLatestGpsData(truckId?: number, limit: number = 100) {
  return await prisma.gpsData.findMany({
    where: truckId ? { truck_id: truckId } : undefined,
    orderBy: { timestamp: 'desc' },
    take: limit,
  })
}

export async function getLatestSensorData(truckId?: number, limit: number = 100) {
  return await prisma.sensorData.findMany({
    where: truckId ? { truck_id: truckId } : undefined,
    orderBy: { timestamp: 'desc' },
    take: limit,
  })
}

export async function getLatestDecisions(truckId?: number, limit: number = 50) {
  return await prisma.decisionData.findMany({
    where: truckId ? { truck_id: truckId } : undefined,
    orderBy: { timestamp: 'desc' },
    take: limit,
  })
}

export async function getAllTrucks() {
  const trucks = await prisma.gpsData.findMany({
    distinct: ['truck_id'],
    select: { truck_id: true },
    orderBy: { truck_id: 'asc' },
  })
  
  return trucks.map(t => t.truck_id)
}

export async function getTruckStats(truckId: number) {
  const [latestGps, latestSensor, latestDecision] = await Promise.all([
    prisma.gpsData.findFirst({
      where: { truck_id: truckId },
      orderBy: { timestamp: 'desc' },
    }),
    prisma.sensorData.findFirst({
      where: { truck_id: truckId },
      orderBy: { timestamp: 'desc' },
    }),
    prisma.decisionData.findFirst({
      where: { truck_id: truckId },
      orderBy: { timestamp: 'desc' },
    }),
  ])
  
  return {
    gps: latestGps,
    sensor: latestSensor,
    decision: latestDecision,
  }
}

export async function getFleetOverview() {
  const trucks = await getAllTrucks()
  const stats = await Promise.all(
    trucks.map(truckId => getTruckStats(truckId))
  )
  
  return trucks.map((truckId, index) => ({
    truck_id: truckId,
    ...stats[index],
  }))
}
