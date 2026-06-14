import mongoose from 'mongoose'
import { Database } from '../src/lib/db'
import { TeamModel } from '../src/models/team'
import { Conference, Division } from '../src/types/team'

interface NHLTeamRecord {
  id: number
  franchiseId: number
  fullName: string
  leagueId: number
  rawTricode: string
  triCode: string
}

const conferenceDivisionMap: Record<
  string,
  { conference: Conference; division: Division }
> = {
  ANA: { conference: Conference.WESTERN, division: Division.PACIFIC },
  BOS: { conference: Conference.EASTERN, division: Division.ATLANTIC },
  BUF: { conference: Conference.EASTERN, division: Division.ATLANTIC },
  CGY: { conference: Conference.WESTERN, division: Division.PACIFIC },
  CAR: { conference: Conference.EASTERN, division: Division.METROPOLITAN },
  CHI: { conference: Conference.WESTERN, division: Division.CENTRAL },
  COL: { conference: Conference.WESTERN, division: Division.CENTRAL },
  CBJ: { conference: Conference.EASTERN, division: Division.METROPOLITAN },
  DAL: { conference: Conference.WESTERN, division: Division.CENTRAL },
  DET: { conference: Conference.EASTERN, division: Division.ATLANTIC },
  EDM: { conference: Conference.WESTERN, division: Division.PACIFIC },
  FLA: { conference: Conference.EASTERN, division: Division.ATLANTIC },
  LAK: { conference: Conference.WESTERN, division: Division.PACIFIC },
  MIN: { conference: Conference.WESTERN, division: Division.CENTRAL },
  MTL: { conference: Conference.EASTERN, division: Division.ATLANTIC },
  NSH: { conference: Conference.WESTERN, division: Division.CENTRAL },
  NJD: { conference: Conference.EASTERN, division: Division.METROPOLITAN },
  NYI: { conference: Conference.EASTERN, division: Division.METROPOLITAN },
  NYR: { conference: Conference.EASTERN, division: Division.METROPOLITAN },
  OTT: { conference: Conference.EASTERN, division: Division.ATLANTIC },
  PHI: { conference: Conference.EASTERN, division: Division.METROPOLITAN },
  PIT: { conference: Conference.EASTERN, division: Division.METROPOLITAN },
  SJS: { conference: Conference.WESTERN, division: Division.PACIFIC },
  SEA: { conference: Conference.WESTERN, division: Division.PACIFIC },
  STL: { conference: Conference.WESTERN, division: Division.CENTRAL },
  TBL: { conference: Conference.EASTERN, division: Division.ATLANTIC },
  TOR: { conference: Conference.EASTERN, division: Division.ATLANTIC },
  UTA: { conference: Conference.WESTERN, division: Division.CENTRAL },
  VAN: { conference: Conference.WESTERN, division: Division.PACIFIC },
  VGK: { conference: Conference.WESTERN, division: Division.PACIFIC },
  WSH: { conference: Conference.EASTERN, division: Division.METROPOLITAN },
  WPG: { conference: Conference.WESTERN, division: Division.CENTRAL },
}

async function fetchAllNHLTeams(): Promise<NHLTeamRecord[]> {
  const response = await fetch('https://api.nhle.com/stats/rest/en/team')
  if (!response.ok)
    throw new Error(`Failed to fetch teams: ${response.statusText}`)
  const data = await response.json()
  return data.data as NHLTeamRecord[]
}

async function main() {
  const db = Database.getInstance()
  await db.connect()

  const allTeams = await fetchAllNHLTeams()
  // Filter to current teams and deduplicate by triCode, keeping the highest id
  // (the NHL API returns historical entries; rebrands get new ids)
  const byTriCode = new Map<string, NHLTeamRecord>()
  for (const team of allTeams) {
    if (!(team.triCode in conferenceDivisionMap)) continue
    const existing = byTriCode.get(team.triCode)
    if (!existing || team.id > existing.id) byTriCode.set(team.triCode, team)
  }
  const activeTeams = Array.from(byTriCode.values())

  console.log(`Seeding ${activeTeams.length} teams...`)

  for (const team of activeTeams) {
    const confDiv = conferenceDivisionMap[team.triCode]
    const logo = `https://assets.nhle.com/logos/nhl/svg/${team.triCode}_light.svg`

    await TeamModel.updateOne(
      { id: team.id },
      {
        $set: {
          id: team.id,
          franchiseId: team.franchiseId,
          fullName: team.fullName,
          leagueId: team.leagueId,
          rawTricode: team.rawTricode,
          triCode: team.triCode,
          conference: confDiv.conference,
          division: confDiv.division,
          logo,
        },
        $setOnInsert: {
          eloResets: [],
          seasons: [],
        },
      },
      { upsert: true }
    )
    console.log(`Upserted: ${team.triCode} — ${team.fullName}`)
  }

  await mongoose.disconnect()
  console.log('Done!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
