import { useEffect, useState } from 'react'
import type { Club } from '../models/Club'
import { ClubRepository } from '../repositories/ClubRepository'

export function useClubs() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ClubRepository.getAll()
      .then(setClubs)
      .finally(() => setLoading(false))
  }, [])

  return { clubs, loading }
}