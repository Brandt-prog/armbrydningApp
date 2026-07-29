import type { MatchStatus } from './MatchStatus'

export interface Match {
  id: string
  playerAId: string
  playerBId: string
  winnerId: string
  date: string
  recordedBy: string
  status: MatchStatus

  ratingABefore: number
  ratingBBefore: number
  ratingAAfter: number
  ratingBAfter: number
}