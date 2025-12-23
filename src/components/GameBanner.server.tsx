import { DateTime } from 'luxon'
import { gameService } from '@/services/game.service'
import { predictionsService } from '@/services/predictions.service'
import { GameBannerClient } from './GameBanner.client'
import { serializePrediction } from '@/utils/converters/prediction'

export async function GameBanner() {
  const today = DateTime.now().minus({ hours: 12 })
  const gamesThisWeek = await gameService.getThisWeeksGames(today)

  if (
    !gamesThisWeek ||
    gamesThisWeek.every((day) => day.numberOfGames === 0)
  ) {
    return null
  }

  // Fetch predictions asynchronously
  let predictions = []
  try {
    const scheduleData: any = { gameWeek: gamesThisWeek }
    const rawPredictions = await predictionsService.getUpcomingGamePredictions(
      scheduleData
    )
    predictions = rawPredictions.map(serializePrediction)
  } catch (error) {
    console.error('Failed to fetch predictions for banner:', error)
  }

  return (
    <GameBannerClient gamesThisWeek={gamesThisWeek} predictions={predictions} />
  )
}
