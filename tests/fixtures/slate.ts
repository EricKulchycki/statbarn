import { NHLGame, NHLGameDay } from '../../src/types/game'
import { GamePrediction } from '../../src/types/gamePrediction'
import { GameStatus } from '../../src/utils/game'

export const TODAY = '2026-10-06'

export function makeGame(
  id: number,
  gameState: GameStatus,
  homeScore?: number,
  awayScore?: number,
  periodType = 'REG'
): NHLGame {
  return {
    id,
    gameState,
    startTimeUTC: '2026-10-06T23:00:00Z',
    periodDescriptor: { periodType },
    homeTeam: {
      abbrev: 'WPG',
      logo: 'wpg.svg',
      darkLogo: 'wpg-dark.svg',
      placeName: { default: 'Winnipeg' },
      score: homeScore,
    },
    awayTeam: {
      abbrev: 'EDM',
      logo: 'edm.svg',
      darkLogo: 'edm-dark.svg',
      placeName: { default: 'Edmonton' },
      score: awayScore,
    },
  } as NHLGame
}

// The model favours the home team (WPG) at 60%
export function makeHomeFavoredPrediction(gameId: number): GamePrediction {
  return {
    gameId,
    homeTeam: 'WPG',
    awayTeam: 'EDM',
    homeTeamWinProbability: 0.6,
    awayTeamWinProbability: 0.4,
    predictedWinner: 'WPG',
    gameDate: new Date('2026-10-06T23:00:00Z'),
    modelVersion: 'v1',
  }
}

export function makeDay(date: string, games: NHLGame[]): NHLGameDay {
  return { date, games, numberOfGames: games.length } as NHLGameDay
}
