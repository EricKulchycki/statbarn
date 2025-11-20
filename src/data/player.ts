import {
  NHLSkaterStatsResponse,
  NHLGoalieStatsResponse,
  NHLSkaterLeader,
  NHLGoalieLeader,
  EnhancedSkaterStats,
  EnhancedGoalieStats,
  PlayerLandingResponse,
  GoalieLandingResponse,
} from '@/types/player'

const NHL_API_BASE = 'https://api-web.nhle.com/v1'

// Fetch individual player data
async function getPlayerLanding(
  playerId: number
): Promise<PlayerLandingResponse | null> {
  try {
    const res = await fetch(`${NHL_API_BASE}/player/${playerId}/landing`)
    if (!res.ok) {
      console.error(`Failed to fetch player ${playerId}: ${res.status}`)
      return null
    }
    return await res.json()
  } catch (error) {
    console.error(`Error fetching player landing for ${playerId}:`, error)
    return null
  }
}

export async function getTopScorers(
  limit: number = 10
): Promise<NHLSkaterLeader[]> {
  try {
    const res = await fetch(
      `${NHL_API_BASE}/skater-stats-leaders/current?categories=points&limit=${limit}`
    )

    if (!res.ok) {
      throw new Error(`NHL API returned ${res.status}: ${res.statusText}`)
    }

    const data: NHLSkaterStatsResponse = await res.json()
    return data.points || []
  } catch (error) {
    console.error('Error fetching top scorers from NHL API:', error)
    throw error
  }
}

export async function getTopGoalScorers(
  limit: number = 10
): Promise<NHLSkaterLeader[]> {
  try {
    const res = await fetch(
      `${NHL_API_BASE}/skater-stats-leaders/current?categories=goals&limit=${limit}`
    )

    if (!res.ok) {
      throw new Error(`NHL API returned ${res.status}: ${res.statusText}`)
    }

    const data: NHLSkaterStatsResponse = await res.json()
    return data.goals || []
  } catch (error) {
    console.error('Error fetching top goal scorers from NHL API:', error)
    throw error
  }
}

export async function getTopAssists(
  limit: number = 10
): Promise<NHLSkaterLeader[]> {
  try {
    const res = await fetch(
      `${NHL_API_BASE}/skater-stats-leaders/current?categories=assists&limit=${limit}`
    )

    if (!res.ok) {
      throw new Error(`NHL API returned ${res.status}: ${res.statusText}`)
    }

    const data: NHLSkaterStatsResponse = await res.json()
    return data.assists || []
  } catch (error) {
    console.error('Error fetching top assists from NHL API:', error)
    throw error
  }
}

export async function getTopGoalies(
  limit: number = 5
): Promise<NHLGoalieLeader[]> {
  try {
    const res = await fetch(
      `${NHL_API_BASE}/goalie-stats-leaders/current?categories=savePctg&limit=${limit}`
    )

    if (!res.ok) {
      throw new Error(`NHL API returned ${res.status}: ${res.statusText}`)
    }

    const data: NHLGoalieStatsResponse = await res.json()
    return data.savePctg || []
  } catch (error) {
    console.error('Error fetching top goalies from NHL API:', error)
    throw error
  }
}

export async function getTopGoaliesByWins(
  limit: number = 5
): Promise<NHLGoalieLeader[]> {
  try {
    const res = await fetch(
      `${NHL_API_BASE}/goalie-stats-leaders/current?categories=wins&limit=${limit}`
    )

    if (!res.ok) {
      throw new Error(`NHL API returned ${res.status}: ${res.statusText}`)
    }

    const data: NHLGoalieStatsResponse = await res.json()
    return data.wins || []
  } catch (error) {
    console.error('Error fetching top goalies by wins from NHL API:', error)
    throw error
  }
}

export async function getTopGoaliesByGAA(
  limit: number = 5
): Promise<NHLGoalieLeader[]> {
  try {
    const res = await fetch(
      `${NHL_API_BASE}/goalie-stats-leaders/current?categories=goalsAgainstAvg&limit=${limit}`
    )

    if (!res.ok) {
      throw new Error(`NHL API returned ${res.status}: ${res.statusText}`)
    }

    const data: NHLGoalieStatsResponse = await res.json()
    return data.goalsAgainstAvg || []
  } catch (error) {
    console.error('Error fetching top goalies by GAA from NHL API:', error)
    throw error
  }
}

