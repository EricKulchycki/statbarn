'use client'

import React from 'react'
import { formatPercentage } from '@/utils/percentage'
import { NHLGame } from '@/types/game'
import Image from 'next/image'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { Prediction } from '@/models/prediction'

interface GamePredictionProps {
  game: NHLGame
  prediction?: Prediction
}

export const GamePrediction = (props: GamePredictionProps) => {
  const { game, prediction } = props
  const isHydrated = useIsHydrated()

  const awayWinProb = prediction?.awayTeamWinProbability || 0
  const homeWinProb = prediction?.homeTeamWinProbability || 0
  const awayPredicted = prediction?.predictedWinner === game.awayTeam.abbrev
  const homePredicted = prediction?.predictedWinner === game.homeTeam.abbrev
  const predictedProb = awayPredicted ? awayWinProb : homeWinProb

  return (
    <div key={game.id} className="w-full">
      {/* Header: Time and Confidence */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/60 rounded-t-lg">
        <div className="text-sm text-gray-300 font-medium">
          {isHydrated &&
            new Date(game.startTimeUTC).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
        </div>
        <div
          className={`text-xs px-2 py-1 rounded font-semibold ${
            predictedProb >= 0.7
              ? 'bg-green-800/80 text-green-200'
              : predictedProb >= 0.6
                ? 'bg-blue-800/80 text-blue-200'
                : 'bg-yellow-800/80 text-yellow-200'
          }`}
        >
          {Math.round(predictedProb * 100)}% confidence
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-2 p-4">
        {/* Away Team */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
            awayPredicted
              ? 'bg-green-900/20 border-2 border-green-500/40'
              : 'bg-slate-800/30 border-2 border-slate-700/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <Image
              alt={`${game.awayTeam.abbrev} logo`}
              src={game.awayTeam.logo}
              className="size-12"
              width={48}
              height={48}
            />
            <div className="flex flex-col">
              <span
                className={`font-bold text-lg ${
                  awayPredicted ? 'text-green-400' : 'text-gray-300'
                }`}
              >
                {game.awayTeam.abbrev}
              </span>
              <span className="text-xs text-gray-400">Away</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {awayPredicted && (
              <span className="text-xs px-2 py-1 bg-green-700/50 text-green-200 rounded font-semibold">
                Predicted Winner
              </span>
            )}
            <span
              className={`text-2xl font-bold ${
                awayPredicted ? 'text-green-400' : 'text-gray-500'
              }`}
            >
              {formatPercentage(awayWinProb)}
            </span>
          </div>
        </div>

        {/* Home Team */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
            homePredicted
              ? 'bg-green-900/20 border-2 border-green-500/40'
              : 'bg-slate-800/30 border-2 border-slate-700/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <Image
              alt={`${game.homeTeam.abbrev} logo`}
              src={game.homeTeam.logo}
              className="size-12"
              width={48}
              height={48}
            />
            <div className="flex flex-col">
              <span
                className={`font-bold text-lg ${
                  homePredicted ? 'text-green-400' : 'text-gray-300'
                }`}
              >
                {game.homeTeam.abbrev}
              </span>
              <span className="text-xs text-gray-400">Home</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {homePredicted && (
              <span className="text-xs px-2 py-1 bg-green-700/50 text-green-200 rounded font-semibold">
                Predicted Winner
              </span>
            )}
            <span
              className={`text-2xl font-bold ${
                homePredicted ? 'text-green-400' : 'text-gray-500'
              }`}
            >
              {formatPercentage(homeWinProb)}
            </span>
          </div>
        </div>
      </div>

      {/* Win Probability Bar */}
      <div className="px-4 pb-3">
        <div className="text-xs text-gray-400 mb-1">Win Probability</div>
        <div className="flex h-6 rounded overflow-hidden">
          <div
            className="bg-red-600 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${awayWinProb * 100}%` }}
          >
            {awayWinProb >= 0.15 && `${Math.round(awayWinProb * 100)}%`}
          </div>
          <div
            className="bg-blue-600 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${homeWinProb * 100}%` }}
          >
            {homeWinProb >= 0.15 && `${Math.round(homeWinProb * 100)}%`}
          </div>
        </div>
      </div>
    </div>
  )
}
