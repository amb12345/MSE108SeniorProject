/**
 * Always use database (Aiven). No mock data.
 * When NEXT_PUBLIC_BACKEND_URL is set, frontend fetches from Flask backend.
 * Otherwise, Next.js API routes fetch from Aiven directly.
 */
export const DATA_SOURCE = 'database' as const

/**
 * Helper to determine if we should use database data
 */
export function useDatabaseData() {
  return typeof window !== 'undefined'
}
