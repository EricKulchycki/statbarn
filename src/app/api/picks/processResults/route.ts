import { NextResponse } from 'next/server'
import { Database } from '@/lib/db'
import { picksService } from '@/services/picks.service'
import { DateTime } from 'luxon'

/**
 * Process completed games and update user pick results
 * This should be run daily via a cron job
 *
 * GET /api/picks/processResults
 */
export async function GET() {
  try {
    const db = Database.getInstance()
    await db.connect()

    const yesterday = DateTime.now().minus({ days: 1 }).startOf('day')

    // Process picks using the service
    const stats = await picksService.processYesterdaysPicks()

    return NextResponse.json({
      success: true,
      date: yesterday.toISODate(),
      ...stats,
    })
  } catch (error) {
    console.error('Error processing pick results:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
