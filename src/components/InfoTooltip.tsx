'use client'

import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { Tooltip } from '@heroui/react'

export function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip
      content={
        <p className="max-w-56 text-xs leading-relaxed text-slate-300">
          {content}
        </p>
      }
      placement="bottom-start"
      classNames={{ content: 'bg-slate-800 border border-slate-700 p-3' }}
    >
      <button
        className="text-slate-500 hover:text-slate-300 transition-colors"
        aria-label="More info"
      >
        <InformationCircleIcon className="size-4" />
      </button>
    </Tooltip>
  )
}
