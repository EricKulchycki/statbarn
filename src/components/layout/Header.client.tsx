'use client'

import { UserButton } from '@/components/auth/UserButton'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@heroui/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AccuracyBadge } from './AccuracyBadge'
import { isNavItemActive, NAV_ITEMS } from './navConfig'

interface Props {
  accuracyPercentage: number
}

export function Nav({ accuracyPercentage }: Props) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <>
        <MobileTopBar percentage={accuracyPercentage} />
        <MobileBottomNav />
      </>
    )
  }

  return <DesktopHeader percentage={accuracyPercentage} />
}

function DesktopHeader({ percentage }: { percentage: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex  transition-opacity hover:opacity-90">
          <Image
            src="/statbarn_logo.png"
            alt="Stat Barn"
            width={120}
            height={90}
            className="h-26 w-auto"
            priority
          />
        </Link>

        <div className="hidden min-w-0 flex-1 md:flex">
          <DesktopNavLinks />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <AccuracyBadge
            percentage={percentage}
            className="hidden sm:inline-flex"
          />
          <UserButton />
        </div>
      </div>
    </header>
  )
}

function DesktopNavLinks() {
  const pathname = usePathname()

  return (
    <nav
      className="flex items-center gap-0.5 rounded-full border border-slate-800 bg-slate-900/60 p-1"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item.href, item.exact)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            )}
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function MobileTopBar({ percentage }: { percentage: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md md:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/statbarn_logo.png"
            alt="Stat Barn"
            width={110}
            height={32}
            className="h-7 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-2">
          <AccuracyBadge percentage={percentage} compact />
          <UserButton />
        </div>
      </div>
    </header>
  )
}

function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href, item.exact)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 transition-colors',
                active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="truncate text-[10px] font-medium">
                {item.shortLabel ?? item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
