'use client'

import { DateTime } from 'luxon'
import { PropsWithChildren } from 'react'
import { NHLGame, NHLGameDay } from '@/types/game'
import Image from 'next/image'
import { SerializedPrediction } from '@/utils/converters/prediction'
import { deserializePrediction } from '@/utils/converters/prediction'
import { getPredictedWinnerFromPrediction } from '@/utils/prediction'
import { Prediction } from '@/models/prediction'

interface GameBannerClientProps {
  gamesThisWeek: NHLGameDay[]
  predictions: SerializedPrediction[]
}

export function GameBannerClient({
  gamesThisWeek,
  predictions,
}: GameBannerClientProps) {
  // Create a map of gameId -> prediction
  const predictionsMap = new Map(
    predictions.map((p) => {
      const deserialized = deserializePrediction(p)
      return [deserialized.gameId, deserialized]
    })
  )

  return (
    <div className="p-2 flex w-full h-fit overflow-x-scroll overflow-y-hidden">
      {gamesThisWeek
        .filter((gw) => gw.numberOfGames > 0)
        .map((gw) => (
          <TodaysGames
            key={gw.date}
            games={gw.games}
            date={gw.date}
            predictionsMap={predictionsMap}
          />
        ))}
    </div>
  )
}

interface TodaysGamesProps {
  games: NHLGame[]
  date: string
  predictionsMap: Map<number, Prediction>
}

function TodaysGames(props: TodaysGamesProps) {
  return (
    <div className="flex min-w-max items-center">
      <GameDate date={props.date} />
      {props.games.map((g) => (
        <BannerGame
          key={g.id}
          game={g}
          prediction={props.predictionsMap.get(g.id)}
        />
      ))}
      <div className="border-solid border-r-2 border-slate-700" />
    </div>
  )
}

interface BannerGameProps {
  game: NHLGame
  prediction?: Prediction
}

function BannerGame(props: BannerGameProps) {
  const { game, prediction } = props
  const homeScore = game.homeTeam.score
  const awayScore = game.awayTeam.score

  const startTime = DateTime.fromISO(game.startTimeUTC).setZone(
    game.venueTimezone
  )

  // Determine border color based on prediction correctness
  let borderClass = ''
  if (prediction && game.gameState !== 'FUT') {
    const predictedWinner = getPredictedWinnerFromPrediction(prediction)
    let actualWinner = null

    if (homeScore !== awayScore) {
      actualWinner =
        homeScore > awayScore ? prediction.homeTeam : prediction.awayTeam
    }

    if (actualWinner === null) {
      // Game is tied
      borderClass = 'border-b-1 border-yellow-500'
    } else if (actualWinner === predictedWinner) {
      borderClass = 'border-b-1 border-green-500'
    } else {
      borderClass = 'border-b-1 border-red-500'
    }
  }

  return (
    <div className={`px-2 pb-2 w-fit ${borderClass}`}>
      <p className="text-xs text-slate-300">
        <b>{startTime.toLocaleString(DateTime.TIME_SIMPLE)}</b>
      </p>
      <GameTeam>
        <Image
          width={24}
          height={24}
          className="size-6"
          src={game.awayTeam.logo}
          alt="away team logo"
        />
        <TeamName isWinning={awayScore >= homeScore}>
          {game.awayTeam.abbrev}
        </TeamName>
        <Score>{game.awayTeam.score}</Score>
      </GameTeam>
      <GameTeam>
        <Image
          width={24}
          height={24}
          className="size-6"
          src={game.homeTeam.logo}
          alt="home team logo"
        />
        <TeamName isWinning={awayScore <= homeScore}>
          {game.homeTeam.abbrev}
        </TeamName>
        <Score>{game.homeTeam.score}</Score>
      </GameTeam>
    </div>
  )
}

function GameTeam(props: PropsWithChildren) {
  return <div className="flex justify-between">{props.children}</div>
}

function TeamName(props: PropsWithChildren<{ isWinning: boolean }>) {
  const textColor = props.isWinning ? 'text-slate-300' : 'text-slate-400'
  return <div className={`${textColor} px-2`}>{props.children}</div>
}

function Score(props: PropsWithChildren) {
  return (
    <b className="ml-auto text-slate-50 dark:text-slate-300">
      {props.children}
    </b>
  )
}

interface GameDateProps {
  date: string
}

function GameDate(props: GameDateProps) {
  const { date } = props
  const ldate = DateTime.fromISO(date)

  return (
    <div className="text-slate-300 mx-4 text-center font-bold">
      <p>{ldate.toFormat('MMM')}</p>
      <p>{ldate.toFormat('dd')}</p>
    </div>
  )
}
