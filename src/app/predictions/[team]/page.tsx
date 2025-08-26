import Image from 'next/image'
import { getTeamByAbbrev } from '@/data/teams'
import { eloService } from '@/services/elo.service'
import { Database } from '@/lib/db'
import { GameELO } from '@/models/gameElo'

export default async function Team({
  params,
}: {
  params: Promise<{ team: string }>
}) {
  const db = Database.getInstance()
  await db.connect()

  const { team: teamAbbrev } = await params

  const team = await getTeamByAbbrev(teamAbbrev)

  const last10Games = await eloService.getLast10EloGames(teamAbbrev)

  const getOpponent = (gameElo: GameELO) => {
    if (gameElo.homeTeam.abbrev === teamAbbrev) {
      return gameElo.awayTeam
    } else {
      return gameElo.homeTeam
    }
  }

  const getSelf = (gameElo: GameELO) => {
    if (gameElo.homeTeam.abbrev === teamAbbrev) {
      return gameElo.homeTeam
    } else {
      return gameElo.awayTeam
    }
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-md m-8">
      <div>
        <div className="flex items-center">
          <Image
            width={100}
            height={100}
            src={team?.logo || '/placeholder-logo.png'}
            alt={team?.triCode || 'Team Logo'}
            className="h-20 w-20 mb-4"
          />
          <h1 className="text-3xl font-bold mb-6">
            {team?.fullName || teamAbbrev}
          </h1>
        </div>
        <div className="max-w-1/2 bg-slate-900 rounded-xl">
          <div className=" rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">{teamAbbrev} ELO History</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Opponent</th>
                  <th className="text-left py-2 px-4">Home/Away</th>
                  <th className="text-left py-2 px-4">Win/Loss</th>
                  <th className="text-left py-2 px-4">ELO After</th>
                </tr>
              </thead>
              <tbody>
                {last10Games.map((gameElo) => (
                  <tr key={gameElo.gameId}>
                    <td className="py-2 px-4">
                      {new Date(gameElo.gameDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4">{getOpponent(gameElo).abbrev}</td>
                    <td className="py-2 px-4">Home</td>
                    <td className="py-2 px-4">
                      {getSelf(gameElo).score > getOpponent(gameElo).score
                        ? 'Win'
                        : 'Loss'}
                    </td>
                    <td className="py-2 px-4">
                      {getSelf(gameElo).eloAfter.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
