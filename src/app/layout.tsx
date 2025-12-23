import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { Footer } from '@/components/layout/Footer'

import { Providers } from './providers'
import { Nav } from '@/components/layout/Header.client'
import { GameBanner } from '@/components/GameBanner.server'
import { Suspense } from 'react'
import { Database } from '@/lib/db'
import { getCachedAccuracyStats } from '@/lib/cache'

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
            <div className="flex-1">
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

  const { percentage } = await getCachedAccuracyStats(20252026)

  return <Nav accuracyPercentage={percentage} />
}

function NavSkeleton() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 h-16 flex items-center px-4">
      <div className="animate-pulse flex items-center gap-4 w-full">
        <div className="h-8 bg-slate-700 rounded w-32"></div>
        <div className="ml-auto h-6 bg-slate-700 rounded w-24"></div>
      </div>
    </nav>
  )
}
