import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '../models/User'
import { UserRepository } from '../repositories/UserRepository'
import { AuthService } from '../services/AuthService'
import { DEFAULT_RATING, DEFAULT_RD, DEFAULT_VOLATILITY } from '../services/GlickoMath'

export type AuthStatus = 'loading' | 'signed_out' | 'needs_profile' | 'signed_in'

interface ProfileInput {
  name: string
  clubId: string
  weight: number | null
  height: number | null
  birthDate: string
  gender: 'male' | 'female'
  parentalConsentGiven: boolean | null
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
      const user = await UserRepository.getMyFullProfile()
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

  useEffect(() => {
    if (!session?.user?.id) return

    const channelName = `own-user-changes-${session.user.id}-${Math.random().toString(36).slice(2)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users', filter: `id=eq.${session.user.id}` },
        () => {
          loadUserForSession(session)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, loadUserForSession])

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
        await UserRepository.create({
          id: session.user.id,
          name: profile.name,
          username,
          clubId: profile.clubId,
          roles: ['member'],
          status: 'pending_approval',
          ratingLeft: DEFAULT_RATING,
          ratingLeftRD: DEFAULT_RD,
          ratingLeftVolatility: DEFAULT_VOLATILITY,
          ratingRight: DEFAULT_RATING,
          ratingRightRD: DEFAULT_RD,
          ratingRightVolatility: DEFAULT_VOLATILITY,
          weight: profile.weight,
          height: profile.height,
          birthDate: profile.birthDate,
          gender: profile.gender,
          consentDate: new Date().toISOString(),
          parentalConsentGiven: profile.parentalConsentGiven,
        })
        const fullUser = await UserRepository.getMyFullProfile()
        setCurrentUser(fullUser)
        setStatus('signed_in')
      } catch (err) {
        setError((err as Error).message)
        throw err
      }
    },
    [session]
  )

  const refreshCurrentUser = useCallback(async () => {
    const user = await UserRepository.getMyFullProfile()
    setCurrentUser(user)
  }, [])

  const signOut = useCallback(async () => {
    await AuthService.signOut()
    setSession(null)
    setCurrentUser(null)
    setStatus('signed_out')
  }, [])

  return { status, session, currentUser, error, signUp, signIn, completeProfile, signOut, refreshCurrentUser }
}