import { PropsWithChildren } from "react";
import { NHLGame } from "~/types/game"

interface Props {
    games: NHLGame[]
}

export function TodaysGames(props: Props) {
    return <div className="py-2 flex w-full h-fit bg-slate-900">
        {props.games.map(g => <BannerGame key={g.id} game={g} />)}
        <div className="border-solid border-r-2" />
    </div>
}

interface BannerGameProps {
    game: NHLGame;
}

function BannerGame(props: BannerGameProps) {
    const { game } = props;
    return (
        <div className="px-2">
            <div className="flex justify-between">
                <TeamName>{game.awayTeam.abbrev}</TeamName>
                <b>{game.awayTeam.score}</b>
            </div>
            <div className="flex justify-between">
                <TeamName>{game.homeTeam.abbrev}</TeamName>
                <b>{game.homeTeam.score}</b>
            </div>
        </div>
    )
}

function TeamName(props: PropsWithChildren) {
    return <p className="text-slate-400 pr-2">{props.children}</p>
}

