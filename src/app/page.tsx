// import { AllTeamsHistoryGraphWrapper } from '@/components/AllTeamsHistoryGraph.server'
import { ELOWrapper } from '@/components/ELO.server'
import { GamePredictionsWrapper } from '@/components/GamePredictions.server'
import { YesterdaysGameOutcomes } from '@/components/YesterdaysGameOutcomes/server'

export default async function Index() {
  return (
    <div className="lg:max-w-7/10 mx-auto px-4 sm:px-6 lg:px-8 lg:py-8 mb-8">
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ELO Rankings */}
        <div className="lg:col-span-1">
          <ELOWrapper />
        </div>

        {/* Game Predictions */}
        <div className="lg:col-span-3">
          <YesterdaysGameOutcomes />
          <GamePredictionsWrapper />
        </div>

        {/* Graph With all Teams
        <div className="lg:col-span-4">
          <AllTeamsHistoryGraphWrapper />
        </div> */}
      </div>
    </div>
  )
}
