import { InfoTooltip } from '@/components/InfoTooltip'
import { getLatestEloData, getTeamAccuracyBySeason } from '@/data/teams'
import { getTeams } from '@/data/teamsCache'
import { predictionsService } from '@/services/predictions.service'
import { scheduleService } from '@/services/schedule.service'
import { getCurrentNHLSeason } from '@/utils/currentSeason'
import { DateTime } from 'luxon'
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
                  className="rounded-full bg-white/5"
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
  const today = DateTime.now().toISODate() ?? ''
  const schedule = await scheduleService.getScheduleByDate(today)
  const predictions =
    await predictionsService.getUpcomingGamePredictions(schedule)

  const withConfidence = predictions
    .filter((p) => !p.outcome)
    .map((p) => ({
      ...p,
      confidence: Math.abs(p.homeTeamWinProbability - 0.5) * 2,
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)

  if (withConfidence.length === 0) {
    return (
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Today&apos;s Top Picks
        </h3>
        <p className="text-xs text-slate-500">No games scheduled today.</p>
      </section>
    )
  }

  const teams = await getTeams()

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Today&apos;s Top Picks
      </h3>
      <div className="space-y-2">
        {withConfidence.map((p) => {
          const homeTeam = teams.find((t) => t.triCode === p.homeTeam)
          const awayTeam = teams.find((t) => t.triCode === p.awayTeam)
          const favoured =
            p.homeTeamWinProbability >= 0.5 ? p.homeTeam : p.awayTeam
          const winPct = Math.max(
            p.homeTeamWinProbability,
            p.awayTeamWinProbability
          )
          const confidenceColor =
            winPct >= 0.7
              ? 'text-emerald-400'
              : winPct >= 0.6
                ? 'text-amber-400'
                : 'text-slate-400'

          return (
            <div
              key={p.gameId}
              className="flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-800/40"
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {awayTeam?.logo && (
                  <Image
                    src={awayTeam.logo}
                    alt={p.awayTeam}
                    width={20}
                    height={20}
                    className="rounded-full bg-white/5 shrink-0"
                  />
                )}
                <span className="text-xs text-slate-400">{p.awayTeam}</span>
                <span className="text-xs text-slate-600">@</span>
                {homeTeam?.logo && (
                  <Image
                    src={homeTeam.logo}
                    alt={p.homeTeam}
                    width={20}
                    height={20}
                    className="rounded-full bg-white/5 shrink-0"
                  />
                )}
                <span className="text-xs text-slate-400">{p.homeTeam}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-semibold text-slate-300">
                  {favoured}
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
            className="rounded-full bg-white/5 shrink-0"
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

// ---- Sidebar ----

export async function PredictionsSidebar() {
  return (
    <div className="space-y-8 py-4 sm:pt-0">
      <EloRankings />
      <ConfidenceLeaders />
      <TeamAccuracy />
    </div>
  )
}
