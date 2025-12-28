import { PickemDashboard } from './PickemDashboard'

export default async function PickemPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Pick&apos;em</h1>
        <p className="text-gray-400">
          Make your predictions for upcoming NHL games
        </p>
      </div>

      <PickemDashboard />
    </div>
  )
}
