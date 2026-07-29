import { useCallback, useEffect, useState } from 'react'
import type { User } from '../models/User'
import { UserRepository } from '../repositories/UserRepository'

/**
 * Fetches members awaiting approval. A club_admin only sees pending
 * members from their own club; a super_admin sees everyone.
 */
export function usePendingMembers(currentUser: User) {
  const [pendingMembers, setPendingMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPendingMembers = useCallback(async () => {
    setError(null)
    try {
      const allUsers = await UserRepository.getAll()
      const isSuperAdmin = currentUser.roles.includes('super_admin')

      const pending = allUsers.filter((u) => {
        if (u.status !== 'pending_approval') return false
        if (isSuperAdmin) return true
        return u.clubId === currentUser.clubId
      })

      setPendingMembers(pending)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [currentUser.roles, currentUser.clubId])

  useEffect(() => {
    loadPendingMembers()
  }, [loadPendingMembers])

  const approve = useCallback(async (userId: string) => {
    setError(null)
    try {
      await UserRepository.update(userId, { status: 'active' })
      setPendingMembers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }, [])

  const reject = useCallback(async (userId: string) => {
    setError(null)
    try {
      await UserRepository.delete(userId)
      setPendingMembers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }, [])

  return { pendingMembers, loading, error, approve, reject, refresh: loadPendingMembers }
}