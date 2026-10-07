import { describe, expect, it } from 'vitest'
import { MatchupHistoryGame, TeamSeasonStats } from '../src/actions/matchup'
import {
  buildHero,
  buildMeetings,
  buildStatRows,
  formatKickoff,
  getConfidenceTier,
  getSampleSizeNote,
  splitTeamName,
} from '../src/components/MatchupModal/presentation'
import { TEAM_COLORS } from '../src/constants/teamColors'
import { Team } from '../src/types/team'
import { makeGame, makeHomeFavoredPrediction } from './fixtures/slate'

const TEAMS = [
  { triCode: 'EDM', fullName: 'Edmonton Oilers' },
  { triCode: 'WPG', fullName: 'Winnipeg Jets' },
] as Team[]

const hero = buildHero(makeGame(1, 'FUT'), makeHomeFavoredPrediction(1), TEAMS)

function stats(
  teamAbbrev: string,
  avgPointsScored: number,
  avgPointsAllowed: number,
  totalGames: number
): TeamSeasonStats {
  return { teamAbbrev, avgPointsScored, avgPointsAllowed, totalGames }
}

function meeting(
  gameId: number,
  date: string,
  awayTeam: string,
  awayScore: number,
  homeTeam: string,
  homeScore: number
): MatchupHistoryGame {
  const winner =
    awayScore > homeScore ? awayTeam : homeScore > awayScore ? homeTeam : 'TIE'
  return {
    gameId,
    date,
    awayTeam,
    awayScore,
    homeTeam,
    homeScore,
    winner,
    season: 20262027,
  }
}

describe('formatKickoff', () => {
  it('shows date, local start time, and city', () => {
    expect(
      formatKickoff('2026-10-07T03:40:00Z', 'Seattle', 'America/Los_Angeles')
    ).toBe('Tue, Oct 6 · 8:40 PM · Seattle')
  })
})

describe('getConfidenceTier', () => {
  it('buckets pick probability at 60% and 70%', () => {
    expect(getConfidenceTier(0.52)).toBe('Toss-up')
    expect(getConfidenceTier(0.6)).toBe('Lean')
    expect(getConfidenceTier(0.69)).toBe('Lean')
    expect(getConfidenceTier(0.7)).toBe('Strong')
  })
})

describe('splitTeamName', () => {
  it('separates the city from the nickname', () => {
    expect(splitTeamName('Vegas Golden Knights', 'Vegas')).toEqual({
      city: 'Vegas',
      nickname: 'Golden Knights',
    })
  })

  it('falls back to the full name when the city does not prefix it', () => {
    expect(splitTeamName('Utah Mammoth', 'Salt Lake City')).toEqual({
      city: 'Utah Mammoth',
      nickname: '',
    })
  })

  it('falls back to the city when the team is unknown', () => {
    expect(splitTeamName(undefined, 'Seattle')).toEqual({
      city: 'Seattle',
      nickname: '',
    })
  })
})

describe('buildHero', () => {
  it('describes both teams and the pick', () => {
    expect(hero.pick).toBe('WPG')
    expect(hero.tier).toBe('Lean')
    expect(hero.away).toMatchObject({
      side: 'away',
      city: 'Edmonton',
      nickname: 'Oilers',
      logo: 'edm-dark.svg',
      color: TEAM_COLORS.EDM,
      winPercent: '40%',
    })
    expect(hero.home).toMatchObject({
      side: 'home',
      city: 'Winnipeg',
      nickname: 'Jets',
      color: TEAM_COLORS.WPG,
      winPercent: '60%',
    })
  })

  it('keeps the two sides distinguishable when team colours match', () => {
    const game = makeGame(1, 'FUT')
    game.awayTeam.abbrev = 'BOS'
    game.homeTeam.abbrev = 'NSH'
    const { away, home } = buildHero(game, makeHomeFavoredPrediction(1), [])
    expect(TEAM_COLORS.BOS).toBe(TEAM_COLORS.NSH)
    expect(away.color).not.toBe(home.color)
  })
})

