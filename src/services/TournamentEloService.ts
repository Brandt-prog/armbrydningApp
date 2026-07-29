import { getExpectedScore, getKFactor } from './EloMath'

export interface ParticipantResult {
  userId: string
  rating: number
  tournamentsPlayed: number
  placement: number
}

export interface RatingChange {
  userId: string
  ratingBefore: number
  ratingAfter: number
}

export function calculateTournamentRatingChanges(
  participants: ParticipantResult[]
): RatingChange[] {
  const changes = new Map<string, number>()
  for (const p of participants) changes.set(p.userId, 0)

  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const a = participants[i]
      const b = participants[j]

      const expectedA = getExpectedScore(a.rating, b.rating)
      const expectedB = getExpectedScore(b.rating, a.rating)

      const aWon = a.placement < b.placement
      const scoreA = aWon ? 1 : 0
      const scoreB = aWon ? 0 : 1

      const kA = getKFactor(a.tournamentsPlayed)
      const kB = getKFactor(b.tournamentsPlayed)
      const divisor = participants.length - 1

      changes.set(a.userId, (changes.get(a.userId) ?? 0) + (kA * (scoreA - expectedA)) / divisor)
      changes.set(b.userId, (changes.get(b.userId) ?? 0) + (kB * (scoreB - expectedB)) / divisor)
    }
  }

  return participants.map((p) => ({
    userId: p.userId,
    ratingBefore: p.rating,
    ratingAfter: Math.round(p.rating + (changes.get(p.userId) ?? 0)),
  }))
}