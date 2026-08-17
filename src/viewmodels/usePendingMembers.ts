import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '../models/User'
import { UserRepository } from '../repositories/UserRepository'
import { rejectPendingMember } from '../services/AdminService'

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

    const channel = supabase
      .channel(`pending-members-changes-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        loadPendingMembers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadPendingMembers])

  const approve = useCallback(async (userId: string) => {
    setError(null)
    try {
      await UserRepository.update(userId, { status: 'active' })
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }, [])

  const reject = useCallback(async (userId: string) => {
    setError(null)
    try {
      await rejectPendingMember(userId)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }, [])

  return { pendingMembers, loading, error, approve, reject, refresh: loadPendingMembers }
}