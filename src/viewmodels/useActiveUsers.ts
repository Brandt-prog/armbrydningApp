import { useEffect, useState } from 'react'
import type { User } from '../models/User'
import { UserRepository } from '../repositories/UserRepository'

export function useActiveUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    UserRepository.getAll()
      .then((all) => setUsers(all.filter((u) => u.status === 'active')))
      .finally(() => setLoading(false))
  }, [])

  return { users, loading }
}