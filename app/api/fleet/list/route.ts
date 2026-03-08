import { NextResponse } from 'next/server'
import { fetchFleetListFromAiven } from '@/lib/fleet-from-aiven'

export const dynamic = 'force-static'

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json([])
  }

  try {
    const { searchParams } = new URL(request.url)
    const truckIdParam = searchParams.get('truckId')
    const truckId = truckIdParam ? parseInt(truckIdParam, 10) : undefined

    const data = await fetchFleetListFromAiven(truckId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching fleet data:', error)
    return NextResponse.json([])
  }
}
