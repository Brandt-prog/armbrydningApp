import { useCallback, useState } from 'react'
import { AuthService } from '../services/AuthService'

export function useChangePassword() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const changePassword = useCallback(async (newPassword: string, confirmPassword: string) => {
    setError(null)
    setSuccess(false)

    if (newPassword.length < 6) {
      setError('Kodeordet skal være mindst 6 tegn.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Kodeordene matcher ikke.')
      return
    }

    setSubmitting(true)
    try {
      await AuthService.updatePassword(newPassword)
      setSuccess(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { changePassword, submitting, error, success }
}