import { TeamSeasonStats } from '@/actions/matchup'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { cn } from '@heroui/react'
import {
  buildStatRows,
  getSampleSizeNote,
  MatchupHeroModel,
  StatRowModel,
  StatSideModel,
} from './presentation'

// Slate-600, for the side that isn't ahead on a stat
const MUTED_BAR = '#475569'

interface Props {
  hero: MatchupHeroModel
  away?: TeamSeasonStats
  home?: TeamSeasonStats
}

export function SeasonComparison({ hero, away, home }: Props) {
  return (
    <section className="flex h-full flex-col">
      <div className="mb-6 flex items-baseline justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          This season
        </h3>
        <p className="text-sm font-semibold text-slate-200">
          {hero.away.abbrev} <span className="px-1.5 text-slate-500">vs</span>
          {hero.home.abbrev}
        </p>
      </div>

      {away && home ? (
        <SeasonStats hero={hero} away={away} home={home} />
      ) : (
        <p className="text-sm text-slate-400">No season stats yet.</p>
      )}
    </section>
  )
}

function SeasonStats({
  hero,
  away,
  home,
}: {
  hero: MatchupHeroModel
  away: TeamSeasonStats
  home: TeamSeasonStats
}) {
  const note = getSampleSizeNote(away, home)

  return (
    <>
      <div className="space-y-6">
        {buildStatRows(away, home).map((row) => (
          <StatRow key={row.label} row={row} hero={hero} />
        ))}
      </div>
      {note && (
        <p className="mt-8 flex gap-2.5 rounded-xl bg-slate-800/60 p-4 text-sm text-slate-300 md:mt-auto">
          <InformationCircleIcon
            className="size-5 shrink-0 text-slate-400"
            aria-hidden
          />
          {note}
        </p>
      )}
    </>
  )
}

function StatRow({ row, hero }: { row: StatRowModel; hero: MatchupHeroModel }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <StatValue side={row.away} />
        <span className="text-sm text-slate-400">{row.label}</span>
        <StatValue side={row.home} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <StatBar side={row.away} color={hero.away.color} alignEnd />
        <StatBar side={row.home} color={hero.home.color} />
      </div>
    </div>
  )
}

function StatValue({ side }: { side: StatSideModel }) {
  return (
    <span
      className={cn(
        'text-2xl font-bold tabular-nums',
        side.isBetter ? 'text-slate-100' : 'text-slate-400'
      )}
    >
      {side.text}
    </span>
  )
}

// The away bar grows from the centre outwards, mirroring the home bar
function StatBar({
  side,
  color,
  alignEnd = false,
}: {
  side: StatSideModel
  color: string
  alignEnd?: boolean
}) {
  return (
    <div
      className={cn(
        'flex h-1.5 rounded-full bg-slate-800',
        alignEnd && 'justify-end'
      )}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${side.fill * 100}%`,
          backgroundColor: side.isBetter ? color : MUTED_BAR,
        }}
      />
    </div>
  )
}
