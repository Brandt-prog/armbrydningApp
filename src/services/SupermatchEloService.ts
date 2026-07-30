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

// Bonus for winning the overall series, applied once at the end —
// matches the 1st-place tournament bonus, since a supermatch is
// effectively a 2-person tournament.
const SERIES_WIN_BONUS = 15

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

  // Apply a bonus to whoever won more individual games overall.
  const aWins = gameWinners.filter((w) => w === 'A').length
  const bWins = gameWinners.filter((w) => w === 'B').length

  if (aWins > bWins) {
    ratingA += SERIES_WIN_BONUS
  } else if (bWins > aWins) {
    ratingB += SERIES_WIN_BONUS
  }
  // A tied series (equal wins) gets no bonus — no clear winner.

  return { finalRatingA: ratingA, finalRatingB: ratingB, games }
}