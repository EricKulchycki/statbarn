'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  alwaysOpenOnDesktop?: boolean
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  alwaysOpenOnDesktop = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="mb-6">
      {/* Mobile: Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800/70 transition-colors ${
          alwaysOpenOnDesktop ? 'lg:hidden' : ''
        }`}
        aria-expanded={isOpen}
      >
        <h2 className="text-xl font-bold text-blue-400">{title}</h2>
        {isOpen ? (
          <ChevronUpIcon className="size-6 text-gray-400" />
        ) : (
          <ChevronDownIcon className="size-6 text-gray-400" />
        )}
      </button>

      {/* Desktop: Always show title if alwaysOpenOnDesktop */}
      {alwaysOpenOnDesktop && (
        <div className="hidden lg:block mb-4">
          <h2 className="text-xl font-bold text-blue-400">{title}</h2>
        </div>
      )}

      {/* Content */}
      <div
        className={`${
          alwaysOpenOnDesktop
            ? `${isOpen ? 'block' : 'hidden'} lg:block`
            : isOpen
              ? 'block'
              : 'hidden'
        } mt-4`}
      >
        {children}
      </div>
    </div>
  )
}
