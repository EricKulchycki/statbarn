import { DateTime } from "luxon";
import { NHLGameDay } from "~/types/game";

export interface GetTodaysGamesResponse {
    gameWeek: NHLGameDay[];
    numberOfGames: number;

}

export async function getTodaysGames() {
    const dt = DateTime.now();
    return fetch(`https://api-web.nhle.com/v1/schedule/${dt.toISODate()}`)
}