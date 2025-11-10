'use client'

import { useIsMobile } from '@/hooks/useIsMobile'
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
  const isMobile = useIsMobile()

  if (isMobile) {
    // Card grid for mobile
    return (
      <div className="flex flex-wrap gap-4 w-full my-4">
        {gameElos.map((game) => {
          // Calculate confidence percentage and level
          const winner = getActualWinnerFromGameELO(game)
          const predictedWinner = getPredictedWinnerFromGameELO(game)
          const predictionCorrect = winner === predictedWinner
          const homeConf = game.expectedResult?.homeTeam ?? 0.5
          const awayConf = game.expectedResult?.awayTeam ?? 0.5
          const predictedConf =
            predictedWinner === game.homeTeam.abbrev ? homeConf : awayConf
          const confidencePct = Math.round(predictedConf * 100)
          const isHighConfidence = predictedConf >= 0.7

          return (
            <div key={game.gameId} className="w-fit flex-1 p-2">
              <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md p-4 flex flex-col items-center">
                <div className="flex items-center gap-4 w-full justify-center">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-lg tracking-wide text-slate-100">
                      {game.homeTeam.abbrev}
                    </span>
                    <span className="text-2xl font-bold text-blue-400">
                      {game.homeTeam.score}
                    </span>
                    <span className="text-xs text-gray-400">Home</span>
                  </div>
                  <span className="mx-2 text-xl font-bold text-gray-400">
                    vs
                  </span>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-lg tracking-wide text-slate-100">
                      {game.awayTeam.abbrev}
                    </span>
                    <span className="text-2xl font-bold text-red-400">
                      {game.awayTeam.score}
                    </span>
                    <span className="text-xs text-gray-400">Away</span>
                  </div>
                </div>
                <div className="mt-4 text-sm flex items-center gap-2">
                  <span className="text-gray-400">Winner:</span>
                  <span className="font-bold text-green-400">{winner}</span>
                </div>
                {typeof game.expectedResult?.homeTeam === 'number' && (
                  <div className="flex flex-col items-center mt-2">
                    <div className="mt-1 text-xs flex items-center gap-2">
                      <span className="text-gray-400">Prediction:</span>
                      <span
                        className={
                          predictionCorrect
                            ? 'text-green-500 font-bold'
                            : 'text-red-500 font-bold'
                        }
                      >
                        {predictionCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <div className="mt-1 text-xs flex items-center gap-2">
                      <span className="text-gray-400">Confidence:</span>
                      <span
                        className={`font-bold px-2 py-1 rounded ${
                          isHighConfidence
                            ? 'bg-green-800 text-green-300'
                            : 'bg-yellow-800 text-yellow-300'
                        }`}
                        title={
                          isHighConfidence
                            ? 'High confidence prediction'
                            : 'Low confidence prediction'
                        }
                      >
                        {isHighConfidence ? 'High' : 'Low'}&nbsp;
                        <span className="text-xs text-gray-300">
                          ({confidencePct}%)
                        </span>
                      </span>
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

  // Table for desktop
  return (
    <table className="w-full bg-slate-900 rounded-xl shadow my-4">
      <thead>
        <tr className="text-left text-gray-400">
          <th className="p-3">Home</th>
          <th className="p-3">Away</th>
          <th className="p-3">Score</th>
          <th className="p-3">Prediction</th>
          <th className="p-3">Confidence</th>
        </tr>
      </thead>
      <tbody>
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

          return (
            <tr key={game.gameId} className="border-t border-slate-700">
              <td
                className={`p-3 font-bold ${game.homeTeam.abbrev === winner ? 'text-green-400' : 'text-red-400'}`}
              >
                <Image
                  src={getTeamLogo(teams, game.homeTeam.abbrev) ?? ''}
                  alt={game.homeTeam.abbrev}
                  width={40}
                  height={40}
                  className="inline-block mr-2 size-10"
                />
                {game.homeTeam.abbrev}
              </td>
              <td
                className={`p-3 font-bold ${game.awayTeam.abbrev === winner ? 'text-green-400' : 'text-red-400'}`}
              >
                <Image
                  src={getTeamLogo(teams, game.awayTeam.abbrev) ?? ''}
                  alt={game.awayTeam.abbrev}
                  width={40}
                  height={40}
                  className="inline-block mr-2 size-10"
                />
                {game.awayTeam.abbrev}
              </td>
              <td className="p-3">
                {game.homeTeam.score} - {game.awayTeam.score}
              </td>
              <td className="p-3">
                <span
                  className={
                    predictionCorrect
                      ? 'text-green-500 font-bold'
                      : 'text-red-500 font-bold'
                  }
                >
                  {predictionCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </td>
              <td className="p-3">
                <span
                  className={`font-bold px-2 py-1 rounded ${
                    isHighConfidence
                      ? 'bg-green-800 text-green-300'
                      : 'bg-yellow-800 text-yellow-300'
                  }`}
                  title={
                    isHighConfidence
                      ? 'High confidence prediction'
                      : 'Low confidence prediction'
                  }
                >
                  {isHighConfidence ? 'High' : 'Low'}&nbsp;
                  <span className="text-xs text-gray-300">
                    ({confidencePct}%)
                  </span>
                </span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
