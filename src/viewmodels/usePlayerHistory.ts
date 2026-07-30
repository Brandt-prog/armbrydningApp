import { useCallback, useEffect, useState } from 'react'
import type { SupermatchHistoryEntry, TournamentHistoryEntry } from '../services/PlayerHistoryService'
import { getSupermatchHistory, getTournamentHistory } from '../services/PlayerHistoryService'

export function usePlayerHistory(userId: string) {
  const [tournaments, setTournaments] = useState<TournamentHistoryEntry[]>([])
  const [supermatches, setSupermatches] = useState<SupermatchHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [t, s] = await Promise.all([getTournamentHistory(userId), getSupermatchHistory(userId)])
      setTournaments(t)
      setSupermatches(s)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  return { tournaments, supermatches, loading, error, refresh: load }
}