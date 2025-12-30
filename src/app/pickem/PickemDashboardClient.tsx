'use client'

import { PickCard } from '@/components/PickCard'
import { UserStatsCard } from '@/components/UserStatsCard'
import { Game, UserPick, UserStats } from '@/types/picks'
import Link from 'next/link'

interface PickemDashboardClientProps {
  games: Game[]
  userStats: UserStats | null
  userPicks: UserPick[]
  firebaseUid?: string
}

export function PickemDashboardClient({
  games,
  userStats,
  userPicks,
  firebaseUid,
}: PickemDashboardClientProps) {
  // Create a map of user picks by gameId for easy lookup
  const userPicksMap = new Map(userPicks.map((pick) => [pick.gameId, pick]))

  const pickedGames = games.filter((game) => userPicksMap.has(game.gameId))
  const unpickedGames = games.filter((game) => !userPicksMap.has(game.gameId))
  const totalGames = games.length
  const pickedCount = pickedGames.length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content - Pick Cards */}
      <div className="lg:col-span-2 space-y-6">
        {/* Not logged in state */}
        {!firebaseUid && (
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/20 border border-blue-700/50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Sign in to Make Picks
            </h2>
            <p className="text-gray-300 mb-6">
              Create an account or sign in to start making predictions and
              compete on the leaderboard!
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Games Section */}
        {games.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 text-lg">
              No games available for picks in the next 48 hours.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Check back later for upcoming games!
            </p>
          </div>
        ) : (
          <>
            {/* Progress indicator */}
            {firebaseUid && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Your Progress</span>
                  <span className="text-sm font-semibold text-white">
                    {pickedCount} / {totalGames} games picked
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(pickedCount / totalGames) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Unpicked games first */}
            {unpickedGames.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Available Games {firebaseUid && `(${unpickedGames.length})`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unpickedGames.map((game, i) => (
                    <PickCard
                      key={`${game.gameId}-${i}`}
                      gameId={game.gameId}
                      season={game.season}
                      gameDate={game.gameDate}
                      homeTeam={game.homeTeam}
                      awayTeam={game.awayTeam}
                      expectedResult={game.expectedResult}
                      firebaseUid={firebaseUid}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Picked games */}
            {pickedGames.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Your Picks ({pickedGames.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pickedGames.map((game, i) => {
                    const userPick = userPicksMap.get(game.gameId)
                    return (
                      <PickCard
                        key={`${game.gameId}-${i}`}
                        gameId={game.gameId}
                        season={game.season}
                        gameDate={game.gameDate}
                        homeTeam={game.homeTeam}
                        awayTeam={game.awayTeam}
                        expectedResult={game.expectedResult}
                        userPick={userPick}
                        firebaseUid={firebaseUid}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar - User Stats */}
      <div className="lg:col-span-1">
        {firebaseUid && userStats ? (
          <div className="sticky top-24">
            <UserStatsCard stats={userStats} />
          </div>
        ) : (
          <div className="sticky top-24 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Leaderboard Preview
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Sign in to see your stats and compete with other predictors!
            </p>
            <Link
              href="/login"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
