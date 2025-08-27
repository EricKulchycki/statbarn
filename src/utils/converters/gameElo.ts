import { GameELO, GameELOSerialized } from '@/models/gameElo'

export function deserializeGameELOByTeam(data: {
  [abbrev: string]: GameELOSerialized[]
}): {
  [abbrev: string]: GameELO[]
} {
  const result: { [abbrev: string]: GameELO[] } = {}
  for (const [abbrev, games] of Object.entries(data)) {
    result[abbrev] = games.map((game) => ({
      ...game,
      gameDate: new Date(game.gameDate),
    }))
  }
  return result
}

export function serializeGameELOByTeam(data: { [abbrev: string]: GameELO[] }): {
  [abbrev: string]: GameELOSerialized[]
} {
  const result: { [abbrev: string]: GameELOSerialized[] } = {}
  for (const [abbrev, games] of Object.entries(data)) {
    result[abbrev] = games.map((game) => ({
      ...game,
      gameDate: game.gameDate.toString(),
    }))
  }
  return result
}
