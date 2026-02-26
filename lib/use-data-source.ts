/**
 * Configuration for data source
 * Set to 'database' to use real data from PostgreSQL
 * Set to 'mock' to use static mock data (works with static export)
 */
export const DATA_SOURCE: 'database' | 'mock' = 'database'

/**
 * Helper to determine if we should use database data
 */
export function useDatabaseData() {
  return DATA_SOURCE === 'database' && typeof window !== 'undefined'
}
