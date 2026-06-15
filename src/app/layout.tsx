import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { Footer } from '@/components/layout/Footer'

import { Providers } from './providers'
import { Nav } from '@/components/layout/Header.client'
import { GameBanner } from '@/components/GameBanner.server'
import { Suspense } from 'react'
import { Database } from '@/lib/db'
import { SeasonAccuracyChip } from '@/components/layout/SeasonAccuracyChip.server'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Stat Barn',
  description: 'NHL Predictions and Stats',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Suspense fallback={<NavSkeleton />}>
              <NavWrapper />
            </Suspense>
            <div className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
              <Suspense fallback={<div className="h-24" />}>
                <GameBanner />
              </Suspense>
              {children}
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}

async function NavWrapper() {
  const db = Database.getInstance()
  await db.connect()

  return (
    <Nav
      desktopChip={<SeasonAccuracyChip className="hidden sm:inline-flex" />}
      mobileChip={<SeasonAccuracyChip compact />}
    />
  )
}

function NavSkeleton() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-28 animate-pulse rounded bg-slate-800" />
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden h-7 w-20 animate-pulse rounded-full bg-slate-800 sm:block" />
          <div className="size-8 animate-pulse rounded-full bg-slate-800" />
        </div>
      </div>
    </header>
  )
}
