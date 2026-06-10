'use client'

import React from 'react'
import Image from 'next/image'
import { useDisclosure } from '@heroui/react'
import { PlayIcon } from '@heroicons/react/24/solid'
import { NHLGame } from '@/types/game'
import { Prediction } from '@/models/prediction'
import { Team } from '@/types/team'
import { GameScheduleRow } from '@/types/gameSchedule'
import {
  getConfidenceClass,
  getRowBorderClass,
  isRowLive,
} from '@/utils/gameSchedule'
import { isLive } from '@/utils/game'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { getMatchupHistory, MatchupData } from '@/actions/matchup'
import { getTeamLogo } from '@/utils/team'
import { MatchupModal } from './MatchupModal'

function resolveTeamLogo(
  abbrev: string,
  teams: Team[],
  game?: NHLGame
): string {
  if (game) {
    if (game.awayTeam.abbrev === abbrev) return game.awayTeam.logo
    if (game.homeTeam.abbrev === abbrev) return game.homeTeam.logo
  }
  return getTeamLogo(teams, abbrev) ?? ''
}

function TeamLogo({
  abbrev,
  teams,
  game,
  size = 'sm',
}: {
  abbrev: string
  teams: Team[]
  game?: NHLGame
  size?: 'sm' | 'md'
}) {
  const src = resolveTeamLogo(abbrev, teams, game)
  if (!src) return null

  const sizeClass = size === 'md' ? 'size-7' : 'size-6'
  const dimension = size === 'md' ? 28 : 24

  return (
    <Image
      src={src}
      alt={`${abbrev} logo`}
      width={dimension}
      height={dimension}
      className={`${sizeClass} flex-shrink-0`}
    />
  )
}

function MatchupCell({
  row,
  teams,
  game,
}: {
  row: GameScheduleRow
  teams: Team[]
  game?: NHLGame
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="inline-flex items-center gap-1.5">
        <TeamLogo abbrev={row.awayTeam} teams={teams} game={game} />
        <span className="text-gray-400">{row.awayTeam}</span>
      </span>
      <span className="text-gray-600">@</span>
      <span className="inline-flex items-center gap-1.5">
        <TeamLogo abbrev={row.homeTeam} teams={teams} game={game} />
        <span className="text-slate-100 font-medium">{row.homeTeam}</span>
      </span>
    </div>
  )
}

function PickCell({
  abbrev,
  teams,
  game,
}: {
  abbrev: string
  teams: Team[]
  game?: NHLGame
}) {
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-green-400">
      <TeamLogo abbrev={abbrev} teams={teams} game={game} />
      {abbrev}
    </span>
  )
}

interface GameScheduleTableProps {
  rows: GameScheduleRow[]
  teams: Team[]
  gamesById?: Map<number, NHLGame>
  predictionsById?: Map<number, Prediction>
  interactive?: boolean
}

function ResultCell({ row }: { row: GameScheduleRow }) {
  if (row.resultStatus === 'pending') return null

  if (row.resultStatus === 'tied') {
    return <span className="text-yellow-500 font-medium text-sm">Tied</span>
  }

  const isFinal = row.gameState === 'FINAL' || row.gameState === 'OFF'
  const label = row.resultStatus === 'correct' ? '✓' : '✗'
  const suffix = isFinal
    ? ''
    : row.resultStatus === 'correct'
      ? ' so far'
      : ' so far'

  return (
    <span
      className={`font-medium text-sm ${
        row.resultStatus === 'correct' ? 'text-green-400' : 'text-red-400'
      }`}
    >
      {label}
      {suffix}
    </span>
  )
}

