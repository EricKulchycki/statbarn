'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getTomorrowsGames, getUserStats, getUserPicks } from '@/actions/picks'
import { Game, UserPick, UserStats } from '@/types/picks'
import { PickemDashboardClient } from './PickemDashboardClient'

export function PickemDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userPicks, setUserPicks] = useState<UserPick[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Always fetch games
        const gamesData = await getTomorrowsGames()
        setGames(gamesData)

        // Fetch user data if logged in
        if (user?.uid) {
          const [stats, picks] = await Promise.all([
            getUserStats(user.uid),
            getUserPicks(user.uid, { pending: true }),
          ])
          setUserStats(stats)
          setUserPicks(picks)
        } else {
          setUserStats(null)
          setUserPicks([])
        }
      } catch (err) {
        console.error('Error fetching pickem data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchData()
    }
  }, [user?.uid, authLoading])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <PickemDashboardClient
      games={games}
      userStats={userStats}
      userPicks={userPicks}
      firebaseUid={user?.uid}
    />
  )
}
