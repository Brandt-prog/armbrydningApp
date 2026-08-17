import { supabase } from '../lib/supabaseClient'

export class AdminServiceError extends Error {}

export async function resetMemberPassword(targetUserId: string, newPassword: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token

  if (!accessToken) {
    throw new AdminServiceError('Ingen aktiv session.')
  }

  const { data, error } = await supabase.functions.invoke('admin-reset-password', {
    body: { targetUserId, newPassword },
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (error) {
    throw new AdminServiceError(error.message)
  }
  if (data?.error) {
    throw new AdminServiceError(data.error)
  }
}