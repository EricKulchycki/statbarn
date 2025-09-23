'use client'

import { useEffect } from 'react'
import { HeroUIProvider } from '@heroui/react'
import { DateTime } from 'luxon'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const today = DateTime.now()
    document.cookie = `localDate=${today.toISODate()}; path=/; SameSite=Lax`
  }, [])

  return <HeroUIProvider>{children}</HeroUIProvider>
}
