'use client'

import { ELOCalculationResult } from '@/lib/eloCalculator'
import React from 'react'
import { formatPercentage } from '@/utils/percentage'
import { NHLGame } from '@/types/game'
import Image from 'next/image'
import { useIsHydrated } from '@/hooks/useIsHydrated'

interface GamePredictionProps {
  game: NHLGame
  prediction?: ELOCalculationResult
}

export const GamePrediction = (props: GamePredictionProps) => {
  const { game, prediction } = props
  const isHydrated = useIsHydrated()

  return (
    <div key={game.id} className="rounded-lg p-4 bg-slate-900">
      <div className="text-sm text-gray-400 mb-2">
        {isHydrated &&
          new Date(game.startTimeUTC).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
      </div>
      <div className="font-semibold flex items-start">
        <div className="flex flex-col">
          <div className="flex flex-col justify-center items-center gap-2">
            <Image
              alt="home team logo"
              src={game.awayTeam.logo}
              className="h-8 w-8"
              width={32}
              height={32}
            />
            {game.awayTeam.abbrev}
          </div>
          <div
            className={`${
              prediction?.prediction.predictedWinner === game.awayTeam.abbrev
                ? 'text-green-400'
                : 'text-gray-500'
            }`}
          >
            {formatPercentage(
              prediction?.prediction.awayTeamWinProbability || 0
            )}
          </div>
        </div>
        <div className="mx-2 mt-1 text-gray-500">@</div>
        <div className="flex flex-col items-end">
          <div className="flex flex-col justify-center items-center gap-2">
            <Image
              alt="away team logo"
              src={game.homeTeam.logo}
              className="h-8 w-8"
              width={32}
              height={32}
            />
            {game.homeTeam.abbrev}
          </div>
          <div
            className={`${
              prediction?.prediction.predictedWinner === game.homeTeam.abbrev
                ? 'text-green-400'
                : 'text-gray-500'
            }`}
          >
            {formatPercentage(
              prediction?.prediction.homeTeamWinProbability || 0
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
