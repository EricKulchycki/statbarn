'use client'

import { useLiveGames } from '@/hooks/useLiveGames'
import { applyLiveGame } from '@/lib/liveGames'
import { NHLGame, NHLGameDay } from '@/types/game'
import {
  GamePrediction,
  GamePredictionSerialized,
  deserializeGamePrediction,
} from '@/types/gamePrediction'
import { DateTime } from 'luxon'
import Image from 'next/image'
import { StartTime } from './GameSlate/StartTime'
import { PropsWithChildren } from 'react'

interface GameBannerClientProps {
  gamesThisWeek: NHLGameDay[]
  predictions: GamePredictionSerialized[]
}

export function GameBannerClient({
  gamesThisWeek,
  predictions,
}: GameBannerClientProps) {
  const live = useLiveGames(
    gamesThisWeek.flatMap((day) =>
      day.games.map((g) => ({
        id: g.id,
        startTimeUTC: g.startTimeUTC,
        gameState: g.gameState,
      }))
    )
  )

  const predictionsMap = new Map(
    predictions.map((p) => {
      const d = deserializeGamePrediction(p)
      return [d.gameId, d]
    })
  )

  return (
    <div className="p-2 flex w-full h-fit overflow-x-scroll overflow-y-hidden">
      {gamesThisWeek
        .filter((gw) => gw.numberOfGames > 0)
        .map((gw) => (
          <TodaysGames
            key={gw.date}
            games={gw.games.map((g) => applyLiveGame(g, live.get(g.id)))}
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
  predictionsMap: Map<number, GamePrediction>
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
  prediction?: GamePrediction
}

function BannerGame({ game, prediction }: BannerGameProps) {
  const homeScore = game.homeTeam.score
  const awayScore = game.awayTeam.score

  let borderClass = ''
  if (prediction && game.gameState !== 'FUT') {
    const { predictedWinner } = prediction
    const actualWinner =
      homeScore !== awayScore
        ? homeScore > awayScore
          ? prediction.homeTeam
          : prediction.awayTeam
        : null

    if (actualWinner === null) {
      borderClass = 'border-b-1 border-yellow-500'
    } else if (actualWinner === predictedWinner) {
      borderClass = 'border-b-1 border-green-500'
    } else {
      borderClass = 'border-b-1 border-red-500'
    }
  }

  return (
    <div className={`px-2 pb-2 w-fit ${borderClass}`}>
      <p className="text-xs">
        <StartTime startTimeUTC={game.startTimeUTC} className="font-bold" />
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
  return (
    <div
      className={`${props.isWinning ? 'text-slate-300' : 'text-slate-400'} px-2`}
    >
      {props.children}
    </div>
  )
}

function Score(props: PropsWithChildren) {
  return (
    <b className="ml-auto text-slate-50 dark:text-slate-300">
      {props.children}
    </b>
  )
}

function GameDate({ date }: { date: string }) {
  const ldate = DateTime.fromISO(date)
  return (
    <div className="text-slate-300 mx-4 text-center font-bold">
      <p>{ldate.toFormat('MMM')}</p>
      <p>{ldate.toFormat('dd')}</p>
    </div>
  )
}
