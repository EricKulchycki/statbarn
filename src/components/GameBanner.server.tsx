import { DateTime } from 'luxon'
import { gameService } from '@/services/game.service'
import { predictionsService } from '@/services/predictions.service'
import { GameBannerClient } from './GameBanner.client'
import {
  SerializedPrediction,
  serializePrediction,
} from '@/utils/converters/prediction'
import { NHLGameWeek } from '@/types/game'

export async function GameBanner() {
  const today = DateTime.now().minus({ hours: 12 })
  const gamesThisWeek = await gameService.getThisWeeksGames(today)

  if (!gamesThisWeek || gamesThisWeek.every((day) => day.numberOfGames === 0)) {
    return null
  }

  // Fetch predictions asynchronously
  let predictions: SerializedPrediction[] = []
  try {
    const scheduleData: Partial<NHLGameWeek> = { gameWeek: gamesThisWeek }
    const rawPredictions = await predictionsService.getUpcomingGamePredictions(
      scheduleData as NHLGameWeek
    )
    predictions = rawPredictions.map(serializePrediction)
  } catch (error) {
    console.error('Failed to fetch predictions for banner:', error)
  }

  return (
    <GameBannerClient gamesThisWeek={gamesThisWeek} predictions={predictions} />
  )
}
