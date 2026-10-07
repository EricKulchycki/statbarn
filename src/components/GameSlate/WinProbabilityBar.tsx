import { SlateGame } from '@/lib/daySlate'
import { getWinProbability } from './presentation'

export function WinProbabilityBar({ game }: { game: SlateGame }) {
  const probability = getWinProbability(game)
  if (!probability) return null

  return (
    <div className="mt-4">
      <div
        className="h-1.5 overflow-hidden rounded-full bg-slate-700"
        role="img"
        aria-label={probability.description}
      >
        <div
          className="h-full rounded-full bg-slate-200"
          style={{ width: probability.awayPercent }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>{probability.awayLabel}</span>
        <span>Win prob.</span>
        <span>{probability.homeLabel}</span>
      </div>
    </div>
  )
}
