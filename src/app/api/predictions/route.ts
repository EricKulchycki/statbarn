import { Database } from '@/lib/db'
import { predictionsService } from '@/services/predictions.service'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const db = Database.getInstance()
    await db.connect()
    console.log('Executing creating gameElos (predictions) cron job...')

    await predictionsService.createNextDayPredictions()

    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully.',
    })
  } catch (error) {
    console.error('Error in cron job:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Cron job failed.' }),
      {
        status: 500,
      }
    )
  }
}
