import type { Arm } from './Arm'

export interface TournamentMatch {
  id: string
  tournamentId: string
  arm: Arm
  playerAId: string
  playerBId: string
  winnerId: string
  sequenceNumber: number
  ratingABefore: number
  ratingBBefore: number
  ratingAAfter: number
  ratingBAfter: number
}