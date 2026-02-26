import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import Papa from 'papaparse'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

interface KafkaRow {
  timestamp: string
  timestampType: string
  partition: string
  offset: string
  key: string
  value: string
  headers: string
  exceededFields: string
}

async function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    Papa.parse<T>(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data)
      },
      error: (error: any) => {
        reject(error)
      },
    })
  })
}

async function importGpsData(csvPath: string) {
  console.log('📍 Importing GPS data...')
  
  const rows = await parseCSV<KafkaRow>(csvPath)
  let imported = 0
  let skipped = 0
  
  for (const row of rows) {
    try {
      const data = JSON.parse(row.value)
      
      await prisma.gpsData.create({
        data: {
          t: data.t,
          truck_id: data.truck_id,
          timestamp: new Date(data.timestamp),
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          speed_mph: typeof data.speed_mph === 'string' ? parseFloat(data.speed_mph) : data.speed_mph,
          current_node: data.current_node,
          next_node: data.next_node,
          destination_node: data.destination_node,
          at_node: data.at_node,
          is_facility_node: data.is_facility_node,
          edge_travel_time_min: data.edge_travel_time_min ? parseFloat(data.edge_travel_time_min) : null,
          edge_progress_frac: data.edge_progress_frac ? parseFloat(data.edge_progress_frac) : null,
        },
      })
      imported++
    } catch (error) {
      skipped++
      if (skipped < 5) {
        console.error('Error importing GPS row:', error)
      }
    }
  }
  
  console.log(`✅ GPS Data: ${imported} imported, ${skipped} skipped`)
}

async function importSensorData(csvPath: string) {
  console.log('🌡️  Importing sensor data...')
  
  const rows = await parseCSV<KafkaRow>(csvPath)
  let imported = 0
  let skipped = 0
  
  for (const row of rows) {
    try {
      const data = JSON.parse(row.value)
      
      await prisma.sensorData.create({
        data: {
          t: data.t,
          truck_id: data.truck_id,
          timestamp: new Date(data.timestamp),
          temperature_c: parseFloat(data.temperature_c),
          humidity_pct: typeof data.humidity_pct === 'string' ? parseFloat(data.humidity_pct) : data.humidity_pct,
          door_open: data.door_open,
          shipment_value: parseFloat(data.shipment_value),
          remaining_slack_min: parseFloat(data.remaining_slack_min),
          violation_min: typeof data.violation_min === 'string' ? parseFloat(data.violation_min) : data.violation_min,
          current_node: data.current_node,
          next_node: data.next_node,
          destination_node: data.destination_node,
          at_node: data.at_node,
          is_facility_node: data.is_facility_node,
          edge_travel_time_min: data.edge_travel_time_min ? parseFloat(data.edge_travel_time_min) : null,
          edge_progress_frac: data.edge_progress_frac ? parseFloat(data.edge_progress_frac) : null,
        },
      })
      imported++
    } catch (error) {
      skipped++
      if (skipped < 5) {
        console.error('Error importing sensor row:', error)
      }
    }
  }
  
  console.log(`✅ Sensor Data: ${imported} imported, ${skipped} skipped`)
}

async function importDecisionData(csvPath: string) {
  console.log('🎯 Importing decision data...')
  
  const rows = await parseCSV<KafkaRow>(csvPath)
  let imported = 0
  let skipped = 0
  
  for (const row of rows) {
    try {
      const data = JSON.parse(row.value)
      
      await prisma.decisionData.create({
        data: {
          truck_id: data.truck_id,
          timestamp: new Date(data.timestamp),
          recommended_action: data.recommended_action,
          mean_cost: typeof data.mean_cost === 'string' ? parseFloat(data.mean_cost) : data.mean_cost,
          all_actions: data.all_actions,
          reason: data.reason,
          route: data.route,
          mc_samples: data.mc_samples,
        },
      })
      imported++
    } catch (error) {
      skipped++
      if (skipped < 5) {
        console.error('Error importing decision row:', error)
      }
    }
  }
  
  console.log(`✅ Decision Data: ${imported} imported, ${skipped} skipped`)
}

async function main() {
  try {
    console.log('🚀 Starting CSV import process...\n')
    
    // Define paths to CSV files
    const gpsPath = path.join(__dirname, '../data/fleet.gps.csv')
    const sensorPath = path.join(__dirname, '../data/fleet sensors.csv')
    const decisionPath = path.join(__dirname, '../data/fleet decisions.csv')
    
    // Import all data
    await importGpsData(gpsPath)
    await importSensorData(sensorPath)
    await importDecisionData(decisionPath)
    
    // Get summary stats
    const gpsCount = await prisma.gpsData.count()
    const sensorCount = await prisma.sensorData.count()
    const decisionCount = await prisma.decisionData.count()
    const truckCount = await prisma.gpsData.findMany({
      distinct: ['truck_id'],
      select: { truck_id: true }
    })
    
    console.log('\n📊 Import Summary:')
    console.log(`   GPS Records: ${gpsCount}`)
    console.log(`   Sensor Records: ${sensorCount}`)
    console.log(`   Decision Records: ${decisionCount}`)
    console.log(`   Unique Trucks: ${truckCount.length}`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
