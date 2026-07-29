import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '../models/User'
import { UserRepository } from '../repositories/UserRepository'

export function useLeaderboard(clubId: string | null) {
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    setError(null)
    try {
      const allUsers = await UserRepository.getAll()
      const filtered = allUsers
        .filter((u) => u.status === 'active')
        .filter((u) => (clubId ? u.clubId === clubId : true))
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      setMembers(filtered)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [clubId])

  useEffect(() => {
    loadMembers()

    const channel = supabase
      .channel('leaderboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        loadMembers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadMembers])

  return { members, loading, error }
}