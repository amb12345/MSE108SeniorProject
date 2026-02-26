import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

async function showData() {
  try {
    console.log('📊 DATABASE CONTENTS\n')
    console.log('============================================================\n')
    
    // Show GPS data
    console.log('📍 GPS DATA (First 5 records):\n')
    const gpsData = await prisma.gpsData.findMany({
      take: 5,
      orderBy: { truck_id: 'asc' }
    })
    
    gpsData.forEach(record => {
      console.log(`Truck ${record.truck_id}:`)
      console.log(`  Location: ${record.latitude}, ${record.longitude}`)
      console.log(`  Speed: ${record.speed_mph} mph`)
      console.log(`  Timestamp: ${record.timestamp}`)
      console.log(`  At Node: ${record.current_node} → ${record.next_node}\n`)
    })
    
    console.log('------------------------------------------------------------\n')
    
    // Show Sensor data
    console.log('🌡️  SENSOR DATA (First 5 records):\n')
    const sensorData = await prisma.sensorData.findMany({
      take: 5,
      orderBy: { truck_id: 'asc' }
    })
    
    sensorData.forEach(record => {
      console.log(`Truck ${record.truck_id}:`)
      console.log(`  Temperature: ${record.temperature_c}°C`)
      console.log(`  Humidity: ${record.humidity_pct}%`)
      console.log(`  Door: ${record.door_open ? 'OPEN' : 'CLOSED'}`)
      console.log(`  Shipment Value: $${record.shipment_value.toFixed(2)}`)
      console.log(`  Slack Time: ${record.remaining_slack_min.toFixed(1)} min`)
      console.log(`  Timestamp: ${record.timestamp}\n`)
    })
    
    console.log('------------------------------------------------------------\n')
    
    // Show Decision data
    console.log('🎯 DECISION DATA (First 3 records):\n')
    const decisionData = await prisma.decisionData.findMany({
      take: 3,
      orderBy: { truck_id: 'asc' }
    })
    
    decisionData.forEach(record => {
      console.log(`Truck ${record.truck_id}:`)
      console.log(`  Recommended: ${record.recommended_action.toUpperCase()}`)
      console.log(`  Mean Cost: $${record.mean_cost.toFixed(2)}`)
      const route = record.route as any
      console.log(`  Route: Node ${route?.current_node || 'N/A'} → ${route?.chosen_next || 'N/A'}`)
      console.log(`  Timestamp: ${record.timestamp}\n`)
    })
    
    console.log('============================================================\n')
    
    // Show statistics
    console.log('📈 FLEET STATISTICS:\n')
    
    const stats = await Promise.all([
      prisma.gpsData.count(),
      prisma.sensorData.count(),
      prisma.decisionData.count(),
      prisma.gpsData.aggregate({ _avg: { speed_mph: true } }),
      prisma.sensorData.aggregate({ 
        _avg: { temperature_c: true, humidity_pct: true }
      }),
      prisma.gpsData.findMany({ distinct: ['truck_id'], select: { truck_id: true } })
    ])
    
    console.log(`Total Trucks: ${stats[5].length}`)
    console.log(`GPS Records: ${stats[0]}`)
    console.log(`Sensor Records: ${stats[1]}`)
    console.log(`Decision Records: ${stats[2]}`)
    console.log(`Average Speed: ${stats[3]._avg.speed_mph?.toFixed(2)} mph`)
    console.log(`Average Temperature: ${stats[4]._avg.temperature_c?.toFixed(2)}°C`)
    console.log(`Average Humidity: ${stats[4]._avg.humidity_pct?.toFixed(2)}%`)
    
    // Alert counts
    const highTemp = await prisma.sensorData.count({ where: { temperature_c: { gt: 100 } } })
    const highHumidity = await prisma.sensorData.count({ where: { humidity_pct: { gt: 85 } } })
    const doorOpen = await prisma.sensorData.count({ where: { door_open: true } })
    
    console.log('\n⚠️  ALERTS:')
    console.log(`High Temperature (>100°C): ${highTemp}`)
    console.log(`High Humidity (>85%): ${highHumidity}`)
    console.log(`Door Open: ${doorOpen}`)
    
    console.log('\n✅ Database query completed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showData()
