import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Arm } from '../models/Arm'
import type { Match } from '../models/Match'
import { MatchRepository } from '../repositories/MatchRepository'
import { cancelMatch, confirmMatch, reportMatch } from '../services/MatchService'

export function useMatches(currentUserId: string) {
  const [pendingMatches, setPendingMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setError(null)
    try {
      const myMatches = await MatchRepository.getPendingForPlayer(currentUserId)
      setPendingMatches(myMatches.filter((m) => m.reportedBy !== currentUserId))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    loadData()

    const channel = supabase
      .channel('matches-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadData])

  const report = useCallback(
    async (opponentId: string, winnerId: string, arm: Arm) => {
      setError(null)
      try {
        await reportMatch(currentUserId, opponentId, winnerId, arm, currentUserId)
      } catch (err) {
        setError((err as Error).message)
        throw err
      }
    },
    [currentUserId]
  )

  const confirm = useCallback(
    async (matchId: string) => {
      setError(null)
      try {
        await confirmMatch(matchId, currentUserId)
      } catch (err) {
        setError((err as Error).message)
        throw err
      }
    },
    [currentUserId]
  )

  const cancel = useCallback(async (matchId: string) => {
    setError(null)
    try {
      await cancelMatch(matchId)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }, [])

  return { pendingMatches, loading, error, report, confirm, cancel, refresh: loadData }
}