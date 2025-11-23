import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { Footer } from '@/components/layout/Footer'

import { Providers } from './providers'
import { Nav } from '@/components/layout/Header.client'
import { GameBanner } from '@/components/GameBanner'
import { Database } from '@/lib/db'
import { eloService } from '@/services/elo.service'

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const db = Database.getInstance()
  await db.connect()

  const totalGames = await eloService.countSeasonsGames(20252026)
  const correctPredictions =
    await eloService.countSeasonsCorrectPredictions(20252026)

  const percentage =
    totalGames > 0 ? (correctPredictions / totalGames) * 100 : 0

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Nav accuracyPercentage={percentage} />
            <div className="flex-1">
              <GameBanner />
              {children}
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
