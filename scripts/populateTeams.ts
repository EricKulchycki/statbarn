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

  // Manual mapping for conference and division
  const conferenceDivisionMap: {
    [abbrev: string]: { conference: string; division: string }
  } = {
    ANA: { conference: 'western', division: 'pacific' },
    ARI: { conference: 'western', division: 'central' },
    BOS: { conference: 'eastern', division: 'atlantic' },
    BUF: { conference: 'eastern', division: 'atlantic' },
    CGY: { conference: 'western', division: 'pacific' },
    CAR: { conference: 'eastern', division: 'metropolitan' },
    CHI: { conference: 'western', division: 'central' },
    COL: { conference: 'western', division: 'central' },
    CBJ: { conference: 'eastern', division: 'metropolitan' },
    DAL: { conference: 'western', division: 'central' },
    DET: { conference: 'eastern', division: 'atlantic' },
    EDM: { conference: 'western', division: 'pacific' },
    FLA: { conference: 'eastern', division: 'atlantic' },
    LAK: { conference: 'western', division: 'pacific' },
    MIN: { conference: 'western', division: 'central' },
    MTL: { conference: 'eastern', division: 'atlantic' },
    NSH: { conference: 'western', division: 'central' },
    NJD: { conference: 'eastern', division: 'metropolitan' },
    NYI: { conference: 'eastern', division: 'metropolitan' },
    NYR: { conference: 'eastern', division: 'metropolitan' },
    OTT: { conference: 'eastern', division: 'atlantic' },
    PHI: { conference: 'eastern', division: 'metropolitan' },
    PIT: { conference: 'eastern', division: 'metropolitan' },
    SJS: { conference: 'western', division: 'pacific' },
    SEA: { conference: 'western', division: 'pacific' },
    STL: { conference: 'western', division: 'central' },
    TBL: { conference: 'eastern', division: 'atlantic' },
    TOR: { conference: 'eastern', division: 'atlantic' },
    VAN: { conference: 'western', division: 'pacific' },
    VGK: { conference: 'western', division: 'pacific' },
    WSH: { conference: 'eastern', division: 'metropolitan' },
    UTA: { conference: 'western', division: 'central' },
    WPG: { conference: 'western', division: 'central' },
  }

  // Insert into DB (upsert to avoid duplicates)
  for (const team of playedTeams) {
    try {
      const teamInfo = await fetchTeamInfo(team.id.toString())
      // You may need to adjust the structure depending on the API response
      const confDiv = conferenceDivisionMap[team.triCode]
      if (!confDiv) {
        console.warn(`No conference/division mapping for team: ${team.triCode}`)
        continue
      }
      await TeamModel.updateOne(
        {
          id: team.id,
        },
        {
          $set: {
            ...teamInfo,
            conference: confDiv.conference,
            division: confDiv.division,
          },
        },
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
