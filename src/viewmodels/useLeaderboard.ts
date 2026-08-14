import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Arm } from '../models/Arm'
import type { User } from '../models/User'
import { UserRepository } from '../repositories/UserRepository'
import { getConnectedComponents, getOpponentCounts } from '../services/ConnectivityService'

const RD_ESTABLISHED_THRESHOLD = 200
const MIN_CLUSTER_SIZE = 5
const MIN_DISTINCT_OPPONENTS = 4

export interface LeaderboardEntry {
  user: User
  clusterSize: number
  opponentCount: number
  isMainCluster: boolean
  isEstablished: boolean
  ageCategory: string | null
  weightClass: string | null
}

export function useLeaderboard(clubId: string | null, arm: Arm) {
  const [established, setEstablished] = useState<LeaderboardEntry[]>([])
  const [provisional, setProvisional] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    setError(null)
    try {
      const [allUsers, components, opponentCounts] = await Promise.all([
        UserRepository.getAll(),
        getConnectedComponents(arm),
        getOpponentCounts(arm),
      ])

      function clusterFor(userId: string): Set<string> | null {
        return components.find((c) => c.has(userId)) ?? null
      }

      const ratingField = arm === 'left' ? 'ratingLeft' : 'ratingRight'
      const rdField = arm === 'left' ? 'ratingLeftRD' : 'ratingRightRD'

      const filtered = allUsers
        .filter((u) => u.status === 'active')
        .filter((u) => (clubId ? u.clubId === clubId : true))

      const classifications = await UserRepository.getClassificationsBulk(filtered.map((u) => u.id))

      const entries: LeaderboardEntry[] = filtered.map((user) => {
        const cluster = clusterFor(user.id)
        const clusterSize = cluster?.size ?? 0
        const opponentCount = opponentCounts.get(user.id) ?? 0
        const classification = classifications.get(user.id)

        const isMainCluster = cluster === null || (clusterSize >= MIN_CLUSTER_SIZE && opponentCount >= MIN_DISTINCT_OPPONENTS)

        return {
          user,
          clusterSize,
          opponentCount,
          isMainCluster,
          isEstablished: user[rdField] < RD_ESTABLISHED_THRESHOLD,
          ageCategory: classification?.ageCategory ?? null,
          weightClass: classification?.weightClass ?? null,
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