import { PropsWithChildren } from 'react'
import { NHLGame } from '~/types/game'

interface Props {
  games: NHLGame[]
}

export function TodaysGames(props: Props) {
  return (
    <div className="flex min-w-max">
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
  return (
    <div className="px-2 min-w-fit">
      <GameTeam>
        <img className="size-6" src={game.awayTeam.logo} alt="away team logo" />
        <TeamName>{game.awayTeam.abbrev}</TeamName>
        <Score>{game.awayTeam.score}</Score>
      </GameTeam>
      <GameTeam>
        <img className="size-6" src={game.homeTeam.logo} alt="home team logo" />
        <TeamName>{game.homeTeam.abbrev}</TeamName>
        <Score>{game.homeTeam.score}</Score>
      </GameTeam>
    </div>
  )
}

function GameTeam(props: PropsWithChildren) {
  return <div className="flex justify-between">{props.children}</div>
}

function TeamName(props: PropsWithChildren) {
  return <div className="text-slate-400 px-2">{props.children}</div>
}

function Score(props: PropsWithChildren) {
  return <b className="ml-auto">{props.children}</b>
}
