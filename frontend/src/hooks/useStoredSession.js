import { useMemo } from 'react'
import { loadStoredSession } from '../utils/session'

export function useStoredSession() {
  return useMemo(() => loadStoredSession(), [])
}
