'use client'

import { FireIcon, TrophyIcon } from '@heroicons/react/24/solid'

interface UserStatsCardProps {
  stats: {
    totalPicks: number
    correctPicks: number
    accuracy: number
    currentStreak: number
    longestStreak: number
    totalPoints: number
    rank?: number
  }
  statbarnAccuracy?: number
  totalUsers?: number
}

export function UserStatsCard({
  stats,
  statbarnAccuracy,
  totalUsers,
}: UserStatsCardProps) {
  const formatAccuracy = (acc: number) => acc.toFixed(1)

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Your Season Stats</h2>

      {/* Accuracy Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Accuracy:</span>
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              {formatAccuracy(stats.accuracy)}%
            </div>
            <div className="text-xs text-gray-500">
              ({stats.correctPicks}/{stats.totalPicks})
            </div>
          </div>
        </div>

        {statbarnAccuracy !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">vs AI Model:</span>
            <div className="text-right">
              <div
                className={`text-lg font-bold ${
                  stats.accuracy > statbarnAccuracy
                    ? 'text-green-400'
                    : stats.accuracy === statbarnAccuracy
                      ? 'text-gray-400'
                      : 'text-red-400'
                }`}
              >
                {formatAccuracy(statbarnAccuracy)}%
              </div>
              {stats.accuracy > statbarnAccuracy && (
                <div className="text-xs text-green-400">
                  +{formatAccuracy(stats.accuracy - statbarnAccuracy)}%
                </div>
              )}
              {stats.accuracy < statbarnAccuracy && (
                <div className="text-xs text-red-400">
                  {formatAccuracy(stats.accuracy - statbarnAccuracy)}%
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-700 my-4" />

      {/* Streaks */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Current Streak:</span>
          <div className="flex items-center gap-2">
            {stats.currentStreak > 0 && (
              <FireIcon className="w-5 h-5 text-orange-500" />
            )}
            <span className="text-lg font-bold text-white">
              {stats.currentStreak}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Best Streak:</span>
          <div className="flex items-center gap-2">
            {stats.longestStreak > 0 && (
              <TrophyIcon className="w-5 h-5 text-yellow-500" />
            )}
            <span className="text-lg font-bold text-white">
              {stats.longestStreak}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700 my-4" />

      {/* Points and Rank */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total Points:</span>
          <span className="text-lg font-bold text-white">
            {stats.totalPoints}
          </span>
        </div>

        {stats.rank !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Rank:</span>
            <span className="text-lg font-bold text-white">
              #{stats.rank}
              {totalUsers && (
                <span className="text-sm text-gray-500 ml-1">
                  / {totalUsers}
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {stats.totalPicks === 0 && (
        <div className="text-center text-gray-400 py-4">
          Make your first pick to start tracking your stats!
        </div>
      )}
    </div>
  )
}
