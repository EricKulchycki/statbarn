'use client'

import { DaySlate } from '@/lib/daySlate'
import { NHLGame } from '@/types/game'
import { GamePrediction } from '@/types/gamePrediction'
import { Team } from '@/types/team'
import { MatchupModal } from '../MatchupModal'
import { GameCard } from './GameCard'
import { buildSections } from './presentation'
import { SlateHeader } from './SlateHeader'
import { SlateSection } from './SlateSection'
import { useMatchupModal } from './useMatchupModal'

interface Props {
  slate: DaySlate
  gamesById: Map<number, NHLGame>
  predictionsById: Map<number, GamePrediction>
  teams: Team[]
}

export function GameSlate({ slate, gamesById, predictionsById, teams }: Props) {
  const { openMatchup, modalProps } = useMatchupModal(
    gamesById,
    predictionsById
  )
  const sections = buildSections(slate)

  return (
    <section className="my-4 space-y-8">
      <SlateHeader slate={slate} />

      {sections.length === 0 && (
        <p className="text-sm text-slate-400">No games scheduled.</p>
      )}

      {sections.map((section) => (
        <SlateSection key={section.key} section={section}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {section.games.map((game) => (
              <GameCard key={game.id} game={game} onSelect={openMatchup} />
            ))}
          </div>
        </SlateSection>
      ))}

      <MatchupModal {...modalProps} teams={teams} />
    </section>
  )
}
