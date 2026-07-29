export type GameWinner = 'A' | 'B'

export interface SupermatchGame {
  id: string
  supermatchId: string
  gameNumber: number
  winner: GameWinner

  ratingABefore: number
  ratingBBefore: number
  ratingAAfter: number
  ratingBAfter: number
}