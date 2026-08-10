import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Arm } from '../models/Arm'
import type { User } from '../models/User'
import { UserRepository } from '../repositories/UserRepository'
import { getConnectedComponents } from '../services/ConnectivityService'

const RD_ESTABLISHED_THRESHOLD = 200
const MIN_CLUSTER_SIZE = 5

export interface LeaderboardEntry {
  user: User
  clusterSize: number
  isMainCluster: boolean
  isEstablished: boolean
}

export function useLeaderboard(clubId: string | null, arm: Arm) {
  const [established, setEstablished] = useState<LeaderboardEntry[]>([])
  const [provisional, setProvisional] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    setError(null)
    try {
      const [allUsers, components] = await Promise.all([
        UserRepository.getAll(),
        getConnectedComponents(arm),
      ])

      function clusterFor(userId: string): Set<string> | null {
        return components.find((c) => c.has(userId)) ?? null
      }

      const ratingField = arm === 'left' ? 'ratingLeft' : 'ratingRight'
      const rdField = arm === 'left' ? 'ratingLeftRD' : 'ratingRightRD'

      const filtered = allUsers
        .filter((u) => u.status === 'active')
        .filter((u) => (clubId ? u.clubId === clubId : true))

      const entries: LeaderboardEntry[] = filtered.map((user) => {
        const cluster = clusterFor(user.id)
        const clusterSize = cluster?.size ?? 0
        const isMainCluster = cluster === null || clusterSize >= MIN_CLUSTER_SIZE
        return {
          user,
          clusterSize,
          isMainCluster,
          isEstablished: user[rdField] < RD_ESTABLISHED_THRESHOLD,
        }
      })

      const sortByRating = (a: LeaderboardEntry, b: LeaderboardEntry) =>
        (b.user[ratingField] ?? 0) - (a.user[ratingField] ?? 0)

      setEstablished(entries.filter((e) => e.isEstablished && e.isMainCluster).sort(sortByRating))
      setProvisional(entries.filter((e) => !e.isEstablished || !e.isMainCluster).sort(sortByRating))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [clubId, arm])

  useEffect(() => {
    loadMembers()

    const channel = supabase
      .channel('leaderboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        loadMembers()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        loadMembers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadMembers])

  return { established, provisional, loading, error }
}