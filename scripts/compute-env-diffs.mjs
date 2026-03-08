#!/usr/bin/env node
/**
 * Computes diff_env_cost_2, diff_environmental_value, diff_env_spoilage_cost
 * from per-action columns (continue_*, reroute_*, detour_*).
 *
 * Usage:
 *   node scripts/compute-env-diffs.mjs [input.json]
 *
 * If input.json is provided, reads rows from it.
 * Otherwise fetches from /api/fleet/all (requires dev server or API_URL).
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function getNum(row, key) {
  const d = row.decision ?? row
  const v = d?.[key] ?? row[key]
  if (v == null) return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function computeEnvDiffsForRow(row) {
  const d = row.decision ?? row
  const r = d ?? row

  const maxTotalEnv = getNum(r, 'max_total_env_cost')
  const minTotalEnv = getNum(r, 'min_total_env_cost')
  const maxEnvVal = getNum(r, 'max_environmental_value')
  const minEnvVal = getNum(r, 'min_environmental_value')
  const maxSpoil = getNum(r, 'max_env_spoilage_cost')
  const minSpoil = getNum(r, 'min_env_spoilage_cost')

  const hasMaxMin = maxTotalEnv || minTotalEnv || maxEnvVal || minEnvVal || maxSpoil || minSpoil

  let diff_env_cost_2, diff_environmental_value, diff_env_spoilage_cost

  if (hasMaxMin) {
    diff_env_cost_2 = maxTotalEnv - minTotalEnv
    diff_environmental_value = maxEnvVal - minEnvVal
    diff_env_spoilage_cost = maxSpoil - minSpoil
  } else {
    const envC = getNum(r, 'continue_environmental_value')
    const envR = getNum(r, 'reroute_environmental_value')
    const envD = getNum(r, 'detour_environmental_value')
    const spoilC = getNum(r, 'continue_env_spoilage_cost')
    const spoilR = getNum(r, 'reroute_env_spoilage_cost')
    const spoilD = getNum(r, 'detour_env_spoilage_cost')
    const totalEnvC = getNum(r, 'continue_total_env_cost') || envC + spoilC
    const totalEnvR = getNum(r, 'reroute_total_env_cost') || envR + spoilR
    const totalEnvD = getNum(r, 'detour_total_env_cost') || envD + spoilD
    const hasPerAction = envC || envR || envD || spoilC || spoilR || spoilD

    if (hasPerAction) {
      diff_environmental_value = Math.max(envC, envR, envD) - Math.min(envC, envR, envD)
      diff_env_spoilage_cost = Math.max(spoilC, spoilR, spoilD) - Math.min(spoilC, spoilR, spoilD)
      diff_env_cost_2 = Math.max(totalEnvC, totalEnvR, totalEnvD) - Math.min(totalEnvC, totalEnvR, totalEnvD)
    } else {
      diff_environmental_value = getNum(r, 'diff_environmental_value') || getNum(r, 'environmental_value')
      diff_env_spoilage_cost = getNum(r, 'diff_env_spoilage_cost') || getNum(r, 'expected_spoilage_cost_saved')
      diff_env_cost_2 = getNum(r, 'diff_env_cost_2') || diff_environmental_value + diff_env_spoilage_cost
    }
  }

  return { diff_env_cost_2, diff_environmental_value, diff_env_spoilage_cost }
}

function computeSummary(rows) {
  let diff_env_cost_2 = 0, diff_environmental_value = 0, diff_env_spoilage_cost = 0
  for (const row of rows) {
    const d = computeEnvDiffsForRow(row)
    diff_env_cost_2 += d.diff_env_cost_2
    diff_environmental_value += d.diff_environmental_value
    diff_env_spoilage_cost += d.diff_env_spoilage_cost
  }
  return { diff_env_cost_2, diff_environmental_value, diff_env_spoilage_cost, count: rows.length }
}

async function main() {
  let rows = []
  const inputPath = process.argv[2]

  if (inputPath && existsSync(inputPath)) {
    const raw = JSON.parse(readFileSync(inputPath, 'utf-8'))
    rows = Array.isArray(raw) ? raw : raw.rows ?? []
  } else if (!inputPath) {
    const base = process.env.API_URL || 'http://localhost:3000'
    try {
      const res = await fetch(`${base}/api/fleet/all`)
      const data = await res.json()
      rows = Array.isArray(data) ? data : data.rows ?? []
    } catch (err) {
      console.error('No input file and could not fetch /api/fleet/all:', err.message)
      console.log('Usage: node scripts/compute-env-diffs.mjs [input.json]')
      process.exit(1)
    }
  } else {
    console.error('File not found:', inputPath)
    process.exit(1)
  }

  const summary = computeSummary(rows)
  console.log('Environmental diff summary:')
  console.log(JSON.stringify(summary, null, 2))
}

main()
