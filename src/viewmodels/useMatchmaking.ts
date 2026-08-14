import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Arm } from '../models/Arm'
import type { User } from '../models/User'
import { UserRepository } from '../repositories/UserRepository'

export function useMatchmaking(currentUser: User, arm: Arm) {
  const [allMembers, setAllMembers] = useState<User[]>([])
  const [classifications, setClassifications] = useState<Map<string, { ageCategory: string; weightClass: string }>>(new Map())
  const [loading, setLoading] = useState(true)
  const [ratingRange, setRatingRange] = useState(100)
  const [sameWeightClassOnly, setSameWeightClassOnly] = useState(false)

  const load = useCallback(async () => {
    try {
      const all = await UserRepository.getAll()
      const active = all.filter((u) => u.status === 'active' && u.id !== currentUser.id)
      setAllMembers(active)
      const classMap = await UserRepository.getClassificationsBulk(active.map((u) => u.id))
      setClassifications(classMap)
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
    const ratingField = arm === 'left' ? 'ratingLeft' : 'ratingRight'
    const myRating = currentUser[ratingField] ?? 1500

    return allMembers
      .filter((u) => Math.abs((u[ratingField] ?? 1500) - myRating) <= ratingRange)
      .filter((u) => {
        if (!sameWeightClassOnly) return true
        const myClass = classifications.get(currentUser.id)?.weightClass
        const theirClass = classifications.get(u.id)?.weightClass
        if (!myClass || !theirClass) return false
        return myClass === theirClass
      })
      .sort(
        (a, b) =>
          Math.abs((a[ratingField] ?? 1500) - myRating) - Math.abs((b[ratingField] ?? 1500) - myRating)
      )
  }, [allMembers, currentUser, arm, ratingRange, sameWeightClassOnly, classifications])

  return { candidates, classifications, loading, ratingRange, setRatingRange, sameWeightClassOnly, setSameWeightClassOnly }
}