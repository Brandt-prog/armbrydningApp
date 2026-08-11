import { useCallback, useEffect, useState } from 'react'
import type { ClubMatchHistoryEntry, SupermatchHistoryEntry, TournamentHistoryEntry } from '../services/PlayerHistoryService'
import { getClubMatchHistory, getSupermatchHistory, getTournamentHistory } from '../services/PlayerHistoryService'

export function usePlayerHistory(userId: string) {
  const [tournaments, setTournaments] = useState<TournamentHistoryEntry[]>([])
  const [supermatches, setSupermatches] = useState<SupermatchHistoryEntry[]>([])
  const [clubMatches, setClubMatches] = useState<ClubMatchHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [t, s, c] = await Promise.all([
        getTournamentHistory(userId),
        getSupermatchHistory(userId),
        getClubMatchHistory(userId),
      ])
      setTournaments(t)
      setSupermatches(s)
      setClubMatches(c)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  return { tournaments, supermatches, clubMatches, loading, error, refresh: load }
}