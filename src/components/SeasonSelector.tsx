'use client'

import { splitAtIndex } from '@/utils'
import { DateTime } from 'luxon'

export function SeasonSelector({ currentSeason }: { currentSeason: number }) {
  const currentYear = DateTime.now().plus({ year: 1 }).year
  const currentMonth = DateTime.now().month
  const seasonStartYear = currentMonth >= 10 ? currentYear : currentYear - 1 // Season starts in October

  const seasons = []
  for (let year = 2015; year <= seasonStartYear; year++) {
    seasons.push(`${year}/${(year + 1).toString()}`)
  }

  console.log(
    'Current Season:',
    currentSeason?.toString().split('', 4).join('/')
  )

  return (
    <form method="GET" className="mb-4">
      <select
        name="season"
        id="season"
        className="bg-slate-800 text-slate-200 p-2 rounded-md"
        defaultValue={
          splitAtIndex(currentSeason?.toString(), 4).join('/') ??
          `${seasonStartYear}/${(seasonStartYear + 1).toString()}`
        }
        onChange={(e) => {
          const selectedSeason = e.target.value.split('/').join('')
          window.location.href = `/upsets?season=${selectedSeason}`
        }}
      >
        {seasons
          .sort((a, b) => (a > b ? -1 : 1))
          .map((season) => (
            <option key={season} value={season}>
              {season}
            </option>
          ))}
      </select>
    </form>
  )
}
