import { fetchGamesForTeam } from '~/data/team-games.fetch'
import { Database } from '../lib/db'
import { getTeams } from '~/data/teams'
import { NHLGame } from '~/types/game'
import { calculateSeasonELO, createPrediction, ELOResults } from 'lib/elo'
import { SeasonELOModel } from 'models/elo'
import { getStartOfDay } from 'utils/currentSeason'
import { PredictionModel } from 'models/prediction'
;(async () => {
  const db = Database.getInstance()

  try {
    // Connect to the database
    await db.connect()

    const teams = await getTeams()

    const seasonsPromises = teams.map(async (team) => {
      const seasonGames = await fetchGamesForTeam(team, '20242025')
      return seasonGames
    })

    // seasons contains the seasons games for each team as an array up to the current date
    const seasons = await Promise.all(seasonsPromises)

    const allGamesForSeason: NHLGame[] = []
    seasons.forEach((games) => {
      games.forEach((game) => {
        if (
          allGamesForSeason.find((g) => g.id === game.id) ||
          game.gameType !== 2
        ) {
          return
        }
        allGamesForSeason.push(game)
      })
    })

    const lastSeasonELOs = await SeasonELOModel.find({
      season: {
        startYear: 2023,
        endYear: 2024,
      },
    }).exec()

    allGamesForSeason.forEach(async (game) => {
      console.log(game.startTimeUTC)
      const lastSeasonElos = await calculateSeasonELO(
        '20242025',
        teams,
        lastSeasonELOs,
        getStartOfDay(new Date(game.startTimeUTC))
      )

      const prediction = createPrediction(
        game,
        lastSeasonElos.map((e) => ({
          [e.abbrev]: e.elo,
        })) as unknown as ELOResults,
        'v1'
      )

      const predictionModel = new PredictionModel(prediction)
      await predictionModel.save()
    })

    console.log(allGamesForSeason.length)
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    console.log('Seed data inserted successfully.')
    // Disconnect from the database
    db.disconnect()
  }
})()
