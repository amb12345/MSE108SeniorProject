/**
 * Import fleet CSV data into Aiven PostgreSQL.
 * Creates tables: test_fleet_sensors, test_fleet_decisions, test_fleet_gps
 *
 * Usage: DATABASE_URL="postgres://..." npx ts-node scripts/import-aiven.ts
 * Or set AIVEN_DATABASE_URL in .env
 */

import { Pool } from 'pg'
import * as fs from 'fs'
import Papa from 'papaparse'

const AIVEN_URI =
  process.env.AIVEN_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgres://avnadmin:AVNS_FWSz-4CIrp0vM_TjfU4@msaeibm-msaeibm108-d704.a.aivencloud.com:17795/defaultdb?sslmode=require'

const CSV_PATHS = {
  sensors: process.env.SENSORS_CSV || '/Users/Amber/Downloads/fleet sensors.csv',
  decisions: process.env.DECISIONS_CSV || '/Users/Amber/Downloads/fleet decisions.csv',
  gps: process.env.GPS_CSV || '/Users/Amber/Downloads/fleet.gps.csv',
}

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

function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const content = fs.readFileSync(filePath, 'utf-8')
    Papa.parse<T>(content, {
      header: true,
      skipEmptyLines: true,
      complete: (r) => resolve(r.data),
      error: (e: Error) => reject(e),
    })
  })
}

async function createTables(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS test_fleet_gps (
      id SERIAL PRIMARY KEY,
      t INTEGER NOT NULL,
      truck_id INTEGER NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      speed_mph DOUBLE PRECISION NOT NULL,
      current_node INTEGER,
      next_node INTEGER,
      destination_node INTEGER,
      at_node BOOLEAN,
      is_facility_node BOOLEAN,
      edge_travel_time_min DOUBLE PRECISION,
      edge_progress_frac DOUBLE PRECISION
    );
    CREATE INDEX IF NOT EXISTS idx_test_fleet_gps_truck_ts ON test_fleet_gps(truck_id, timestamp);
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS test_fleet_sensors (
      id SERIAL PRIMARY KEY,
      t INTEGER NOT NULL,
      truck_id INTEGER NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL,
      temperature_c DOUBLE PRECISION NOT NULL,
      humidity_pct DOUBLE PRECISION NOT NULL,
      door_open BOOLEAN NOT NULL,
      shipment_value DOUBLE PRECISION NOT NULL,
      remaining_slack_min DOUBLE PRECISION NOT NULL,
      violation_min DOUBLE PRECISION NOT NULL,
      current_node INTEGER,
      next_node INTEGER,
      destination_node INTEGER,
      at_node BOOLEAN,
      is_facility_node BOOLEAN,
      edge_travel_time_min DOUBLE PRECISION,
      edge_progress_frac DOUBLE PRECISION
    );
    CREATE INDEX IF NOT EXISTS idx_test_fleet_sensors_truck_ts ON test_fleet_sensors(truck_id, timestamp);
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS test_fleet_decisions (
      id SERIAL PRIMARY KEY,
      truck_id INTEGER NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL,
      recommended_action VARCHAR(50) NOT NULL,
      mean_cost DOUBLE PRECISION NOT NULL,
      all_actions JSONB NOT NULL,
      reason TEXT NOT NULL,
      route JSONB NOT NULL,
      mc_samples INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_test_fleet_decisions_truck_ts ON test_fleet_decisions(truck_id, timestamp);
  `)
}

async function importGps(pool: Pool, csvPath: string) {
  if (!fs.existsSync(csvPath)) throw new Error(`File not found: ${csvPath}`)
  const rows = await parseCSV<KafkaRow>(csvPath)
  let imported = 0
  let skipped = 0

  const client = await pool.connect()
  try {
    for (const row of rows) {
      try {
        const d = JSON.parse(row.value)
        const speed = typeof d.speed_mph === 'string' ? parseFloat(d.speed_mph) : d.speed_mph
        const edgeTime = d.edge_travel_time_min ? parseFloat(d.edge_travel_time_min) : null
        const edgeFrac = d.edge_progress_frac ? parseFloat(d.edge_progress_frac) : null

        await client.query(
          `INSERT INTO test_fleet_gps (t, truck_id, timestamp, latitude, longitude, speed_mph,
            current_node, next_node, destination_node, at_node, is_facility_node,
            edge_travel_time_min, edge_progress_frac)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            d.t,
            d.truck_id,
            d.timestamp,
            d.latitude,
            d.longitude,
            speed,
            d.current_node ?? null,
            d.next_node ?? null,
            d.destination_node ?? null,
            d.at_node ?? null,
            d.is_facility_node ?? null,
            edgeTime,
            edgeFrac,
          ]
        )
        imported++
      } catch {
        skipped++
      }
    }
  } finally {
    client.release()
  }
  return { imported, skipped }
}

