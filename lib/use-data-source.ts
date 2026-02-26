/**
 * Automatically uses 'mock' for static/GitHub Pages builds,
 * and 'database' for local dev and Vercel/full-stack deploys.
 */
export const DATA_SOURCE: 'database' | 'mock' =
  process.env.NEXT_PUBLIC_BUILD_MODE === 'static' ? 'mock' : 'database'

/**
 * Helper to determine if we should use database data
 */
export function useDatabaseData() {
  return DATA_SOURCE === 'database' && typeof window !== 'undefined'
}
