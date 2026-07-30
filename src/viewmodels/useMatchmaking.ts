import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '../models/User'
import { UserRepository } from '../repositories/UserRepository'

export function useMatchmaking(currentUser: User) {
  const [allMembers, setAllMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingRange, setRatingRange] = useState(100)
  const [sameWeightClassOnly, setSameWeightClassOnly] = useState(false)

  const load = useCallback(async () => {
    try {
      const all = await UserRepository.getAll()
      setAllMembers(all.filter((u) => u.status === 'active' && u.id !== currentUser.id))
    } finally {
      setLoading(false)
    }
  }, [currentUser.id])

  useEffect(() => {
    load()

    const channel = supabase
      .channel('matchmaking-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        load()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [load])

  const candidates = useMemo(() => {
    const myRating = currentUser.rating ?? 1200

    return allMembers
      .filter((u) => Math.abs((u.rating ?? 1200) - myRating) <= ratingRange)
      .filter((u) => {
        if (!sameWeightClassOnly) return true
        if (!currentUser.weight || !u.weight) return false
        return Math.abs(u.weight - currentUser.weight) <= 5
      })
      .sort((a, b) => Math.abs((a.rating ?? 1200) - myRating) - Math.abs((b.rating ?? 1200) - myRating))
  }, [allMembers, currentUser.rating, currentUser.weight, ratingRange, sameWeightClassOnly])

  return { candidates, loading, ratingRange, setRatingRange, sameWeightClassOnly, setSameWeightClassOnly }
}