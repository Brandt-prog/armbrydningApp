import { useCallback, useState } from 'react'
import { resetMemberPassword } from '../services/AdminService'

export function useAdminPasswordReset() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const reset = useCallback(async (targetUserId: string, newPassword: string) => {
    setError(null)
    setSuccess(false)

    if (newPassword.length < 6) {
      setError('Kodeordet skal være mindst 6 tegn.')
      return
    }

    setSubmitting(true)
    try {
      await resetMemberPassword(targetUserId, newPassword)
      setSuccess(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { reset, submitting, error, success }
}