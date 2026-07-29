import type { GameWinner } from '../models/SupermatchGame'
import { getExpectedScore, getKFactor } from './EloMath'

export interface SupermatchParticipant {
  userId: string
  rating: number
  eventsPlayed: number
}

export interface GameRatingSnapshot {
  gameNumber: number
  winner: GameWinner
  ratingABefore: number
  ratingBBefore: number
  ratingAAfter: number
  ratingBAfter: number
}

export interface SupermatchResult {
  finalRatingA: number
  finalRatingB: number
  games: GameRatingSnapshot[]
}

export function calculateSupermatchRatings(
  playerA: SupermatchParticipant,
  playerB: SupermatchParticipant,
  gameWinners: GameWinner[]
): SupermatchResult {
  let ratingA = playerA.rating
  let ratingB = playerB.rating

  const kA = getKFactor(playerA.eventsPlayed)
  const kB = getKFactor(playerB.eventsPlayed)

  const games: GameRatingSnapshot[] = gameWinners.map((winner, index) => {
    const expectedA = getExpectedScore(ratingA, ratingB)
    const expectedB = getExpectedScore(ratingB, ratingA)

    const scoreA = winner === 'A' ? 1 : 0
    const scoreB = winner === 'B' ? 1 : 0

    const ratingABefore = ratingA
    const ratingBBefore = ratingB

    ratingA = Math.round(ratingA + kA * (scoreA - expectedA))
    ratingB = Math.round(ratingB + kB * (scoreB - expectedB))

    return {
      gameNumber: index + 1,
      winner,
      ratingABefore,
      ratingBBefore,
      ratingAAfter: ratingA,
      ratingBAfter: ratingB,
    }
  })

  return { finalRatingA: ratingA, finalRatingB: ratingB, games }
}