function TimeCell({ row }: { row: GameScheduleRow }) {
  const isHydrated = useIsHydrated()

  if (row.gameState && isLive(row.gameState)) {
    return (
      <span className="flex items-center gap-1 text-red-500 font-semibold text-sm">
        <PlayIcon className="size-3.5 animate-pulse" />
        LIVE
      </span>
    )
  }

  if (row.gameState === 'FINAL' || row.gameState === 'OFF') {
    return <span className="text-gray-400 text-sm">Final</span>
  }

  if (row.startTimeUTC && isHydrated) {
    return (
      <span className="text-gray-400 text-sm">
        {new Date(row.startTimeUTC).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </span>
    )
  }

  return <span className="text-gray-500 text-sm">—</span>
}

function ScoreCell({ row }: { row: GameScheduleRow }) {
  if (row.awayScore === null || row.homeScore === null) {
    return <span className="text-gray-500">—</span>
  }

  return (
    <span className="font-medium text-slate-200">
      {row.awayScore}–{row.homeScore}
    </span>
  )
}

function ScheduleRow({
  row,
  teams,
  game,
  onClick,
  interactive,
}: {
  row: GameScheduleRow
  teams: Team[]
  game?: NHLGame
  onClick?: () => void
  interactive?: boolean
}) {
  const borderClass = getRowBorderClass(row)
  const confidenceClass = getConfidenceClass(row.confidence)
  const confidencePct = Math.round(row.confidence * 100)

  return (
    <tr
      onClick={onClick}
      className={`${borderClass} ${
        interactive ? 'cursor-pointer hover:bg-slate-800/60' : ''
      } transition-colors`}
      aria-label={`${row.awayTeam} at ${row.homeTeam}`}
    >
      <td className="py-3 px-3 whitespace-nowrap">
        <TimeCell row={row} />
      </td>
      <td className="py-3 px-3">
        <MatchupCell row={row} teams={teams} game={game} />
      </td>
      <td className="py-3 px-3 whitespace-nowrap">
        <PickCell abbrev={row.predictedWinner} teams={teams} game={game} />
      </td>
      <td
        className={`py-3 px-3 whitespace-nowrap font-medium ${confidenceClass}`}
      >
        {confidencePct}%
      </td>
      <td className="py-3 px-3 whitespace-nowrap">
        <ScoreCell row={row} />
      </td>
      <td className="py-3 px-3 whitespace-nowrap">
        <ResultCell row={row} />
      </td>
    </tr>
  )
}

function MobileScheduleRow({
  row,
  teams,
  game,
  onClick,
  interactive,
}: {
  row: GameScheduleRow
  teams: Team[]
  game?: NHLGame
  onClick?: () => void
  interactive?: boolean
}) {
  const borderClass = getRowBorderClass(row)
  const confidenceClass = getConfidenceClass(row.confidence)
  const confidencePct = Math.round(row.confidence * 100)
  const live = isRowLive(row)

  return (
    <div
      onClick={onClick}
      className={`${borderClass} bg-slate-800/40 rounded-lg px-4 py-3 ${
        interactive ? 'cursor-pointer hover:bg-slate-800/70' : ''
      } transition-colors`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {live ? (
            <span className="flex items-center gap-1 text-red-500 font-semibold text-xs flex-shrink-0">
              <PlayIcon className="size-3 animate-pulse" />
              LIVE
            </span>
          ) : row.gameState === 'FINAL' || row.gameState === 'OFF' ? (
            <span className="text-gray-400 text-xs flex-shrink-0">Final</span>
          ) : row.startTimeUTC ? (
            <MobileTime startTimeUTC={row.startTimeUTC} />
          ) : null}
          <MatchupCell row={row} teams={teams} game={game} />
        </div>
        <ResultCell row={row} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="text-gray-400">Pick:</span>
          <PickCell abbrev={row.predictedWinner} teams={teams} game={game} />
          <span className={`font-medium ${confidenceClass}`}>
            ({confidencePct}%)
          </span>
        </span>
        <ScoreCell row={row} />
      </div>
    </div>
  )
}

function MobileTime({ startTimeUTC }: { startTimeUTC: string }) {
  const isHydrated = useIsHydrated()
  if (!isHydrated) return null

  return (
    <span className="text-gray-400 text-xs">
      {new Date(startTimeUTC).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })}
    </span>
  )
}

export function GameScheduleTable({
  rows,
  teams,
  gamesById,
  predictionsById,
  interactive = false,
}: GameScheduleTableProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedPrediction, setSelectedPrediction] =
    React.useState<Prediction | null>(null)
  const [selectedGame, setSelectedGame] = React.useState<NHLGame | null>(null)
  const [matchupData, setMatchupData] = React.useState<MatchupData | null>(null)
  const [isLoadingMatchup, setIsLoadingMatchup] = React.useState(false)

  if (rows.length === 0) {
    return <p className="text-sm text-gray-400 py-4">No games to display.</p>
  }

  const handleRowClick = async (row: GameScheduleRow) => {
    if (!interactive || !gamesById || !predictionsById) return

    const game = gamesById.get(row.id)
    const prediction = predictionsById.get(row.id)
    if (!game || !prediction) return

    setSelectedGame(game)
    setSelectedPrediction(prediction)
    setMatchupData(null)
    onOpen()

    setIsLoadingMatchup(true)
    try {
      const data = await getMatchupHistory(
        game.awayTeam.abbrev,
        game.homeTeam.abbrev,
        5
      )
      setMatchupData(data)
    } catch (error) {
      console.error('Failed to fetch matchup data:', error)
    } finally {
      setIsLoadingMatchup(false)
    }
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/60 text-left text-gray-400 text-xs uppercase tracking-wide">
              <th className="py-2.5 px-3 font-medium">Time</th>
              <th className="py-2.5 px-3 font-medium">Matchup</th>
              <th className="py-2.5 px-3 font-medium">Pick</th>
              <th className="py-2.5 px-3 font-medium">Conf</th>
              <th className="py-2.5 px-3 font-medium">Score</th>
              <th className="py-2.5 px-3 font-medium">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {rows.map((row) => (
              <ScheduleRow
                key={row.id}
                row={row}
                teams={teams}
                game={gamesById?.get(row.id)}
                interactive={interactive}
                onClick={() => handleRowClick(row)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked rows */}
      <div className="md:hidden space-y-2">
        {rows.map((row) => (
          <MobileScheduleRow
            key={row.id}
            row={row}
            teams={teams}
            game={gamesById?.get(row.id)}
            interactive={interactive}
            onClick={() => handleRowClick(row)}
          />
        ))}
      </div>

      {interactive && (
        <MatchupModal
          open={isOpen}
          onClose={onClose}
          prediction={selectedPrediction}
          game={selectedGame}
          matchupData={matchupData}
          teams={teams}
          isLoading={isLoadingMatchup}
        />
      )}
    </>
  )
}
