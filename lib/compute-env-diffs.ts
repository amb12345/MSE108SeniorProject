/**
 * Computes environmental diff metrics from per-action columns.
 * Used by the dashboard Environmental Impact tile and by scripts.
 *
 * Formulas:
 * - diff_env_cost_2 = max_total_env_cost - min_total_env_cost
 * - diff_environmental_value = max_environmental_value - min_environmental_value
 * - diff_env_spoilage_cost = max_env_spoilage_cost - min_env_spoilage_cost
 */

export interface EnvDiffs {
  diff_env_cost_2: number
  diff_environmental_value: number
  diff_env_spoilage_cost: number
}

type RowLike = Record<string, unknown>

function getNum(row: RowLike, key: string): number {
  const v = row[key]
  if (v == null) return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/**
 * Compute environmental diffs for a single row.
 * DB has max_* and min_* columns; we compute diff = max - min.
 *
 * Priority:
 * 1. max_total_env_cost - min_total_env_cost → diff_env_cost_2
 * 2. max_environmental_value - min_environmental_value → diff_environmental_value
 * 3. max_env_spoilage_cost - min_env_spoilage_cost → diff_env_spoilage_cost
 *
 * Fallbacks: per-action columns (continue_*, reroute_*, detour_*), then diff_* if precomputed.
 */
export function computeEnvDiffsForRow(row: RowLike): EnvDiffs {
  const d = row.decision ?? row
  const r = d as RowLike

  const maxTotalEnv = getNum(r, 'max_total_env_cost')
  const minTotalEnv = getNum(r, 'min_total_env_cost')
  const maxEnvVal = getNum(r, 'max_environmental_value')
  const minEnvVal = getNum(r, 'min_environmental_value')
  const maxSpoil = getNum(r, 'max_env_spoilage_cost')
  const minSpoil = getNum(r, 'min_env_spoilage_cost')

  const hasMaxMin = maxTotalEnv || minTotalEnv || maxEnvVal || minEnvVal || maxSpoil || minSpoil

  let diff_env_cost_2: number
  let diff_environmental_value: number
  let diff_env_spoilage_cost: number

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
      diff_env_cost_2 =
        Math.max(totalEnvC, totalEnvR, totalEnvD) - Math.min(totalEnvC, totalEnvR, totalEnvD)
    } else {
      diff_environmental_value = getNum(r, 'diff_environmental_value') || getNum(r, 'environmental_value')
      diff_env_spoilage_cost = getNum(r, 'diff_env_spoilage_cost') || getNum(r, 'expected_spoilage_cost_saved')
      diff_env_cost_2 =
        getNum(r, 'diff_env_cost_2') ||
        diff_environmental_value + diff_env_spoilage_cost ||
        getNum(r, 'total_sustainability_value')
    }
  }

  return {
    diff_env_cost_2,
    diff_environmental_value,
    diff_env_spoilage_cost,
  }
}

/**
 * Aggregate env diffs across rows (sum).
 */
export function computeEnvDiffsSummary(rows: RowLike[]): EnvDiffs & { count: number } {
  let diff_env_cost_2 = 0
  let diff_environmental_value = 0
  let diff_env_spoilage_cost = 0

  for (const row of rows) {
    const d = computeEnvDiffsForRow(row)
    diff_env_cost_2 += d.diff_env_cost_2
    diff_environmental_value += d.diff_environmental_value
    diff_env_spoilage_cost += d.diff_env_spoilage_cost
  }

  return {
    diff_env_cost_2,
    diff_environmental_value,
    diff_env_spoilage_cost,
    count: rows.length,
  }
}
