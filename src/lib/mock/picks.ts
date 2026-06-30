import { Game } from '@/types/picks'
import { DateTime } from 'luxon'

const NHL_TEAMS = [
  'ANA',
  'BOS',
  'BUF',
  'CGY',
  'CAR',
  'CHI',
  'COL',
  'CBJ',
  'DAL',
  'DET',
  'EDM',
  'FLA',
  'LAK',
  'MIN',
  'MTL',
  'NSH',
  'NJD',
  'NYI',
  'NYR',
  'OTT',
  'PHI',
  'PIT',
  'SEA',
  'SJS',
  'STL',
  'TBL',
  'TOR',
  'UTA',
  'VAN',
  'VGK',
  'WSH',
  'WPG',
] as const

function teamLogo(abbrev: string): string {
  return `https://assets.nhle.com/logos/nhl/svg/${abbrev}_light.svg`
}

function eloFor(abbrev: string): number {
  // Deterministic but varied per team so the same team always has the same ELO
  const seed = abbrev.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return 1420 + (seed % 180)
}

function winProb(
  homeElo: number,
  awayElo: number
): { home: number; away: number } {
  // Standard ELO win probability
  const home = 1 / (1 + Math.pow(10, (awayElo - homeElo - 50) / 400))
  return {
    home: Math.round(home * 1000) / 1000,
    away: Math.round((1 - home) * 1000) / 1000,
  }
}

// Game times spread across today/tomorrow (UTC equivalents of common NHL start times)
const START_TIMES_UTC = [
  '23:00',
  '23:30',
  '00:00',
  '00:30',
  '01:00',
  '02:00',
  '03:00',
]

export function generateMockGames(count: number = 8): Game[] {
  const teams = [...NHL_TEAMS]
  const today = DateTime.now().toISODate()!
  const tomorrow = DateTime.now().plus({ days: 1 }).toISODate()!

  const matchups: Array<[string, string]> = []
  const used = new Set<string>()

  // Shuffle teams deterministically enough for development purposes
  const shuffled = [...teams].sort((a, b) => (a > b ? 1 : -1))

  for (let i = 0; i < shuffled.length - 1 && matchups.length < count; i += 2) {
    const home = shuffled[i]
    const away = shuffled[i + 1]
    if (!used.has(home) && !used.has(away)) {
      matchups.push([home, away])
      used.add(home)
      used.add(away)
    }
  }

  return matchups.slice(0, count).map(([home, away], i) => {
    const homeElo = eloFor(home)
    const awayElo = eloFor(away)
    const { home: homeProb, away: awayProb } = winProb(homeElo, awayElo)
    const date = i % 3 === 0 ? tomorrow : today
    const time = START_TIMES_UTC[i % START_TIMES_UTC.length]

    return {
      gameId: 2025020000 + i + 1,
      season: 20252026,
      gameDate: `${date}T${time}:00Z`,
      homeTeam: {
        abbrev: home,
        logo: teamLogo(home),
        eloBefore: homeElo,
        score: 0,
      },
      awayTeam: {
        abbrev: away,
        logo: teamLogo(away),
        eloBefore: awayElo,
        score: 0,
      },
      expectedResult: {
        homeTeam: homeProb,
        awayTeam: awayProb,
      },
    }
  })
}
