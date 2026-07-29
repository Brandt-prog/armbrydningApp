import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import type { User } from '../models/User'
import { UserRepository } from '../repositories/UserRepository'
import { AuthService } from '../services/AuthService'

export type AuthStatus = 'loading' | 'signed_out' | 'needs_profile' | 'signed_in'

interface ProfileInput {
  name: string
  clubId: string
  weight: number | null
  height: number | null
  birthDate: string
  gender: 'male' | 'female'
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  const loadUserForSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setCurrentUser(null)
      setStatus('signed_out')
      return
    }
    try {
      const user = await UserRepository.getById(session.user.id)
      if (user) {
        setCurrentUser(user)
        setStatus('signed_in')
      } else {
        setCurrentUser(null)
        setStatus('needs_profile')
      }
    } catch (err) {
      setError((err as Error).message)
      setStatus('signed_out')
    }
  }, [])

  useEffect(() => {
    AuthService.getSession().then((session) => {
      setSession(session)
      loadUserForSession(session)
    })

    const unsubscribe = AuthService.onAuthStateChange((session) => {
      setSession(session)
      loadUserForSession(session)
    })

    return unsubscribe
  }, [loadUserForSession])

  const signUp = useCallback(async (username: string, password: string) => {
    setError(null)
    try {
      await AuthService.signUp(username, password)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }, [])

  const signIn = useCallback(async (username: string, password: string) => {
    setError(null)
    try {
      await AuthService.signIn(username, password)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }, [])

  const completeProfile = useCallback(
    async (profile: ProfileInput) => {
      if (!session?.user?.email) throw new Error('No active session.')
      setError(null)
      try {
        const username = session.user.email.split('@')[0]
        const newUser = await UserRepository.create({
          id: session.user.id,
          name: profile.name,
          username,
          clubId: profile.clubId,
          roles: ['member'],
          status: 'pending_approval',
          rating: 1200,
          weight: profile.weight,
          height: profile.height,
          birthDate: profile.birthDate,
          gender: profile.gender,
          consentDate: new Date().toISOString(),
        })
        setCurrentUser(newUser)
        setStatus('signed_in')
      } catch (err) {
        setError((err as Error).message)
        throw err
      }
    },
    [session]
  )

  const signOut = useCallback(async () => {
    await AuthService.signOut()
    setSession(null)
    setCurrentUser(null)
    setStatus('signed_out')
  }, [])

  return { status, session, currentUser, error, signUp, signIn, completeProfile, signOut }
}