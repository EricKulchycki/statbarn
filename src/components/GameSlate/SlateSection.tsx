import { cn } from '@heroui/react'
import { ReactNode, useState } from 'react'
import { SectionModel } from './presentation'

interface Props {
  section: SectionModel
  children: ReactNode
}

export function SlateSection({ section, children }: Props) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-slate-200">
          <span
            className={cn(
              'size-1.5 rounded-full',
              section.isLive ? 'bg-red-500' : 'bg-slate-500'
            )}
            aria-hidden
          />
          {section.title}
          <span className="font-semibold text-slate-500">
            {section.games.length}
          </span>
        </h2>
        {section.collapsible && (
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
          >
            {isOpen ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>
      {isOpen && children}
    </div>
  )
}
