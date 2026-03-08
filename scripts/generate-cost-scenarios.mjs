/**
 * Generates data/fleet_cost_scenarios.csv from fleet CSV data.
 * This CSV is consumed by the Python cost_engine.py for standalone analysis.
 *
 * Usage:  node scripts/generate-cost-scenarios.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const dataDir = join(ROOT, 'data')

function parseKafkaCSV(filePath) {
  const content = readFileSync(filePath, 'utf-8')
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

// Build fleetData from CSV files (same structure as old static-fleet-data)
function readCsvIfExists(path) {
  if (!existsSync(path)) return []
  try {
    return parseKafkaCSV(path)
  } catch {
    return []
  }
}

const gpsRecords = readCsvIfExists(join(dataDir, 'fleet.gps.csv'))
const sensorRecords = readCsvIfExists(join(dataDir, 'fleet sensors.csv'))
const decisionRecords = readCsvIfExists(join(dataDir, 'fleet decisions.csv'))

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
  .map((truck_id) => ({
    truck_id,
    gps: latestGps.get(truck_id) || null,
    sensor: latestSensor.get(truck_id) || null,
    decision: latestDecision.get(truck_id) || null,
  }))

const COLUMNS = [
  'truck_id', 'node_id', 'minutes_above_temp', 'future_violation_if_continue',
  'reroute_reduction', 'detour_repair_benefit', 'slack_minutes',
  'door_open', 'high_humidity', 'distance_base_miles',
  'delay_base_minutes', 'spoilage_time_base_hours', 'shipment_value', 'recommended_action',
]

const rows = [COLUMNS.join(',')]

for (const truck of fleetData) {
  const sensor = truck.sensor
  const gps = truck.gps
  if (!sensor) continue

  const violationMin = parseFloat(String(sensor.violation_min ?? '0'))
  const edgeTravelMin = parseFloat(
    String(sensor.edge_travel_time_min ?? gps?.edge_travel_time_min ?? '30'),
  )
  const speedMph = gps?.speed_mph ?? 42.5
  const slackMin = sensor.remaining_slack_min ?? 0
  const humidityPct =
    typeof sensor.humidity_pct === 'string'
      ? parseFloat(sensor.humidity_pct)
      : (sensor.humidity_pct ?? 0)

  const minutesAboveTemp = violationMin
  const futureViolation = minutesAboveTemp + edgeTravelMin * 0.3

  const row = {
    truck_id: truck.truck_id,
    node_id: sensor.current_node ?? gps?.current_node ?? 0,
    minutes_above_temp: minutesAboveTemp.toFixed(2),
    future_violation_if_continue: futureViolation.toFixed(2),
    reroute_reduction: (futureViolation * 0.6).toFixed(2),
    detour_repair_benefit: Math.min(60, 30 + minutesAboveTemp * 0.5).toFixed(2),
    slack_minutes: Math.max(0, slackMin).toFixed(2),
    door_open: sensor.door_open ? 1 : 0,
    high_humidity: humidityPct >= 80 ? 1 : 0,
    distance_base_miles: ((edgeTravelMin * speedMph) / 60).toFixed(2),
    delay_base_minutes: Math.max(0, -slackMin).toFixed(2),
    spoilage_time_base_hours: (Math.max(0, -slackMin) / 60).toFixed(2),
    shipment_value: sensor.shipment_value?.toFixed(2) ?? '',
    recommended_action: truck.decision?.recommended_action ?? '',
  }

  rows.push(COLUMNS.map((col) => row[col]).join(','))
}

const outPath = join(ROOT, 'data/fleet_cost_scenarios.csv')
writeFileSync(outPath, rows.join('\n') + '\n')
console.log(`Wrote ${rows.length - 1} scenario rows to ${outPath}`)
