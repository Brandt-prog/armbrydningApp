import type { Arm } from './Arm'
import type { MatchStatus } from './MatchStatus'

export interface Match {
  id: string
  playerAId: string
  playerBId: string
  winnerId: string
  date: string
  arm: Arm

  reportedBy: string
  confirmedBy: string | null
  status: MatchStatus

  ratingABefore: number | null
  ratingBBefore: number | null
  ratingAAfter: number | null
  ratingBAfter: number | null
}