import { useCallback, useEffect, useState } from 'react'
import type { Club } from '../models/Club'
import { ClubRepository } from '../repositories/ClubRepository'

export function useClubs() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const result = await ClubRepository.getAll()
      setClubs(result)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { clubs, loading, refresh: load }
}