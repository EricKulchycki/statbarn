'use client'

import { useState } from 'react'
import { DateTime } from 'luxon'
import { createPick } from '@/actions/picks'
import Image from 'next/image'

interface PickCardProps {
  gameId: number
  season: number
  gameDate: string
  homeTeam: {
    abbrev: string
    logo: string
    eloBefore: number
    score: number
  }
  awayTeam: {
    abbrev: string
    logo: string
    eloBefore: number
    score: number
  }
  expectedResult: {
    homeTeam: number
    awayTeam: number
  }
  userPick?: {
    pickedTeam: string
  }
  firebaseUid?: string
  onPickMade?: () => void
}

export function PickCard({
  gameId,
  season,
  gameDate,
  homeTeam,
  awayTeam,
  userPick,
  firebaseUid,
  onPickMade,
}: PickCardProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(
    userPick?.pickedTeam || null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gameTime = DateTime.fromISO(gameDate)
  const now = DateTime.now()
  const timeUntilGame = gameTime.diff(now, ['hours', 'minutes'])
  const gameStarted = gameTime <= now

  const handleTeamSelect = async (team: string) => {
    if (!firebaseUid || gameStarted) return

    setSelectedTeam(team)
    setError(null)
    setIsSubmitting(true)

    try {
      await createPick({
        firebaseUid,
        gameId,
        gameDate: new Date(gameDate),
        season,
        pickedTeam: team,
        homeTeam: homeTeam.abbrev,
        awayTeam: awayTeam.abbrev,
      })

      onPickMade?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pick')
      setSelectedTeam(userPick?.pickedTeam || null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-4 shadow-lg">
      {/* Header with game time */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-400">
          {gameTime.toFormat('cccc • h:mm a ZZZZ')}
        </div>
        {gameStarted ? (
          <div className="text-xs text-gray-500">In progress</div>
        ) : timeUntilGame.hours < 12 ? (
          <div className="text-xs text-orange-400">
            {Math.floor(timeUntilGame.hours)}h{' '}
            {Math.floor(timeUntilGame.minutes)}m until game
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <button
          onClick={() => handleTeamSelect(awayTeam.abbrev)}
          disabled={isSubmitting || !firebaseUid || gameStarted}
          className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
            selectedTeam === awayTeam.abbrev
              ? 'border-blue-500 bg-blue-500/20'
              : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
          } ${!firebaseUid || gameStarted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Image
            width={48}
            height={48}
            className="size-12"
            src={awayTeam.logo}
            alt={`${awayTeam.abbrev} logo`}
          />
          <div className="text-xl font-bold text-white">{awayTeam.abbrev}</div>
        </button>

        <div className="flex items-center justify-center">
          <span className="text-gray-500 font-semibold text-lg">@</span>
        </div>

        <button
          onClick={() => handleTeamSelect(homeTeam.abbrev)}
          disabled={isSubmitting || !firebaseUid || gameStarted}
          className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
            selectedTeam === homeTeam.abbrev
              ? 'border-blue-500 bg-blue-500/20'
              : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
          } ${!firebaseUid || gameStarted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Image
            width={48}
            height={48}
            className="size-12"
            src={homeTeam.logo}
            alt={`${homeTeam.abbrev} logo`}
          />
          <div className="text-xl font-bold text-white">{homeTeam.abbrev}</div>
        </button>
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
          {error}
        </div>
      )}

      {!firebaseUid && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          Sign in to make picks
        </div>
      )}
    </div>
  )
}
