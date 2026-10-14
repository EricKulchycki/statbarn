import { Database } from '@/lib/db'
import { predictionsService } from '@/services/predictions.service'
import { makePicksService } from '@/services/makePicks.service'
import { NextResponse } from 'next/server'

/**
 * Nightly cron, scheduled after the outcome cron so ratings are current:
 * 1. Predict (or re-predict) every unstarted game in the next 3 days
 * 2. Make picks for the system user from those predictions
 *
 * Picks run after predictions so they use fresh ones, and still run if
 * predicting fails (earlier nights already predicted most of the window)
 */
export async function GET() {
  const db = Database.getInstance()
  await db.connect()

  console.log('Executing predictions cron job (predictions + make picks)...')

  const [predictionsResult] = await Promise.allSettled([runCreatePredictions()])
  const [makePicksResult] = await Promise.allSettled([runMakePicks()])

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
 * Task 1: Predict the upcoming window
 */
async function runCreatePredictions() {
  try {
    console.log('[Task 1] Predicting upcoming games...')
    const stats = await predictionsService.createUpcomingPredictions()
    console.log('[Task 1] ✓ Predictions saved:', stats)
    return { success: true, stats }
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
