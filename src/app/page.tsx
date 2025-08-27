import { eloService } from '@/services/elo.service'
import { gameService } from '@/services/game.service'
import { ELO } from '@/components/ELO'
import { GameBanner } from '@/components/GameBanner'
import { GamePredictions } from '@/components/GamePredictions'
import { getTeams } from '@/data/teams'
import { scheduleService } from '@/services/schedule.service'
import {
  GamePredictionsMap,
  predictionsService,
} from '@/services/predictions.service'
import { Database } from '@/lib/db'
import { AllTeamsHistoryGraph } from '@/components/AllTeamsHistoryGraph'

export default async function Index() {
  const db = Database.getInstance()
  await db.connect()

  const [thisWeeksGames, teams, latestElos, currentSchedule] =
    await Promise.all([
      gameService.getThisWeeksGames(),
      getTeams(),
      eloService.getLatestElos(),
      scheduleService.getCurrentSchedule(),
    ])

  const upcomingPredictions =
    await predictionsService.getUpcomingGamePredictions(currentSchedule)

  function deserializeELOCalculationResults(
    data: GamePredictionsMap
  ): GamePredictionsMap {
    const result: GamePredictionsMap = {}
    for (const [gameId, value] of Object.entries(data)) {
      result[Number(gameId)] = {
        ...value,
        prediction: {
          ...value.prediction,
          gameDate: new Date(value.prediction.gameDate),
        },
        gameElo: {
          ...value.gameElo,
          gameDate: new Date(value.gameElo.gameDate),
        },
      }
    }
    return result
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-8">
      <GameBanner gamesThisWeek={thisWeeksGames} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ELO Rankings */}
        <div className="lg:col-span-1">
          <ELO elos={latestElos} teams={teams} />
        </div>

        {/* Game Predictions */}
        <GamePredictions
          scheduleData={currentSchedule}
          upcomingPredictions={deserializeELOCalculationResults(
            upcomingPredictions
          )}
        />

        {/* Graph With all Teams */}
        <AllTeamsHistoryGraph historyByTeam={{}} />
      </div>
    </div>
  )
}
