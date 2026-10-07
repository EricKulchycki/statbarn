import { cn } from '@heroui/react'
import { MeetingRowModel, MeetingsModel } from './presentation'

export function RecentMeetings({
  meetings,
}: {
  meetings: MeetingsModel | null
}) {
  if (!meetings) {
    return (
      <section>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-200">
          Recent meetings
        </h3>
        <p className="text-sm text-slate-400">No recent meetings found.</p>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-5 flex items-baseline justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          Last {meetings.rows.length} meetings
        </h3>
        <p className="text-xl font-extrabold text-slate-100">
          {meetings.recordLabel}
        </p>
      </div>

      <ol className="flex gap-1.5" aria-label="Winners, oldest to most recent">
        {meetings.strip.map((chip) => (
          <li
            key={chip.gameId}
            className="flex-1 rounded-md py-1.5 text-center text-xs font-bold text-white"
            style={{ backgroundColor: chip.color }}
          >
            {chip.winner}
          </li>
        ))}
      </ol>
      <div className="mt-1.5 flex justify-between text-xs text-slate-400">
        <span>{meetings.oldestLabel}</span>
        <span>Most recent</span>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-left text-xs text-slate-400">
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Score</th>
            <th className="pb-3 text-right font-medium">Margin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {meetings.rows.map((row) => (
            <MeetingRow key={row.gameId} row={row} />
          ))}
        </tbody>
      </table>
    </section>
  )
}

function MeetingRow({ row }: { row: MeetingRowModel }) {
  return (
    <tr>
      <td className="py-4 text-slate-400">{row.dateLabel}</td>
      <td className="py-4">
        <ScoreSide side={row.away} />
        <span className="px-2 text-xs text-slate-500">@</span>
        <ScoreSide side={row.home} />
      </td>
      <td className="py-4 text-right">
        {row.margin ? (
          <span className="inline-flex items-center gap-2 font-semibold text-slate-200">
            <span
              className="size-2 rounded-sm"
              style={{ backgroundColor: row.margin.color }}
              aria-hidden
            />
            {row.margin.winner} {row.margin.text}
          </span>
        ) : (
          <span className="text-slate-400">Tie</span>
        )}
      </td>
    </tr>
  )
}

function ScoreSide({ side }: { side: MeetingRowModel['away'] }) {
  return (
    <span
      className={cn(
        'font-bold tabular-nums',
        side.isWinner ? 'text-slate-100' : 'text-slate-500'
      )}
    >
      {side.abbrev} {side.score}
    </span>
  )
}
