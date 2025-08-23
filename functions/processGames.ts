import { GameELOModel } from '../models/gameElo'
import { calculateGameELO, TeamELOState } from '../lib/eloCalculator'
import { getStartOfDay } from 'utils/currentSeason'
import { Database } from 'lib/db'
import { gameService } from '~/services/game.service'
import { eloService } from '~/services/elo.service'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const db = Database.getInstance()
    await db.connect()

    // Get today's games
    const games = await gameService.getGamesByDate(
      getStartOfDay(new Date()).toISOString().split('T')[0]
    )

    const currentElos = await eloService.getLatestElos()
    const teamELOState: TeamELOState = {}
    currentElos.forEach(({ abbrev, elo }) => {
      teamELOState[abbrev] = elo
    })

    // Process each game and calculate ELO
    const gameEloDocs = []
    for (const game of games) {
      const gameEloData = calculateGameELO(game, teamELOState)
      const gameEloDoc = new GameELOModel(gameEloData)
      await gameEloDoc.save()
      gameEloDocs.push(gameEloDoc)
    }

    res
      .status(200)
      .json({ success: true, saved: gameEloDocs.length, data: gameEloDocs })
  } catch (error) {
    console.error('Error processing ELO:', error)
    res.status(500).json({
      success: false,
      error: (error as unknown as { message: string }).message,
    })
  } finally {
    // Optionally disconnect if you want to close the connection after each invocation
    // await mongoose.disconnect();
  }
}
