import type { Arm } from './Arm'

export interface Supermatch {
  id: string
  playerAId: string
  playerBId: string
  date: string
  arm: Arm
  format: string
  organizingClubId: string | null
  recordedBy: string

  finalRatingA: number
  finalRatingB: number
}