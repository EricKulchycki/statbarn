'use client'

import { GameELO } from '@/models/gameElo'
import { Team } from '@/types/team'
import {
  getActualWinnerFromGameELO,
  getPredictedWinnerFromGameELO,
} from '@/utils/gameElo'
import { getTeamLogo } from '@/utils/team'
import Image from 'next/image'

interface Props {
  gameElos: GameELO[]
  teams: Team[]
}

export function YesterdaysGameOutcomes({ gameElos, teams }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      {gameElos.map((game) => {
        const winner = getActualWinnerFromGameELO(game)
        const predictedWinner = getPredictedWinnerFromGameELO(game)
        const predictionCorrect = winner === predictedWinner

        // Calculate confidence percentage and level
        const homeConf = game.expectedResult?.homeTeam ?? 0.5
        const awayConf = game.expectedResult?.awayTeam ?? 0.5
        const predictedConf =
          predictedWinner === game.homeTeam.abbrev ? homeConf : awayConf
        const confidencePct = Math.round(predictedConf * 100)
        const isHighConfidence = predictedConf >= 0.7

        const homeWon = game.homeTeam.abbrev === winner
        const awayWon = game.awayTeam.abbrev === winner
        const homePredicted = game.homeTeam.abbrev === predictedWinner
        const awayPredicted = game.awayTeam.abbrev === predictedWinner

        return (
          <div
            key={game.gameId}
            className={`rounded-lg overflow-hidden shadow-lg border-2 ${
              predictionCorrect
                ? 'border-green-500/30 bg-gradient-to-br from-slate-800 to-slate-900'
                : 'border-red-500/30 bg-gradient-to-br from-slate-850 to-slate-900'
            }`}
          >
            {/* Header: Prediction Status */}
            <div
              className={`px-4 py-2 flex items-center justify-between ${
                predictionCorrect ? 'bg-green-900/40' : 'bg-red-900/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-300">
                  Prediction:
                </span>
                <span
                  className={`font-bold ${
                    predictionCorrect ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {predictionCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded font-semibold ${
                  isHighConfidence
                    ? 'bg-green-800/80 text-green-200'
                    : 'bg-yellow-800/80 text-yellow-200'
                }`}
              >
                {confidencePct}% confidence
              </span>
            </div>

            {/* Game Content */}
            <div className="p-4">
              {/* Teams and Scores */}
              <div className="space-y-3">
                {/* Home Team */}
                <div
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    homeWon
                      ? 'bg-green-900/20 border border-green-500/30'
                      : 'bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Image
                      src={getTeamLogo(teams, game.homeTeam.abbrev) ?? ''}
                      alt={game.homeTeam.abbrev}
                      width={48}
                      height={48}
                      className="size-12"
                    />
                    <div className="flex flex-col">
                      <span
                        className={`font-bold text-lg ${
                          homeWon ? 'text-green-400' : 'text-gray-300'
                        }`}
                      >
                        {game.homeTeam.abbrev}
                      </span>
                      <span className="text-xs text-gray-400">Home</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {homePredicted && (
                      <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded font-semibold">
                        Predicted
                      </span>
                    )}
                    <span
                      className={`text-3xl font-bold ${
                        homeWon ? 'text-green-400' : 'text-gray-400'
                      }`}
                    >
                      {game.homeTeam.score}
                    </span>
                  </div>
                </div>

                {/* Away Team */}
                <div
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    awayWon
                      ? 'bg-green-900/20 border border-green-500/30'
                      : 'bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Image
                      src={getTeamLogo(teams, game.awayTeam.abbrev) ?? ''}
                      alt={game.awayTeam.abbrev}
                      width={48}
                      height={48}
                      className="size-12"
                    />
                    <div className="flex flex-col">
                      <span
                        className={`font-bold text-lg ${
                          awayWon ? 'text-green-400' : 'text-gray-300'
                        }`}
                      >
                        {game.awayTeam.abbrev}
                      </span>
                      <span className="text-xs text-gray-400">Away</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {awayPredicted && (
                      <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded font-semibold">
                        Predicted
                      </span>
                    )}
                    <span
                      className={`text-3xl font-bold ${
                        awayWon ? 'text-green-400' : 'text-gray-400'
                      }`}
                    >
                      {game.awayTeam.score}
                    </span>
                  </div>
                </div>
              </div>

              {/* Win Probabilities */}
              {typeof game.expectedResult?.homeTeam === 'number' && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="text-xs text-gray-400 mb-2">
                    Predicted Win Probability
                  </div>
                  <div className="flex gap-2 text-xs">
                    <div className="flex-1 bg-slate-700 rounded overflow-hidden">
                      <div
                        className="bg-blue-600 py-1 px-2 text-white font-semibold text-center"
                        style={{ width: `${homeConf * 100}%` }}
                      >
                        {Math.round(homeConf * 100)}%
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-700 rounded overflow-hidden">
                      <div
                        className="bg-red-600 py-1 px-2 text-white font-semibold text-center"
                        style={{ width: `${awayConf * 100}%` }}
                      >
                        {Math.round(awayConf * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
