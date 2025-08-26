import React, { useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, resolvedTheme } = useTheme()

  // Ensure theme is applied on mount and hydration
  useEffect(() => {
    const root = document.documentElement

    // Remove any existing theme classes
    root.classList.remove('light', 'dark')

    // Apply the resolved theme
    if (resolvedTheme) {
      root.classList.add(resolvedTheme)
    }
  }, [resolvedTheme])

  // Prevent flash of unstyled content
  useEffect(() => {
    // Add a class to prevent FOUC
    document.documentElement.classList.add('theme-loaded')
  }, [])

  return <>{children}</>
}

// Client-only theme provider to prevent SSR issues
export function ClientThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <ThemeProvider>{children}</ThemeProvider>
}
