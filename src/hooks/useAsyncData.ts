import { useState, useEffect, useCallback } from 'react'
import type { AppError } from '@/types/errors'

interface UseAsyncDataState<T> {
  data: T | null
  loading: boolean
  error: AppError | null
}

interface UseAsyncDataReturn<T> extends UseAsyncDataState<T> {
  execute: (...args: any[]) => Promise<void>
  reset: () => void
  refetch: () => Promise<void>
}

export function useAsyncData<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = false
): UseAsyncDataReturn<T> {
  const [state, setState] = useState<UseAsyncDataState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        const result = await asyncFunction(...args)
        setState(prev => ({ ...prev, data: result, loading: false }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error as AppError,
          loading: false,
        }))
      }
    },
    [asyncFunction]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    })
  }, [])

  const refetch = useCallback(async () => {
    if (state.data !== null) {
      await execute()
    }
  }, [execute, state.data])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return {
    ...state,
    execute,
    reset,
    refetch,
  }
}

// Specialized hook for data that needs to be fetched once
export function useData<T>(
  asyncFunction: () => Promise<T>
): UseAsyncDataReturn<T> {
  return useAsyncData(asyncFunction, true)
}
