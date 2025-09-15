import mongoose from 'mongoose'
import { GameELOModel } from '../src/models/gameElo'
import { Database } from '../src/lib/db'
import { Team } from '../src/types/team'
import { TeamModel } from '../src/models/team'
import { getTeams } from '../src/data/teams'

async function fetchTeamInfo(teamId: string) {
  const url = `https://api.nhle.com/stats/rest/en/team/id/${teamId}`
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Failed to fetch team ${teamId}: ${response.statusText}`)
  const data = await response.json()
  return data
}

async function main() {
  const db = Database.getInstance()

  await db.connect()

  const lastSeason = 20242025

  // Find all teams that played last season (from home or away)
  const lastSeasonGames = await GameELOModel.find({ season: lastSeason })

  const homeTeams = lastSeasonGames.map((game) => game.homeTeam.abbrev)
  const awayTeams = lastSeasonGames.map((game) => game.awayTeam.abbrev)

  const allTeams = await getTeams()

  const playedTeamIds: string[] = Array.from(
    new Set([...homeTeams, ...awayTeams])
  )

  const playedTeams = allTeams.filter((team: Team) =>
    playedTeamIds.includes(team.triCode)
  )

  console.log({ played: playedTeams.length, all: allTeams.length })

  for (const team of playedTeams) {
    try {
      const teamInfo = await fetchTeamInfo(team.id)
      // You may need to adjust the structure depending on the API response
      await TeamModel.updateOne(
        {
          id: team.id,
          franchiseId: team.franchiseId,
          fullName: team.fullName,
          leagueId: team.leagueId,
          rawTricode: team.rawTricode,
          triCode: team.triCode,
          logo: team.logo,
        },
        { $set: teamInfo },
        { upsert: true }
      )
      console.log(`Upserted team: ${team.id}`)
    } catch (err) {
      console.error(`Error for team ${team.id}:`, err)
    }
  }

  await mongoose.disconnect()
  console.log('Done!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
