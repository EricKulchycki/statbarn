'use client'

import { EnhancedSkaterStats, EnhancedGoalieStats } from '@/types/player'
import Image from 'next/image'
import { useState } from 'react'
import { ShowAll } from './ShowAll'

interface Props {
  topScorers: EnhancedSkaterStats[]
  topGoalies: EnhancedGoalieStats[]
}

export function PlayerStats(props: Props) {
  const [showAllScorers, setShowAllScorers] = useState(false)
  const [showAllGoalies, setShowAllGoalies] = useState(false)

  const visibleScorers = showAllScorers
    ? props.topScorers
    : props.topScorers.slice(0, 5)
  const visibleGoalies = showAllGoalies
    ? props.topGoalies
    : props.topGoalies.slice(0, 3)

  return (
    <div className="py-4 sm:pt-0 mb-8">
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">
          Top Scorers
        </h3>
        <div className="flex flex-col gap-3">
          {visibleScorers.map((player, idx) => {
            return (
              <div
                key={player.id}
                className="flex flex-col gap-3 bg-gradient-to-br from-slate-800 to-slate-900 shadow-md p-4 rounded-2xl hover:scale-[1.02] transition-transform"
              >
                {/* Player Header */}
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Image
                      src={player.headshot}
                      alt={`${player.firstName.default} ${player.lastName.default}`}
                      className="w-12 h-12 rounded-full border-2 border-slate-700 bg-white/10 shadow flex-shrink-0"
                      width={48}
                      height={48}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-md text-slate-100 tracking-wide truncate">
                        {player.firstName.default} {player.lastName.default}
                      </span>
                      <span className="text-xs text-gray-400">
                        {player.teamAbbrev} • {player.position}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">#{idx + 1}</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-slate-700/50">
                    <span className="text-xs text-gray-400">PTS</span>
                    <span className="font-bold text-white text-sm">
                      {player.points}
                    </span>
                  </div>
                  <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-slate-700/50">
                    <span className="text-xs text-gray-400">G</span>
                    <span className="font-bold text-white text-sm">
                      {player.goals ?? '-'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-slate-700/50">
                    <span className="text-xs text-gray-400">A</span>
                    <span className="font-bold text-white text-sm">
                      {player.assists ?? '-'}
                    </span>
                  </div>
                  {player.pointsPerGame && (
                    <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-blue-900/30 border border-blue-700/30">
                      <span className="text-xs text-blue-300">PPG</span>
                      <span className="font-bold text-blue-100 text-sm">
                        {player.pointsPerGame.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {player.shootingPctg && (
                    <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-green-900/30 border border-green-700/30">
                      <span className="text-xs text-green-300">SH%</span>
                      <span className="font-bold text-green-100 text-sm">
                        {player.shootingPctg.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {player.powerPlayGoals !== undefined &&
                    player.powerPlayGoals > 0 && (
                      <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-orange-900/30 border border-orange-700/30">
                        <span className="text-xs text-orange-300">PPG</span>
                        <span className="font-bold text-orange-100 text-sm">
                          {player.powerPlayGoals}
                        </span>
                      </div>
                    )}
                  {player.gamesPlayed && (
                    <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-slate-700/30">
                      <span className="text-xs text-gray-400">GP</span>
                      <span className="font-bold text-white text-sm">
                        {player.gamesPlayed}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <ShowAll showAll={showAllScorers} setShowAll={setShowAllScorers} />
      </div>

      {/* Top Goalies Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-200">
          Top Goalies
        </h3>
        <div className="flex flex-col gap-3">
          {visibleGoalies.map((player, idx) => {
            return (
              <div
                key={player.id}
                className="flex flex-col gap-3 bg-gradient-to-br from-slate-800 to-slate-900 shadow-md p-4 rounded-2xl hover:scale-[1.02] transition-transform"
              >
                {/* Player Header */}
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Image
                      src={player.headshot}
                      alt={`${player.firstName.default} ${player.lastName.default}`}
                      className="w-12 h-12 rounded-full border-2 border-slate-700 bg-white/10 shadow flex-shrink-0"
                      width={48}
                      height={48}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-md text-slate-100 tracking-wide truncate">
                        {player.firstName.default} {player.lastName.default}
                      </span>
                      <span className="text-xs text-gray-400">
                        {player.teamAbbrev}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">#{idx + 1}</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-slate-700/50">
                    <span className="text-xs text-gray-400">SV%</span>
                    <span className="font-bold text-white text-sm">
                      {player.savePctg.toFixed(3)}
                    </span>
                  </div>
                  {player.goalsAgainstAvg !== undefined && (
                    <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-slate-700/50">
                      <span className="text-xs text-gray-400">GAA</span>
                      <span className="font-bold text-white text-sm">
                        {player.goalsAgainstAvg.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {player.wins !== undefined && (
                    <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-slate-700/50">
                      <span className="text-xs text-gray-400">W</span>
                      <span className="font-bold text-white text-sm">
                        {player.wins}
                      </span>
                    </div>
                  )}
                  {player.winPctg && (
                    <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-blue-900/30 border border-blue-700/30">
                      <span className="text-xs text-blue-300">W%</span>
                      <span className="font-bold text-blue-100 text-sm">
                        {(player.winPctg * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {player.shutouts !== undefined && player.shutouts > 0 && (
                    <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-green-900/30 border border-green-700/30">
                      <span className="text-xs text-green-300">SO</span>
                      <span className="font-bold text-green-100 text-sm">
                        {player.shutouts}
                      </span>
                    </div>
                  )}
                  {player.gamesPlayed && (
                    <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-slate-700/30">
                      <span className="text-xs text-gray-400">GP</span>
                      <span className="font-bold text-white text-sm">
                        {player.gamesPlayed}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <ShowAll showAll={showAllGoalies} setShowAll={setShowAllGoalies} />
      </div>
    </div>
  )
}
