import { Database } from '@/lib/db'
import { predictionsService } from '@/services/predictions.service'
import { makePicksService } from '@/services/makePicks.service'
import { NextResponse } from 'next/server'

/**
 * Combined cron job that runs two isolated tasks concurrently:
 * 1. Create predictions for tomorrow's games
 * 2. Make picks for the system user based on predictions
 *
 * Both tasks run independently and failures in one don't block the other
 */
export async function GET() {
  const db = Database.getInstance()
  await db.connect()

  console.log('Executing predictions cron job (predictions + make picks)...')

  // Run both tasks concurrently using Promise.allSettled
  // This ensures both tasks run independently and one failure doesn't crash the other
  const [predictionsResult, makePicksResult] = await Promise.allSettled([
    runCreatePredictions(),
    runMakePicks(),
  ])

  // Collect results from both tasks
  const results = {
    success: true,
    predictions: {
      status: predictionsResult.status,
      ...(predictionsResult.status === 'fulfilled'
        ? { data: predictionsResult.value }
        : {
            error:
              (predictionsResult.reason as Error)?.message || 'Unknown error',
          }),
    },
    makePicks: {
      status: makePicksResult.status,
      ...(makePicksResult.status === 'fulfilled'
        ? { data: makePicksResult.value }
        : {
            error:
              (makePicksResult.reason as Error)?.message || 'Unknown error',
          }),
    },
  }

  // Determine overall success - if both failed, return 500
  const bothFailed =
    predictionsResult.status === 'rejected' &&
    makePicksResult.status === 'rejected'

  if (bothFailed) {
    results.success = false
    return NextResponse.json(results, { status: 500 })
  }

  // If at least one succeeded, return 200 but include failure details
  return NextResponse.json(results)
}

/**
 * Task 1: Create predictions for tomorrow's games
 */
async function runCreatePredictions() {
  try {
    console.log("[Task 1] Creating predictions for tomorrow's games...")
    await predictionsService.createNextDayPredictions()
    console.log('[Task 1] ✓ Predictions created successfully')
    return { success: true, message: 'Predictions created' }
  } catch (error) {
    console.error('[Task 1] ✗ Error creating predictions:', error)
    throw error
  }
}

/**
 * Task 2: Make picks for system user
 */
async function runMakePicks() {
  try {
    console.log('[Task 2] Making picks for system user...')
    const stats = await makePicksService.makePicksForTomorrow()
    console.log('[Task 2] ✓ Picks made successfully:', stats)
    return { success: true, stats }
  } catch (error) {
    console.error('[Task 2] ✗ Error making picks:', error)
    throw error
  }
}
