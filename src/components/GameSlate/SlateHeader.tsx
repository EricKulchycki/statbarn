import { DaySlate } from '@/lib/daySlate'
import { cn } from '@heroui/react'
import { buildStatTiles, StatTileModel, Tone } from './presentation'

const VALUE_TONE: Record<Tone, string> = {
  neutral: 'text-slate-100',
  positive: 'text-green-400',
  negative: 'text-orange-400',
}

export function SlateHeader({ slate }: { slate: DaySlate }) {
  const tiles = buildStatTiles(slate)

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold tracking-wider text-slate-400">
          {slate.heading}
        </p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
          {slate.title}
        </h1>
      </div>
      {tiles.length > 0 && (
        <dl className="grid grid-cols-2 gap-2 sm:flex">
          {tiles.map((tile) => (
            <StatTile key={tile.label} tile={tile} />
          ))}
        </dl>
      )}
    </header>
  )
}

function StatTile({ tile }: { tile: StatTileModel }) {
  return (
    <div
      className={cn(
        'min-w-28 rounded-xl border bg-slate-900/60 px-3.5 py-2.5',
        tile.highlighted ? 'border-slate-600' : 'border-slate-800'
      )}
    >
      <dt className="text-xs text-slate-400">{tile.label}</dt>
      <dd
        className={cn('text-xl font-bold tabular-nums', VALUE_TONE[tile.tone])}
      >
        {tile.value}
      </dd>
    </div>
  )
}