async function importSensors(pool: Pool, csvPath: string) {
  if (!fs.existsSync(csvPath)) throw new Error(`File not found: ${csvPath}`)
  const rows = await parseCSV<KafkaRow>(csvPath)
  let imported = 0
  let skipped = 0

  const client = await pool.connect()
  try {
    for (const row of rows) {
      try {
        const d = JSON.parse(row.value)
        const humidity = typeof d.humidity_pct === 'string' ? parseFloat(d.humidity_pct) : d.humidity_pct
        const violation = typeof d.violation_min === 'string' ? parseFloat(d.violation_min) : d.violation_min
        const edgeTime = d.edge_travel_time_min ? parseFloat(d.edge_travel_time_min) : null
        const edgeFrac = d.edge_progress_frac ? parseFloat(d.edge_progress_frac) : null

        await client.query(
          `INSERT INTO test_fleet_sensors (t, truck_id, timestamp, temperature_c, humidity_pct, door_open,
            shipment_value, remaining_slack_min, violation_min, current_node, next_node, destination_node,
            at_node, is_facility_node, edge_travel_time_min, edge_progress_frac)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            d.t,
            d.truck_id,
            d.timestamp,
            d.temperature_c,
            humidity,
            d.door_open,
            d.shipment_value,
            d.remaining_slack_min,
            violation,
            d.current_node ?? null,
            d.next_node ?? null,
            d.destination_node ?? null,
            d.at_node ?? null,
            d.is_facility_node ?? null,
            edgeTime,
            edgeFrac,
          ]
        )
        imported++
      } catch {
        skipped++
      }
    }
  } finally {
    client.release()
  }
  return { imported, skipped }
}

async function importDecisions(pool: Pool, csvPath: string) {
  if (!fs.existsSync(csvPath)) throw new Error(`File not found: ${csvPath}`)
  const rows = await parseCSV<KafkaRow>(csvPath)
  let imported = 0
  let skipped = 0

  const client = await pool.connect()
  try {
    for (const row of rows) {
      try {
        const d = JSON.parse(row.value)
        const meanCost = typeof d.mean_cost === 'string' ? parseFloat(d.mean_cost) : d.mean_cost

        await client.query(
          `INSERT INTO test_fleet_decisions (truck_id, timestamp, recommended_action, mean_cost, all_actions, reason, route, mc_samples)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            d.truck_id,
            d.timestamp,
            d.recommended_action,
            meanCost,
            JSON.stringify(d.all_actions),
            d.reason,
            JSON.stringify(d.route),
            d.mc_samples,
          ]
        )
        imported++
      } catch {
        skipped++
      }
    }
  } finally {
    client.release()
  }
  return { imported, skipped }
}

async function main() {
  console.log('🚀 Connecting to Aiven PostgreSQL...\n')

  // Strip sslmode from URL and use explicit ssl config (Aiven cert chain may need relax)
  const connUrl = AIVEN_URI.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$|&$/, '')
  const pool = new Pool({
    connectionString: connUrl,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await pool.query('SELECT 1')
    console.log('✅ Connected successfully\n')

    console.log('📋 Creating tables...')
    await createTables(pool)
    console.log('   test_fleet_gps, test_fleet_sensors, test_fleet_decisions\n')

    console.log('📍 Importing GPS data...')
    const gpsRes = await importGps(pool, CSV_PATHS.gps)
    console.log(`   ${gpsRes.imported} imported, ${gpsRes.skipped} skipped\n`)

    console.log('🌡️  Importing sensor data...')
    const sensorRes = await importSensors(pool, CSV_PATHS.sensors)
    console.log(`   ${sensorRes.imported} imported, ${sensorRes.skipped} skipped\n`)

    console.log('🎯 Importing decision data...')
    const decisionRes = await importDecisions(pool, CSV_PATHS.decisions)
    console.log(`   ${decisionRes.imported} imported, ${decisionRes.skipped} skipped\n`)

    const [gpsCount, sensorCount, decisionCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM test_fleet_gps'),
      pool.query('SELECT COUNT(*) FROM test_fleet_sensors'),
      pool.query('SELECT COUNT(*) FROM test_fleet_decisions'),
    ])

    console.log('📊 Summary:')
    console.log(`   test_fleet_gps: ${gpsCount.rows[0].count} rows`)
    console.log(`   test_fleet_sensors: ${sensorCount.rows[0].count} rows`)
    console.log(`   test_fleet_decisions: ${decisionCount.rows[0].count} rows`)
    console.log('\n✅ Import complete!')
  } catch (err) {
    console.error('❌ Error:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
