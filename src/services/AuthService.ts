import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

const FAKE_EMAIL_DOMAIN = 'armbrydning.local'
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/

function toFakeEmail(username: string): string {
  return `${username.toLowerCase().trim()}@${FAKE_EMAIL_DOMAIN}`
}

export function validateUsername(username: string): string | null {
  const trimmed = username.trim()
  if (trimmed.length < 3) return 'Brugernavn skal være mindst 3 tegn.'
  if (trimmed.length > 30) return 'Brugernavn må højst være 30 tegn.'
  if (!USERNAME_PATTERN.test(trimmed)) {
    return 'Brugernavn må kun indeholde bogstaver, tal, bindestreg og underscore — ingen mellemrum.'
  }
  return null
}

export const AuthService = {
  async signUp(username: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email: toFakeEmail(username),
      password,
    })
    if (error) throw error
  },

  async signIn(username: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email: toFakeEmail(username),
      password,
    })
    if (error) throw error
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  },

  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
    return () => data.subscription.unsubscribe()
  },
}