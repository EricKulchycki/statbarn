import { LiveGamesResponse, NHLScoreGame, toLiveGame } from '@/lib/liveGames'
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'
export const revalidate = 20

const NHL_SCORES_URL = 'https://api-web.nhle.com/v1/score/now'

export async function GET() {
  try {
    const res = await fetch(NHL_SCORES_URL)
    if (!res.ok) throw new Error(`NHL scores responded ${res.status}`)

    const data: { games?: NHLScoreGame[] } = await res.json()
    const body: LiveGamesResponse = {
      fetchedAt: new Date().toISOString(),
      games: (data.games ?? []).map(toLiveGame),
    }
    return NextResponse.json(body)
  } catch (error) {
    console.error('Failed to load live scores:', error)
    // Clients keep showing what they have and retry on their next poll
    return NextResponse.json(
      { error: 'Live scores unavailable' },
      { status: 502 }
    )
  }
}
