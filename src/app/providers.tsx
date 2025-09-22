'use client'

import { useEffect } from 'react'
import { HeroUIProvider } from '@heroui/react'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const today = new Date()
    const localDate = today.toISOString().slice(0, 10)
    document.cookie = `localDate=${localDate}; path=/; SameSite=Lax`
  }, [])

  return <HeroUIProvider>{children}</HeroUIProvider>
}
