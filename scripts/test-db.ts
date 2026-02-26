import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...\n')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful!\n')
    
    // Get counts
    const [gpsCount, sensorCount, decisionCount] = await Promise.all([
      prisma.gpsData.count(),
      prisma.sensorData.count(),
      prisma.decisionData.count(),
    ])
    
    console.log('📊 Record Counts:')
    console.log(`   GPS Records: ${gpsCount}`)
    console.log(`   Sensor Records: ${sensorCount}`)
    console.log(`   Decision Records: ${decisionCount}\n`)
    
    // Get unique trucks
    const trucks = await prisma.gpsData.findMany({
      distinct: ['truck_id'],
      select: { truck_id: true },
      orderBy: { truck_id: 'asc' },
    })
    
    console.log(`🚚 Total Trucks: ${trucks.length}`)
    console.log(`   Truck IDs: ${trucks.map(t => t.truck_id).join(', ')}\n`)
    
    // Get sample GPS data
    console.log('📍 Sample GPS Data (Truck 0):')
    const sampleGps = await prisma.gpsData.findFirst({
      where: { truck_id: 0 },
      orderBy: { timestamp: 'desc' },
    })
    
    if (sampleGps) {
      console.log(`   Location: ${sampleGps.latitude}, ${sampleGps.longitude}`)
      console.log(`   Speed: ${sampleGps.speed_mph} mph`)
      console.log(`   Timestamp: ${sampleGps.timestamp}`)
    } else {
      console.log('   No GPS data found for Truck 0')
    }
    
    // Get sample sensor data
    console.log('\n🌡️  Sample Sensor Data (Truck 0):')
    const sampleSensor = await prisma.sensorData.findFirst({
      where: { truck_id: 0 },
      orderBy: { timestamp: 'desc' },
    })
    
    if (sampleSensor) {
      console.log(`   Temperature: ${sampleSensor.temperature_c}°C`)
      console.log(`   Humidity: ${sampleSensor.humidity_pct}%`)
      console.log(`   Door Open: ${sampleSensor.door_open}`)
      console.log(`   Shipment Value: $${sampleSensor.shipment_value.toFixed(2)}`)
      console.log(`   Timestamp: ${sampleSensor.timestamp}`)
    } else {
      console.log('   No sensor data found for Truck 0')
    }
    
    // Calculate some statistics
    console.log('\n📈 Fleet Statistics:')
    const avgSpeed = await prisma.gpsData.aggregate({
      _avg: { speed_mph: true },
    })
    const avgTemp = await prisma.sensorData.aggregate({
      _avg: { temperature_c: true },
    })
    const avgHumidity = await prisma.sensorData.aggregate({
      _avg: { humidity_pct: true },
    })
    
    console.log(`   Average Speed: ${avgSpeed._avg.speed_mph?.toFixed(2)} mph`)
    console.log(`   Average Temperature: ${avgTemp._avg.temperature_c?.toFixed(2)}°C`)
    console.log(`   Average Humidity: ${avgHumidity._avg.humidity_pct?.toFixed(2)}%`)
    
    // Count alerts
    const highTempCount = await prisma.sensorData.count({
      where: { temperature_c: { gt: 100 } },
    })
    const highHumidityCount = await prisma.sensorData.count({
      where: { humidity_pct: { gt: 85 } },
    })
    const doorOpenCount = await prisma.sensorData.count({
      where: { door_open: true },
    })
    
    console.log('\n⚠️  Alert Counts:')
    console.log(`   High Temperature (>100°C): ${highTempCount}`)
    console.log(`   High Humidity (>85%): ${highHumidityCount}`)
    console.log(`   Door Open: ${doorOpenCount}`)
    
    console.log('\n✅ Database test completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error)
    console.error('\nTroubleshooting:')
    console.error('1. Check your DATABASE_URL in .env file')
    console.error('2. Ensure PostgreSQL is running')
    console.error('3. Run: npm run db:push')
    console.error('4. Run: npm run db:import')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
