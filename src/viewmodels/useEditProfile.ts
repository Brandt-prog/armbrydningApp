import { useCallback, useState } from 'react'
import { UserRepository } from '../repositories/UserRepository'

interface EditableFields {
  name: string
  weight: number | null
  height: number | null
}

export function useEditProfile(userId: string) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback(
    async (fields: EditableFields) => {
      setSubmitting(true)
      setError(null)
      try {
        await UserRepository.update(userId, {
          name: fields.name,
          weight: fields.weight,
          height: fields.height,
        })
      } catch (err) {
        setError((err as Error).message)
        throw err
      } finally {
        setSubmitting(false)
      }
    },
    [userId]
  )

  return { save, submitting, error }
}