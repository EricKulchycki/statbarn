import { cn } from '@heroui/react'
import Image from 'next/image'
import {
  ConfidenceTier,
  MatchupHeroModel,
  MatchupTeamModel,
} from './presentation'

const TIER_CLASS: Record<ConfidenceTier, string> = {
  'Toss-up': 'bg-amber-500/15 text-amber-400',
  Lean: 'bg-blue-500/15 text-blue-400',
  Strong: 'bg-green-500/15 text-green-400',
}

export function MatchupHero({ hero }: { hero: MatchupHeroModel }) {
  return (
    <div className="grid grid-cols-2 items-center gap-6 px-6 py-8 sm:px-8 md:grid-cols-[1fr_minmax(0,28rem)_1fr]">
      <TeamIdentity team={hero.away} />
      <div className="order-last col-span-2 md:order-none md:col-span-1">
        <PickSummary hero={hero} />
      </div>
      <TeamIdentity team={hero.home} />
    </div>
  )
}

function TeamIdentity({ team }: { team: MatchupTeamModel }) {
  const isHome = team.side === 'home'

  return (
    <div
      className={cn(
        'flex items-center gap-4',
        isHome && 'flex-row-reverse text-right'
      )}
    >
      <div
        className="grid size-16 shrink-0 place-items-center rounded-2xl"
        style={{
          backgroundColor: `${team.color}33`,
          boxShadow: `inset 0 0 0 1px ${team.color}`,
        }}
      >
        {team.logo && (
          <Image
            src={team.logo}
            alt=""
            width={44}
            height={44}
            className="size-11"
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {team.side}
        </p>
        <p className="truncate text-2xl font-extrabold tracking-tight text-slate-100 sm:text-3xl">
          {team.city}
        </p>
        {team.nickname && (
          <p className="truncate text-sm text-slate-400">{team.nickname}</p>
        )}
      </div>
    </div>
  )
}

function PickSummary({ hero }: { hero: MatchupHeroModel }) {
  const { away, home } = hero

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        <span className="rounded border border-slate-600 px-2 py-0.5 text-xs font-bold tracking-wider text-slate-300">
          OUR PICK
        </span>
        <span className="text-2xl font-extrabold text-slate-100">
          {hero.pick}
        </span>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-sm font-semibold',
            TIER_CLASS[hero.tier]
          )}
        >
          {hero.tier}
        </span>
      </div>

      <div
        className="mt-4 flex h-2 gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={`Win probability: ${away.abbrev} ${away.winPercent}, ${home.abbrev} ${home.winPercent}`}
      >
        <div style={{ width: away.winPercent, backgroundColor: away.color }} />
        <div style={{ width: home.winPercent, backgroundColor: home.color }} />
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-xl font-bold text-slate-100">
          {away.winPercent}
        </span>
        <span className="text-sm text-slate-400">Win probability</span>
        <span className="text-xl font-bold text-slate-100">
          {home.winPercent}
        </span>
      </div>
    </div>
  )
}
