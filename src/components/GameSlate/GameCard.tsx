import { SlateGame } from '@/lib/daySlate'
import { cn } from '@heroui/react'
import Image from 'next/image'
import { PickBadge } from './PickBadge'
import {
  getFinalFooter,
  getTeamLine,
  isSelectable,
  TeamSide,
} from './presentation'
import { StartTime } from './StartTime'
import { WinProbabilityBar } from './WinProbabilityBar'

const CARD_CLASS =
  'w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left'

interface Props {
  game: SlateGame
  onSelect: (gameId: number) => void
}

export function GameCard({ game, onSelect }: Props) {
  const content = (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <GameStatusLabel game={game} />
        <PickBadge game={game} />
      </div>

      <div className="space-y-2.5">
        <TeamLine game={game} side="away" />
        <TeamLine game={game} side="home" />
      </div>

      {game.state === 'final' ? (
        <p className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-400">
          {getFinalFooter(game)}
        </p>
      ) : (
        <WinProbabilityBar game={game} />
      )}
    </>
  )

  if (!isSelectable(game)) return <div className={CARD_CLASS}>{content}</div>

  return (
    <button
      type="button"
      onClick={() => onSelect(game.id)}
      className={cn(
        CARD_CLASS,
        'transition-colors hover:border-slate-700 hover:bg-slate-900'
      )}
    >
      {content}
    </button>
  )
}

function GameStatusLabel({ game }: { game: SlateGame }) {
  switch (game.state) {
    case 'live':
      return (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-red-500">
          <span
            className="size-2 animate-pulse rounded-full bg-red-500"
            aria-hidden
          />
          LIVE
        </span>
      )
    case 'final':
      return (
        <span className="text-sm font-semibold text-slate-400">
          {game.finalLabel}
        </span>
      )
    case 'upcoming':
      return <StartTime startTimeUTC={game.startTimeUTC} />
  }
}

function TeamLine({ game, side }: { game: SlateGame; side: TeamSide }) {
  const { team, isPick, isDimmed, isScoreMuted, scoreText } = getTeamLine(
    game,
    side
  )

  return (
    <div className="flex items-center gap-3">
      {team.logo && (
        <Image
          src={team.logo}
          alt={`${team.abbrev} logo`}
          width={28}
          height={28}
          className={cn('size-7 shrink-0', isDimmed && 'opacity-50')}
        />
      )}
      <span
        className={cn(
          'text-lg font-bold tracking-wide',
          isDimmed ? 'text-slate-500' : 'text-slate-100'
        )}
      >
        {team.abbrev}
      </span>
      {isPick && (
        <span className="rounded border border-slate-600 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-300">
          PICK
        </span>
      )}
      <span
        className={cn(
          'ml-auto text-2xl font-bold tabular-nums',
          isScoreMuted ? 'text-slate-500' : 'text-slate-100'
        )}
      >
        {scoreText}
      </span>
    </div>
  )
}