// Enhanced function that fetches detailed player data from landing endpoint
export async function getEnhancedTopScorers(
  limit: number = 10
): Promise<EnhancedSkaterStats[]> {
  try {
    // First get the points leaders
    const res = await fetch(
      `${NHL_API_BASE}/skater-stats-leaders/current?categories=points&limit=${limit}`
    )
    if (!res.ok) {
      throw new Error(`NHL API returned ${res.status}: ${res.statusText}`)
    }

    const data: NHLSkaterStatsResponse = await res.json()
    const pointsLeaders: NHLSkaterLeader[] = data.points || []

    // Fetch detailed data for each player in parallel
    const playerDataPromises = pointsLeaders.map((leader) =>
      getPlayerLanding(leader.id)
    )
    const playerDataResults = await Promise.all(playerDataPromises)

    // Combine leader data with detailed stats
    const enhancedPlayers: EnhancedSkaterStats[] = []

    for (let i = 0; i < pointsLeaders.length; i++) {
      const leader = pointsLeaders[i]
      const playerData = playerDataResults[i]

      if (!playerData) {
        // If we couldn't fetch detailed data, use basic leader data
        enhancedPlayers.push({
          ...leader,
          points: leader.value,
        })
        continue
      }

      const stats = playerData.featuredStats.regularSeason.subSeason

      // Calculate derived stats
      const pointsPerGame =
        stats.gamesPlayed > 0 ? stats.points / stats.gamesPlayed : undefined
      const goalsPerGame =
        stats.gamesPlayed > 0 ? stats.goals / stats.gamesPlayed : undefined
      const assistsPerGame =
        stats.gamesPlayed > 0 ? stats.assists / stats.gamesPlayed : undefined
      const shootingPctg =
        stats.shots > 0 ? (stats.goals / stats.shots) * 100 : undefined

      enhancedPlayers.push({
        ...leader,
        points: stats.points,
        goals: stats.goals,
        assists: stats.assists,
        gamesPlayed: stats.gamesPlayed,
        powerPlayGoals: stats.powerPlayGoals,
        shots: stats.shots,
        plusMinus: stats.plusMinus,
        pointsPerGame,
        goalsPerGame,
        assistsPerGame,
        shootingPctg,
      })
    }

    return enhancedPlayers
  } catch (error) {
    console.error('Error fetching enhanced top scorers from NHL API:', error)
    throw error
  }
}

// Enhanced function for goalies with detailed data from landing endpoint
export async function getEnhancedTopGoalies(
  limit: number = 5
): Promise<EnhancedGoalieStats[]> {
  try {
    // First get the save % leaders
    const res = await fetch(
      `${NHL_API_BASE}/goalie-stats-leaders/current?categories=savePctg&limit=${limit}`
    )
    if (!res.ok) {
      throw new Error(`NHL API returned ${res.status}: ${res.statusText}`)
    }

    const data: NHLGoalieStatsResponse = await res.json()
    const savePctgLeaders: NHLGoalieLeader[] = data.savePctg || []

    // Fetch detailed data for each goalie in parallel
    const goalieDataPromises = savePctgLeaders.map((leader) =>
      getPlayerLanding(leader.id)
    )
    const goalieDataResults = await Promise.all(goalieDataPromises)

    // Combine leader data with detailed stats
    const enhancedGoalies: EnhancedGoalieStats[] = []

    for (let i = 0; i < savePctgLeaders.length; i++) {
      const leader = savePctgLeaders[i]
      const goalieData = goalieDataResults[i] as GoalieLandingResponse | null

      if (!goalieData || !goalieData.featuredStats?.regularSeason?.subSeason) {
        // If we couldn't fetch detailed data, use basic leader data
        enhancedGoalies.push({
          ...leader,
          savePctg: leader.value,
        })
        continue
      }

      const stats = goalieData.featuredStats.regularSeason.subSeason

      // Calculate derived stats
      const winPctg =
        stats.gamesPlayed > 0 ? stats.wins / stats.gamesPlayed : undefined
      const shutoutRate =
        stats.gamesPlayed > 0 ? stats.shutouts / stats.gamesPlayed : undefined

      enhancedGoalies.push({
        ...leader,
        savePctg: stats.savePctg,
        wins: stats.wins,
        goalsAgainstAvg: stats.goalsAgainstAvg,
        shutouts: stats.shutouts,
        gamesPlayed: stats.gamesPlayed,
        winPctg,
        shutoutRate,
      })
    }

    return enhancedGoalies
  } catch (error) {
    console.error('Error fetching enhanced top goalies from NHL API:', error)
    throw error
  }
}
