import mongoose from 'mongoose'
import { GameELOModel } from '../src/models/gameElo'
import { eloService } from '../src/services/elo.service'
import { getGameById } from '../src/data/games'
import { Database } from '../src/lib/db'

// Helper to map NHL API gameType to your internal type
function mapNhlGameType(
  type: number
): 'preseason' | 'regular' | 'postseason' | 'unknown' {
  switch (type) {
    case 1:
      return 'preseason'
    case 2:
      return 'regular'
    case 3:
      return 'postseason'
    default:
      return 'unknown'
  }
}

async function main() {
  const db = Database.getInstance()

  await db.connect()
  const season = 20252026

  // console.log(`Fetching NHL games for season ${season}...`)
  // const nhlGames = await fetchNhlGames(season)
  const gameELOs = await eloService.getAllGameElosForSeason(season)
  //const gameELOs = await GameELOModel.find()

  // Map gamePk to gameType
  //const gameTypeMap: Record<number, string> = {}
  for (const game of gameELOs) {
    const fullGame = await getGameById(game.gameId)
    //gameTypeMap[game.gamePk] = mapNhlGameType(fullGame.gameType)
    console.log(
      `Updating gameId ${game.gameId} with type ${fullGame.gameType} (${mapNhlGameType(
        fullGame.gameType
      )})`
    )
    await GameELOModel.updateOne(
      { gameId: game.gameId },
      { $set: { gameType: mapNhlGameType(fullGame.gameType) } }
    )
  }

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
