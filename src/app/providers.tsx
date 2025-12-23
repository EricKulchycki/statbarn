'use client'

import { useEffect } from 'react'
import { HeroUIProvider } from '@heroui/react'
import { AuthProvider } from '@/contexts/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    document.cookie = `localTimezone=${timezone}; path=/; SameSite=Lax`
  }, [])

  return (
    <HeroUIProvider>
      <AuthProvider>{children}</AuthProvider>
    </HeroUIProvider>
  )
}
