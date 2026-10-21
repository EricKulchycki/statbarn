import { InfoTooltip } from '@/components/InfoTooltip'
import { getLatestEloData, getTeamAccuracyBySeason } from '@/data/teams'
import { getTeams } from '@/data/teamsCache'
import { getCachedBackToBackStats } from '@/lib/cache'
import { getDaySlates, topPicks } from '@/lib/daySlate'
import { TeamBackToBackStat } from '@/services/elo.service'
import { getCurrentNHLSeason } from '@/utils/currentSeason'
import Image from 'next/image'

function getSeasonWithFallback(): { current: number; prev: number } {
  const current = Number(getCurrentNHLSeason())
  const startYear = Math.floor(current / 10000)
  const prev = (startYear - 1) * 10000 + startYear
  return { current, prev }
}

// ---- ELO Power Rankings ----

async function EloRankings() {
  const [elos, teams] = await Promise.all([getLatestEloData(), getTeams()])
  const ranked = [...elos]
    .filter((e) => e.abbrev !== 'ARI')
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 10)

  return (
    <section>
      <div className="flex items-center gap-1.5 mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Power Rankings
        </h3>
        <InfoTooltip content="Ratings use an ELO system — teams gain or lose points based on game outcomes, weighted by margin of victory and opponent strength. At the start of each season, ratings are pulled one-third of the way back toward 1500 to account for roster turnover." />
      </div>
      <div className="space-y-1.5">
        {ranked.map((entry, idx) => {
          const team = teams.find((t) => t.triCode === entry.abbrev)
          const rank = idx + 1
          const rankColor =
            rank <= 3
              ? 'text-emerald-400'
              : rank <= 10
                ? 'text-slate-300'
                : 'text-slate-500'

          return (
            <div
              key={entry.abbrev}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <span
                className={`w-5 text-xs font-bold tabular-nums text-right ${rankColor}`}
              >
                {rank}
              </span>
              {team?.logo && (
                <Image
                  src={team.logo}
                  alt={entry.abbrev}
                  width={24}
                  height={24}
                  className="size-6 shrink-0 rounded-full bg-white/5 object-contain"
                />
              )}
              <span className="flex-1 text-sm text-slate-200 font-medium">
                {entry.abbrev}
              </span>
              <span className="text-xs tabular-nums text-slate-400">
                {entry.elo.toFixed(0)}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ---- Today's Confidence Leaders ----

async function ConfidenceLeaders() {
  // Same per-request slates as the game list, so "today" matches the
  // viewer's timezone
  const { slates, todayIso } = await getDaySlates()
  const picks = topPicks(slates, todayIso)

  if (picks.length === 0) {
    return (
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Today&apos;s Top Picks
        </h3>
        <p className="text-xs text-slate-500">No games scheduled today.</p>
      </section>
    )
  }

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Today&apos;s Top Picks
      </h3>
      <div className="space-y-2">
        {picks.map((game) => {
          const winPct = game.pickProbability ?? 0
          const confidenceColor =
            winPct >= 0.7
              ? 'text-emerald-400'
              : winPct >= 0.6
                ? 'text-amber-400'
                : 'text-slate-400'

          return (
            <div
              key={game.id}
              className="flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-800/40"
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Image
                  src={game.away.logo}
                  alt={game.away.abbrev}
                  width={20}
                  height={20}
                  className="size-5 shrink-0 rounded-full bg-white/5 object-contain"
                />
                <span className="text-xs text-slate-400">
                  {game.away.abbrev}
                </span>
                <span className="text-xs text-slate-600">@</span>
                <Image
                  src={game.home.logo}
                  alt={game.home.abbrev}
                  width={20}
                  height={20}
                  className="size-5 shrink-0 rounded-full bg-white/5 object-contain"
                />
                <span className="text-xs text-slate-400">
                  {game.home.abbrev}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-semibold text-slate-300">
                  {game.pick}
                </span>
                <span
                  className={`ml-1.5 text-xs font-bold tabular-nums ${confidenceColor}`}
                >
                  {(winPct * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ---- Team Prediction Accuracy ----

async function TeamAccuracy() {
  const { current, prev } = getSeasonWithFallback()
  let stats = await getTeamAccuracyBySeason(current)
  const season = stats.length > 0 ? current : prev
  if (stats.length === 0) stats = await getTeamAccuracyBySeason(prev)

  if (stats.length === 0) {
    return (
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Accuracy by Team
        </h3>
        <p className="text-xs text-slate-500">No data yet.</p>
      </section>
    )
  }

  const teams = await getTeams()
  const top5 = stats.slice(0, 5)
  const bottom5 = stats.slice(-5).reverse()
  const seasonLabel = `${String(season).slice(0, 4)}/${String(season).slice(4)}`

  function TeamAccuracyRow({
    triCode,
    correct,
    total,
    accuracy,
  }: {
    triCode: string
    correct: number
    total: number
    accuracy: number
  }) {
    const team = teams.find((t) => t.triCode === triCode)
    const color =
      accuracy >= 0.6
        ? 'text-emerald-400'
        : accuracy >= 0.5
          ? 'text-slate-300'
          : 'text-red-400'

    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors">
        {team?.logo && (
          <Image
            src={team.logo}
            alt={triCode}
            width={20}
            height={20}
            className="size-5 shrink-0 rounded-full bg-white/5 object-contain"
          />
        )}
        <span className="flex-1 text-xs text-slate-300">{triCode}</span>
        <span className="text-xs text-slate-500 tabular-nums">
          {correct}/{total}
        </span>
        <span className={`text-xs font-bold tabular-nums ${color}`}>
          {(accuracy * 100).toFixed(0)}%
        </span>
      </div>
    )
  }

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1">
        Accuracy by Team
      </h3>
      <p className="text-xs text-slate-600 mb-3">{seasonLabel} season</p>
      <div className="space-y-0.5">
        <p className="text-xs text-slate-500 mb-1">Best predicted</p>
        {top5.map((s) => (
          <TeamAccuracyRow key={s.triCode} {...s} />
        ))}
        <div className="border-t border-slate-800 my-2" />
        <p className="text-xs text-slate-500 mb-1">Hardest to predict</p>
        {bottom5.map((s) => (
          <TeamAccuracyRow key={s.triCode} {...s} />
        ))}
      </div>
    </section>
  )
}

// ---- Back-to-Back Performance ----

async function BackToBacks() {
  const { current, prev } = getSeasonWithFallback()
  let stats = await getCachedBackToBackStats(current)
  const season = stats.length > 0 ? current : prev
  if (stats.length === 0) stats = await getCachedBackToBackStats(prev)

  const heading = (
    <div className="flex items-center gap-1.5 mb-1">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Back-to-Backs
      </h3>
      <InfoTooltip content="How each team does on the second night of a back-to-back, compared with what our model expected. +1.5 means 1.5 more wins than predicted across those games." />
    </div>
  )

  if (stats.length === 0) {
    return (
      <section>
        {heading}
        <p className="text-xs text-slate-500">No data yet.</p>
      </section>
    )
  }

  const teams = await getTeams()
  const top5 = stats.slice(0, 5)
  const bottom5 = stats.slice(-5).reverse()
  const seasonLabel = `${String(season).slice(0, 4)}/${String(season).slice(4)}`

  function BackToBackRow({
    triCode,
    games,
    wins,
    expectedWins,
  }: TeamBackToBackStat) {
    const team = teams.find((t) => t.triCode === triCode)
    const aboveExpected = wins - expectedWins
    const color =
      aboveExpected >= 0.5
        ? 'text-emerald-400'
        : aboveExpected <= -0.5
          ? 'text-red-400'
          : 'text-slate-300'

    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors">
        {team?.logo && (
          <Image
            src={team.logo}
            alt={triCode}
            width={20}
            height={20}
            className="size-5 shrink-0 rounded-full bg-white/5 object-contain"
          />
        )}
        <span className="flex-1 text-xs text-slate-300">{triCode}</span>
        <span className="text-xs text-slate-500 tabular-nums">
          {wins}–{games - wins}
        </span>
        <span
          className={`w-10 text-right text-xs font-bold tabular-nums ${color}`}
        >
          {aboveExpected > 0 ? '+' : ''}
          {aboveExpected.toFixed(1)}
        </span>
      </div>
    )
  }

  return (
    <section>
      {heading}
      <p className="text-xs text-slate-600 mb-3">{seasonLabel} season</p>
      <div className="space-y-0.5">
        <p className="text-xs text-slate-500 mb-1">Handles them best</p>
        {top5.map((s) => (
          <BackToBackRow key={s.triCode} {...s} />
        ))}
        <div className="border-t border-slate-800 my-2" />
        <p className="text-xs text-slate-500 mb-1">Struggles most</p>
        {bottom5.map((s) => (
          <BackToBackRow key={s.triCode} {...s} />
        ))}
      </div>
    </section>
  )
}

// ---- Sidebar ----

export async function PredictionsSidebar() {
  return (
    <div className="space-y-8 py-4 sm:pt-0">
      <EloRankings />
      <ConfidenceLeaders />
      <TeamAccuracy />
      <BackToBacks />
    </div>
  )
}
