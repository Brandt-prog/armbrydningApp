import { useEffect, useState } from 'react'
import type { Arm } from '../models/Arm'
import { areUsersConnected } from '../services/ConnectivityService'

export function useConnectivity(userAId: string, userBId: string) {
  const [connectedRight, setConnectedRight] = useState<boolean | null>(null)
  const [connectedLeft, setConnectedLeft] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userAId === userBId) {
      setConnectedRight(true)
      setConnectedLeft(true)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    async function check(arm: Arm, setter: (v: boolean) => void) {
      try {
        const result = await areUsersConnected(userAId, userBId, arm)
        if (!cancelled) setter(result)
      } catch {
        if (!cancelled) setter(false)
      }
    }

    Promise.all([check('right', setConnectedRight), check('left', setConnectedLeft)]).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [userAId, userBId])

  return { connectedRight, connectedLeft, loading }
}