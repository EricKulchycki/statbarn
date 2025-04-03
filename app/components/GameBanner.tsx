import { DateTime } from 'luxon'
import { PropsWithChildren } from 'react'
import { NHLGame, NHLGameDay } from '~/types/game'

interface GameBannerProps {
  gamesThisWeek: NHLGameDay[]
}

export function GameBanner(props: GameBannerProps) {
  const { gamesThisWeek } = props

  return (
    <div className="p-2 bg-slate-900 flex w-full h-fit overflow-scroll">
      {gamesThisWeek.map((gw) => (
        <TodaysGames key={gw.date} games={gw.games} date={gw.date} />
      ))}
    </div>
  )
}

interface TodaysGamesProps {
  games: NHLGame[]
  date: string
}

export function TodaysGames(props: TodaysGamesProps) {
  return (
    <div className="flex min-w-max items-center">
      <GameDate date={props.date} />
      {props.games.map((g) => (
        <BannerGame key={g.id} game={g} />
      ))}
      <div className="border-solid border-r-2 border-slate-700" />
    </div>
  )
}

interface BannerGameProps {
  game: NHLGame
}

function BannerGame(props: BannerGameProps) {
  const { game } = props
  const homeScore = game.homeTeam.score
  const awayScore = game.awayTeam.score

  const startTime = DateTime.fromISO(game.startTimeUTC)
  const timezone = startTime.toFormat('ZZZZ')

  return (
    <div className="px-2 min-w-fit">
      <p className="text-xs text-slate-300">
        <b>
          {startTime.toLocaleString(DateTime.TIME_24_SIMPLE)} {timezone}
        </b>
      </p>
      <GameTeam>
        <img className="size-6" src={game.awayTeam.logo} alt="away team logo" />
        <TeamName isWinning={awayScore >= homeScore}>
          {game.awayTeam.abbrev}
        </TeamName>
        <Score>{game.awayTeam.score}</Score>
      </GameTeam>
      <GameTeam>
        <img className="size-6" src={game.homeTeam.logo} alt="home team logo" />
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
    <div className="text-slate-300 mr-2">
      <p>{ldate.toFormat('MMM')}</p>
      <p>{ldate.toFormat('dd')}</p>
    </div>
  )
}
