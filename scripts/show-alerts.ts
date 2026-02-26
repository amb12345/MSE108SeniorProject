import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

async function showAlerts() {
  try {
    console.log('⚠️  ALERT ANALYSIS WITH NEW THRESHOLDS\n')
    console.log('============================================================\n')
    
    // Get all trucks
    const trucks = await prisma.gpsData.findMany({
      distinct: ['truck_id'],
      select: { truck_id: true },
      orderBy: { truck_id: 'asc' },
    })
    
    let tempAlerts = 0
    let humidityWarnings = 0
    let humidityCritical = 0
    let doorOpenAlerts = 0
    
    console.log('🔍 Alert Detection (NEW THRESHOLDS):\n')
    console.log('  🌡️  Temperature: > 64.4°F = CRITICAL')
    console.log('  💧 Humidity: >= 80% = WARNING, >= 90% = CRITICAL')
    console.log('  🚪 Door: Open = WARNING\n')
    console.log('------------------------------------------------------------\n')
    
    for (const { truck_id } of trucks.slice(0, 10)) {
      const sensor = await prisma.sensorData.findFirst({
        where: { truck_id },
        orderBy: { timestamp: 'desc' },
      })
      
      if (!sensor) continue
      
      const alerts: string[] = []
      const tempF = sensor.temperature_c // Actually in Fahrenheit
      
      // Temperature check
      if (tempF > 64.4) {
        alerts.push(`🔴 TEMP: ${tempF.toFixed(1)}°F`)
        tempAlerts++
      }
      
      // Humidity checks
      if (sensor.humidity_pct >= 90) {
        alerts.push(`🔴 HUMIDITY CRITICAL: ${sensor.humidity_pct.toFixed(1)}%`)
        humidityCritical++
      } else if (sensor.humidity_pct >= 80) {
        alerts.push(`🟡 HUMIDITY WARNING: ${sensor.humidity_pct.toFixed(1)}%`)
        humidityWarnings++
      }
      
      // Door check
      if (sensor.door_open) {
        alerts.push(`🟡 DOOR OPEN`)
        doorOpenAlerts++
      }
      
      if (alerts.length > 0) {
        console.log(`Truck ${truck_id}:`)
        alerts.forEach(a => console.log(`  ${a}`))
        console.log()
      }
    }
    
    console.log('============================================================\n')
    console.log('📊 ALERT SUMMARY (First 10 Trucks Shown):\n')
    console.log(`  🔴 High Temperature (>64.4°F): ${tempAlerts}`)
    console.log(`  🔴 Critical Humidity (>=90%): ${humidityCritical}`)
    console.log(`  🟡 Humidity Warning (>=80%): ${humidityWarnings}`)
    console.log(`  🟡 Door Open: ${doorOpenAlerts}`)
    console.log(`  📊 Total Alerts: ${tempAlerts + humidityCritical + humidityWarnings + doorOpenAlerts}`)
    
    // Get full fleet counts (latest reading per truck)
    const truckIds = trucks.map(t => t.truck_id)
    let fullTempCount = 0
    let fullHumidityCritical = 0
    let fullHumidityWarning = 0
    let fullDoorOpen = 0
    
    for (const truck_id of truckIds) {
      const latestSensor = await prisma.sensorData.findFirst({
        where: { truck_id },
        orderBy: { timestamp: 'desc' },
      })
      
      if (!latestSensor) continue
      
      const tempF = latestSensor.temperature_c // Actually in Fahrenheit
      if (tempF > 64.4) fullTempCount++
      if (latestSensor.humidity_pct >= 90) fullHumidityCritical++
      else if (latestSensor.humidity_pct >= 80) fullHumidityWarning++
      if (latestSensor.door_open) fullDoorOpen++
    }
    
    console.log('\n📈 FULL FLEET ALERT COUNTS (All 50 Trucks):\n')
    console.log(`  🔴 High Temperature (>64.4°F): ${fullTempCount} trucks`)
    console.log(`  🔴 Critical Humidity (>=90%): ${fullHumidityCritical} trucks`)
    console.log(`  🟡 Humidity Warning (>=80%): ${fullHumidityWarning} trucks`)
    console.log(`  🟡 Door Open: ${fullDoorOpen} trucks`)
    console.log(`  📊 Total: ${fullTempCount + fullHumidityCritical + fullHumidityWarning + fullDoorOpen} alerts`)
    
    console.log('\n✅ Alert analysis complete!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showAlerts()
