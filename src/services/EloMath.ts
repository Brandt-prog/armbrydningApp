export const STARTING_RATING = 1200

const K_FACTOR_NEW = 40
const K_FACTOR_INTERMEDIATE = 30
const K_FACTOR_EXPERIENCED = 20

const NEW_THRESHOLD = 5
const EXPERIENCED_THRESHOLD = 15

export function getKFactor(eventsPlayed: number): number {
  if (eventsPlayed < NEW_THRESHOLD) return K_FACTOR_NEW
  if (eventsPlayed < EXPERIENCED_THRESHOLD) return K_FACTOR_INTERMEDIATE
  return K_FACTOR_EXPERIENCED
}

export function getExpectedScore(ratingSelf: number, ratingOpponent: number): number {
  return 1 / (1 + Math.pow(10, (ratingOpponent - ratingSelf) / 400))
}