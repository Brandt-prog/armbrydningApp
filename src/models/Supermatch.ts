export interface Supermatch {
  id: string
  playerAId: string
  playerBId: string
  date: string
  format: string
  organizingClubId: string | null
  recordedBy: string

  finalRatingA: number
  finalRatingB: number
}