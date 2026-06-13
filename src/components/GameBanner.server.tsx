import { gameService } from '@/services/game.service'
import { predictionsService } from '@/services/predictions.service'
import { NHLGameWeek } from '@/types/game'
import {
  GamePredictionSerialized,
  serializeGamePrediction,
} from '@/types/gamePrediction'
import { DateTime } from 'luxon'
import { GameBannerClient } from './GameBanner.client'

export async function GameBanner() {
  const today = DateTime.now().minus({ hours: 12 })
  const gamesThisWeek = await gameService.getThisWeeksGames(today)

  if (!gamesThisWeek || gamesThisWeek.every((day) => day.numberOfGames === 0)) {
    return null
  }

  let predictions: GamePredictionSerialized[] = []
  try {
    const scheduleData: Partial<NHLGameWeek> = { gameWeek: gamesThisWeek }
    const rawPredictions = await predictionsService.getUpcomingGamePredictions(
      scheduleData as NHLGameWeek
    )
    predictions = rawPredictions.map(serializeGamePrediction)
  } catch (error) {
    console.error('Failed to fetch predictions for banner:', error)
  }

  return (
    <GameBannerClient gamesThisWeek={gamesThisWeek} predictions={predictions} />
  )
}
