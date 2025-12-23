'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserByFirebaseUid } from '@/actions/user'

export interface UserData {
  firebaseUid: string
  email: string
  displayName?: string
  photoURL?: string
  favoriteTeams?: string[]
  createdAt: Date
  updatedAt: Date
}

export function useUserData() {
  const { user, loading: authLoading } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setUserData(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await getUserByFirebaseUid(user.uid)

        if (result.success && result.user) {
          setUserData(result.user as UserData)
          setError(null)
        } else {
          setError(result.error || 'Failed to fetch user data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchUserData()
    }
  }, [user, authLoading])

  return { userData, loading: loading || authLoading, error }
}
