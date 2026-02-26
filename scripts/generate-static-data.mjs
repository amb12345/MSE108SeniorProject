import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function parseKafkaCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n').slice(1)
  const records = []

  for (const line of lines) {
    const valueMatch = line.match(/"\{.*?\}"/)
    if (!valueMatch) continue
    try {
      const json = valueMatch[0].slice(1, -1).replace(/""/g, '"')
      records.push(JSON.parse(json))
    } catch { /* skip malformed */ }
  }

  return records
}

function getLatestPerTruck(records) {
  const latest = new Map()
  for (const record of records) {
    const id = record.truck_id
    if (!latest.has(id)) {
      latest.set(id, record)
    } else {
      const existing = latest.get(id)
      if (new Date(record.timestamp) > new Date(existing.timestamp)) {
        latest.set(id, record)
      }
    }
  }
  return latest
}

const dataDir = path.join(__dirname, '../data')

console.log('Parsing CSV files...')
const gpsRecords = parseKafkaCSV(path.join(dataDir, 'fleet.gps.csv'))
const sensorRecords = parseKafkaCSV(path.join(dataDir, 'fleet sensors.csv'))
const decisionRecords = parseKafkaCSV(path.join(dataDir, 'fleet decisions.csv'))

console.log(`  GPS records: ${gpsRecords.length}`)
console.log(`  Sensor records: ${sensorRecords.length}`)
console.log(`  Decision records: ${decisionRecords.length}`)

const latestGps = getLatestPerTruck(gpsRecords)
const latestSensor = getLatestPerTruck(sensorRecords)
const latestDecision = getLatestPerTruck(decisionRecords)

const allTruckIds = new Set([
  ...latestGps.keys(),
  ...latestSensor.keys(),
  ...latestDecision.keys(),
])

const fleetData = Array.from(allTruckIds)
  .sort((a, b) => a - b)
  .map(truck_id => ({
    truck_id,
    gps: latestGps.get(truck_id) || null,
    sensor: latestSensor.get(truck_id) || null,
    decision: latestDecision.get(truck_id) || null,
  }))

const sensors = fleetData.filter(t => t.sensor).map(t => t.sensor)
const gpsEntries = fleetData.filter(t => t.gps).map(t => t.gps)
const avgTemp = sensors.reduce((s, r) => s + (r.temperature_c || 0), 0) / sensors.length
const avgHumidity = sensors.reduce((s, r) => s + parseFloat(r.humidity_pct || 0), 0) / sensors.length
const avgSpeed = gpsEntries.reduce((s, r) => s + parseFloat(r.speed_mph || 0), 0) / gpsEntries.length

const stats = {
  counts: {
    trucks: fleetData.length,
    gpsRecords: gpsRecords.length,
    sensorRecords: sensorRecords.length,
    decisionRecords: decisionRecords.length,
  },
  timeRange: {
    oldest: gpsRecords[gpsRecords.length - 1]?.timestamp,
    newest: gpsRecords[0]?.timestamp,
  },
  averages: {
    temperature_c: avgTemp,
    humidity_pct: avgHumidity,
    speed_mph: avgSpeed,
  },
}

const output = `// Auto-generated from CSV data — do not edit manually

export const staticFleetData: any[] = ${JSON.stringify(fleetData, null, 2)}

export const staticFleetStats: any = ${JSON.stringify(stats, null, 2)}
`

const outPath = path.join(__dirname, '../lib/static-fleet-data.ts')
fs.writeFileSync(outPath, output)
console.log(`Generated ${outPath}`)
console.log(`  ${fleetData.length} trucks`)
console.log(`  Avg temp: ${avgTemp.toFixed(1)}°F, Avg humidity: ${avgHumidity.toFixed(1)}%, Avg speed: ${avgSpeed.toFixed(1)} mph`)
