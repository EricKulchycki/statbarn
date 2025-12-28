'use client'

import { useState } from 'react'
import { DateTime } from 'luxon'
import { LockClosedIcon } from '@heroicons/react/24/solid'
import { createPick } from '@/actions/picks'

interface PickCardProps {
  gameId: number
  season: number
  gameDate: string
  homeTeam: {
    abbrev: string
    eloBefore: number
    score: number
  }
  awayTeam: {
    abbrev: string
    eloBefore: number
    score: number
  }
  expectedResult: {
    homeTeam: number
    awayTeam: number
  }
  userPick?: {
    pickedTeam: string
    confidence?: number
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
  expectedResult,
  userPick,
  firebaseUid,
  onPickMade,
}: PickCardProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(
    userPick?.pickedTeam || null
  )
  const [confidence, setConfidence] = useState(userPick?.confidence || 3)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gameTime = DateTime.fromISO(gameDate)
  const now = DateTime.now()
  const isLocked = gameTime <= now
  const timeUntilGame = gameTime.diff(now, ['hours', 'minutes'])

  const aiPrediction =
    expectedResult.homeTeam > expectedResult.awayTeam
      ? homeTeam.abbrev
      : awayTeam.abbrev
  const aiConfidence = Math.max(
    expectedResult.homeTeam,
    expectedResult.awayTeam
  )

  const handleTeamSelect = async (team: string) => {
    if (isLocked || !firebaseUid) return

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
        confidence,
      })

      onPickMade?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pick')
      setSelectedTeam(userPick?.pickedTeam || null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfidenceChange = async (newConfidence: number) => {
    if (isLocked || !firebaseUid || !selectedTeam) return

    setConfidence(newConfidence)
    setError(null)
    setIsSubmitting(true)

    try {
      await createPick({
        firebaseUid,
        gameId,
        gameDate: new Date(gameDate),
        season,
        pickedTeam: selectedTeam,
        homeTeam: homeTeam.abbrev,
        awayTeam: awayTeam.abbrev,
        confidence: newConfidence,
      })

      onPickMade?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update confidence'
      )
      setConfidence(userPick?.confidence || 3)
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
        {isLocked && (
          <div className="flex items-center gap-1 text-xs text-yellow-500">
            <LockClosedIcon className="w-3 h-3" />
            <span>Locked</span>
          </div>
        )}
        {!isLocked && timeUntilGame.hours < 12 && (
          <div className="text-xs text-orange-400">
            {Math.floor(timeUntilGame.hours)}h{' '}
            {Math.floor(timeUntilGame.minutes)}m until game
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <button
          onClick={() => handleTeamSelect(awayTeam.abbrev)}
          disabled={isLocked || isSubmitting || !firebaseUid}
          className={`p-3 rounded-lg border-2 transition-all ${
            selectedTeam === awayTeam.abbrev
              ? 'border-blue-500 bg-blue-500/20'
              : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
          } ${isLocked || !firebaseUid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="text-lg font-bold text-white">{awayTeam.abbrev}</div>
          <div className="text-xs text-gray-400">
            {Math.round(awayTeam.eloBefore)} ELO
          </div>
        </button>

        <div className="flex items-center justify-center">
          <span className="text-gray-500 font-semibold">@</span>
        </div>

        <button
          onClick={() => handleTeamSelect(homeTeam.abbrev)}
          disabled={isLocked || isSubmitting || !firebaseUid}
          className={`p-3 rounded-lg border-2 transition-all ${
            selectedTeam === homeTeam.abbrev
              ? 'border-blue-500 bg-blue-500/20'
              : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
          } ${isLocked || !firebaseUid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="text-lg font-bold text-white">{homeTeam.abbrev}</div>
          <div className="text-xs text-gray-400">
            {Math.round(homeTeam.eloBefore)} ELO
          </div>
        </button>
      </div>

      <div className="mb-3 p-2 bg-slate-700/30 rounded text-sm">
        <div className="text-gray-400">
          Statbarn Prediction:{' '}
          <span className="text-white font-semibold">{aiPrediction}</span>{' '}
          <span className="text-gray-500">
            ({Math.round(aiConfidence * 100)}%)
          </span>
        </div>
      </div>

      {selectedTeam && !isLocked && firebaseUid && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Confidence:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleConfidenceChange(level)}
                  disabled={isSubmitting}
                  className={`w-6 h-6 rounded transition-all ${
                    level <= confidence
                      ? 'text-yellow-400 hover:text-yellow-300'
                      : 'text-gray-600 hover:text-gray-500'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