describe('buildStatRows', () => {
  const rows = buildStatRows(
    stats('EDM', 3, 3, 2),
    stats('WPG', 4.333, 1.667, 3)
  )

  it('formats each stat with the right precision and sign', () => {
    expect(rows.map((r) => [r.label, r.away.text, r.home.text])).toEqual([
      ['Goals for / game', '3.00', '4.33'],
      ['Goals against / game', '3.00', '1.67'],
      ['Goal diff / game', '0.00', '+2.67'],
      ['Games played', '2', '3'],
    ])
  })

  it('highlights the better side, where lower is better for goals against', () => {
    expect(rows.map((r) => [r.away.isBetter, r.home.isBetter])).toEqual([
      [false, true],
      [false, true],
      [false, true],
      [false, false],
    ])
  })

  it('favours fewer goals against even when the away side allows fewer', () => {
    const [, against] = buildStatRows(
      stats('EDM', 3, 2, 5),
      stats('WPG', 3, 3, 5)
    )
    expect([against.away.isBetter, against.home.isBetter]).toEqual([
      true,
      false,
    ])
  })

  it('scales bars against the larger value', () => {
    expect(rows[0].home.fill).toBe(1)
    expect(rows[0].away.fill).toBeCloseTo(3 / 4.333)
  })

  it('shows negative values as empty bars', () => {
    const [, , diff] = buildStatRows(
      stats('EDM', 1, 3, 5),
      stats('WPG', 2, 3, 5)
    )
    expect(diff.away.fill).toBe(0)
    expect(diff.home.fill).toBe(0)
    expect(diff.away.text).toBe('-2.00')
  })
})

describe('getSampleSizeNote', () => {
  it('warns about small samples with the range of games played', () => {
    expect(
      getSampleSizeNote(stats('EDM', 3, 3, 2), stats('WPG', 4, 2, 3))
    ).toBe(
      'Early season: only 2–3 games each, so these averages will swing a lot.'
    )
  })

  it('collapses the range when both teams played the same number', () => {
    expect(
      getSampleSizeNote(stats('EDM', 3, 3, 1), stats('WPG', 4, 2, 1))
    ).toBe(
      'Early season: only 1 game each, so these averages will swing a lot.'
    )
  })

  it('says so when no games have been played', () => {
    expect(
      getSampleSizeNote(stats('EDM', 0, 0, 0), stats('WPG', 0, 0, 0))
    ).toBe('No games played yet this season.')
  })

  it('stays quiet once both teams have a real sample', () => {
    expect(
      getSampleSizeNote(stats('EDM', 3, 3, 10), stats('WPG', 4, 2, 12))
    ).toBeNull()
  })
})

describe('buildMeetings', () => {
  // Newest first, as getMatchupHistory returns them
  const history = [
    meeting(5, '2026-04-16', 'WPG', 1, 'EDM', 4),
    meeting(4, '2026-04-10', 'EDM', 3, 'WPG', 4),
    meeting(3, '2026-02-01', 'WPG', 3, 'EDM', 2),
    meeting(2, '2025-10-12', 'EDM', 1, 'WPG', 2),
    meeting(1, '2025-04-11', 'WPG', 1, 'EDM', 2),
  ]
  const meetings = buildMeetings(history, hero)!

  it('labels the series leader', () => {
    expect(meetings.recordLabel).toBe('WPG 3–2')
  })

  it('orders the strip oldest to most recent in team colours', () => {
    expect(meetings.strip.map((c) => c.winner)).toEqual([
      'EDM',
      'WPG',
      'WPG',
      'WPG',
      'EDM',
    ])
    expect(meetings.strip[0].color).toBe(TEAM_COLORS.EDM)
    expect(meetings.oldestLabel).toBe('Apr 2025')
  })

  it('keeps table rows newest first with winner and margin', () => {
    expect(meetings.rows[0]).toMatchObject({
      dateLabel: 'Apr 16, 2026',
      away: { abbrev: 'WPG', score: 1, isWinner: false },
      home: { abbrev: 'EDM', score: 4, isWinner: true },
      margin: { winner: 'EDM', text: '+3', color: TEAM_COLORS.EDM },
    })
  })

  it('reports an even series and ties without a margin', () => {
    const even = buildMeetings(
      [
        meeting(2, '2026-01-02', 'EDM', 2, 'WPG', 1),
        meeting(1, '2026-01-01', 'EDM', 1, 'WPG', 2),
        meeting(0, '2005-01-01', 'EDM', 2, 'WPG', 2),
      ],
      hero
    )!
    expect(even.recordLabel).toBe('Even 1–1')
    expect(even.rows[2].margin).toBeNull()
    expect(even.strip[0].color).not.toBe(TEAM_COLORS.EDM)
  })

  it('returns nothing without history', () => {
    expect(buildMeetings([], hero)).toBeNull()
  })
})
