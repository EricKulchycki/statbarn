// Pure view-model helpers for the game slate. Components only map these
// results to markup, so every display decision is unit-testable.
import { DaySlate, PickStatus, SlateGame, SlateTeam } from '@/lib/daySlate'

export type Tone = 'neutral' | 'positive' | 'negative'
export type BadgeIcon = 'up' | 'down' | 'check' | 'cross'
export type TeamSide = 'away' | 'home'

export interface SectionModel {
  key: SlateGame['state']
  title: string
  games: SlateGame[]
  isLive: boolean
  collapsible: boolean
}

export interface StatTileModel {
  label: string
  value: string
  tone: Tone
  highlighted: boolean
}

export interface BadgeModel {
  label: string
  tone: Tone
  icon?: BadgeIcon
}

export interface TeamLineModel {
  team: SlateTeam
  isPick: boolean
  isDimmed: boolean
  isScoreMuted: boolean
  scoreText: string
}

export interface WinProbabilityModel {
  awayLabel: string
  homeLabel: string
  awayPercent: string
  description: string
}

export function formatPercent(probability: number): string {
  return `${Math.round(probability * 100)}%`
}

export function buildSections(slate: DaySlate): SectionModel[] {
  const byState = (state: SlateGame['state']) =>
    slate.games.filter((g) => g.state === state)

  const sections: SectionModel[] = [
    {
      key: 'live',
      title: 'Live now',
      games: byState('live'),
      isLive: true,
      collapsible: false,
    },
    {
      key: 'upcoming',
      title: slate.isToday ? 'Later tonight' : 'Scheduled',
      games: byState('upcoming'),
      isLive: false,
      collapsible: false,
    },
    {
      key: 'final',
      title: 'Final',
      games: byState('final'),
      isLive: false,
      collapsible: true,
    },
  ]

  return sections.filter((s) => s.games.length > 0)
}

export function buildStatTiles(slate: DaySlate): StatTileModel[] {
  const { correct, incorrect, leading, trailing, level } = slate.record

  // Future days have nothing to tally yet
  if (!slate.isToday && correct + incorrect === 0) return []

  const record: StatTileModel = {
    label: slate.isToday ? 'Tonight' : 'Record',
    value: `${correct}–${incorrect}`,
    tone: 'neutral',
    highlighted: true,
  }
  if (!slate.isToday) return [record]

  return [
    record,
    tile('Leading', leading, 'positive'),
    tile('Trailing', trailing, 'negative'),
    tile('Level', level, 'neutral'),
  ]
}

function tile(label: string, count: number, tone: Tone): StatTileModel {
  return { label, value: String(count), tone, highlighted: false }
}

const PICK_STATUS_BADGES: Record<PickStatus, BadgeModel> = {
  leading: { label: 'Pick leading', tone: 'positive', icon: 'up' },
  trailing: { label: 'Pick trailing', tone: 'negative', icon: 'down' },
  level: { label: 'Pick level', tone: 'neutral' },
  correct: { label: 'Called it', tone: 'positive', icon: 'check' },
  incorrect: { label: 'Missed', tone: 'negative', icon: 'cross' },
}

export function getPickBadge(game: SlateGame): BadgeModel {
  if (game.pick === null) return { label: 'No pick', tone: 'neutral' }
  if (game.pickStatus !== null) return PICK_STATUS_BADGES[game.pickStatus]

  const probability =
    game.pickProbability === null
      ? ''
      : ` · ${formatPercent(game.pickProbability)}`
  return { label: `Pick ${game.pick}${probability}`, tone: 'neutral' }
}

export function getTeamLine(game: SlateGame, side: TeamSide): TeamLineModel {
  const team = game[side]
  const opponent = side === 'away' ? game.home : game.away
  const isBehind =
    team.score !== null &&
    opponent.score !== null &&
    team.score < opponent.score

  return {
    team,
    isPick: game.pick === team.abbrev,
    isDimmed: game.state === 'final' && isBehind,
    isScoreMuted: team.score === null || isBehind,
    scoreText: team.score === null ? '–' : String(team.score),
  }
}

export function getFinalFooter(game: SlateGame): string {
  if (game.pick === null || game.pickProbability === null) return 'No pick made'
  return `Had ${game.pick} at ${formatPercent(game.pickProbability)}`
}

export function getWinProbability(game: SlateGame): WinProbabilityModel | null {
  const { away, home } = game
  if (away.winProbability === null || home.winProbability === null) return null

  const awayPercent = formatPercent(away.winProbability)
  const homePercent = formatPercent(home.winProbability)

  return {
    awayLabel: `${away.abbrev} ${awayPercent}`,
    homeLabel: `${homePercent} ${home.abbrev}`,
    awayPercent,
    description: `Win probability: ${away.abbrev} ${awayPercent}, ${home.abbrev} ${homePercent}`,
  }
}

// Only predicted games have a matchup to show
export function isSelectable(game: SlateGame): boolean {
  return game.pick !== null
}
