import { SlateGame } from '@/lib/daySlate'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { cn } from '@heroui/react'
import { ReactNode } from 'react'
import { BadgeIcon, getPickBadge, Tone } from './presentation'

const BADGE_TONE: Record<Tone, string> = {
  neutral: 'bg-slate-800 text-slate-300',
  positive: 'bg-green-500/15 text-green-400',
  negative: 'bg-orange-500/15 text-orange-300',
}

const BADGE_ICON: Record<BadgeIcon, ReactNode> = {
  up: <span aria-hidden>▲</span>,
  down: <span aria-hidden>▼</span>,
  check: <CheckIcon className="size-3.5" aria-hidden />,
  cross: <XMarkIcon className="size-3.5" aria-hidden />,
}

export function PickBadge({ game }: { game: SlateGame }) {
  const badge = getPickBadge(game)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        BADGE_TONE[badge.tone]
      )}
    >
      {badge.icon && BADGE_ICON[badge.icon]}
      {badge.label}
    </span>
  )
}
