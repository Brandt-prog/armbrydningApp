/**
 * Glicko-2 rating system (Glickman, 2001/2013).
 *
 * Ratings update after every individual game (a bracket match, or a single
 * game within a supermatch series). Each update is treated as its own
 * one-opponent "rating period" — a standard simplification of the batch
 * algorithm, used here to support live, sequential updates instead of a
 * periodic batch job.
 */

export interface GlickoRating {
  rating: number
  rd: number
  volatility: number
}

const SCALE = 173.7178
const TAU = 0.5 // system constant — controls how much volatility can change per update
const CONVERGENCE_TOLERANCE = 0.000001
const MIN_RD = 30 // floor so a very experienced player never looks "perfectly certain"

export const DEFAULT_RATING = 1500
export const DEFAULT_RD = 350
export const DEFAULT_VOLATILITY = 0.06

function toInternal(rating: number, rd: number) {
  return { mu: (rating - DEFAULT_RATING) / SCALE, phi: rd / SCALE }
}

function toExternal(mu: number, phi: number) {
  return { rating: mu * SCALE + DEFAULT_RATING, rd: phi * SCALE }
}

function g(phi: number): number {
  return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI))
}

function expectedScore(mu: number, muOpponent: number, phiOpponent: number): number {
  return 1 / (1 + Math.exp(-g(phiOpponent) * (mu - muOpponent)))
}

function newVolatility(phi: number, delta: number, v: number, sigma: number): number {
  const a = Math.log(sigma * sigma)

  function f(x: number): number {
    const ex = Math.exp(x)
    const num = ex * (delta * delta - phi * phi - v - ex)
    const den = 2 * Math.pow(phi * phi + v + ex, 2)
    return num / den - (x - a) / (TAU * TAU)
  }

  let A = a
  let B: number
  if (delta * delta > phi * phi + v) {
    B = Math.log(delta * delta - phi * phi - v)
  } else {
    let k = 1
    while (f(a - k * TAU) < 0) k++
    B = a - k * TAU
  }

  let fA = f(A)
  let fB = f(B)

  while (Math.abs(B - A) > CONVERGENCE_TOLERANCE) {
    const C = A + ((A - B) * fA) / (fB - fA)
    const fC = f(C)
    if (fC * fB < 0) {
      A = B
      fA = fB
    } else {
      fA = fA / 2
    }
    B = C
    fB = fC
  }

  return Math.exp(A / 2)
}

/**
 * Updates a player's Glicko-2 rating after a single game against one
 * opponent. `score` is 1 for a win, 0 for a loss (no draws in arm wrestling).
 */
export function updateGlickoAfterGame(
  player: GlickoRating,
  opponent: GlickoRating,
  score: 0 | 1
): GlickoRating {
  const { mu, phi } = toInternal(player.rating, player.rd)
  const { mu: muJ, phi: phiJ } = toInternal(opponent.rating, opponent.rd)

  const gPhiJ = g(phiJ)
  const e = expectedScore(mu, muJ, phiJ)
  const v = 1 / (gPhiJ * gPhiJ * e * (1 - e))
  const delta = v * gPhiJ * (score - e)

  const sigmaPrime = newVolatility(phi, delta, v, player.volatility)

  const phiStar = Math.sqrt(phi * phi + sigmaPrime * sigmaPrime)
  const phiPrime = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v)
  const muPrime = mu + phiPrime * phiPrime * gPhiJ * (score - e)

  const { rating, rd } = toExternal(muPrime, phiPrime)

  return {
    rating: Math.round(rating),
    rd: Math.max(MIN_RD, Math.round(rd)),
    volatility: sigmaPrime,
  }
}

/**
 * Win probability estimate for display purposes (e.g. a head-to-head
 * matrix), based on each player's current rating and RD.
 */
export function winProbability(player: GlickoRating, opponent: GlickoRating): number {
  const { mu, phi } = toInternal(player.rating, player.rd)
  const { mu: muJ, phi: phiJ } = toInternal(opponent.rating, opponent.rd)
  const combinedPhi = Math.sqrt(phi * phi + phiJ * phiJ)
  return expectedScore(mu, muJ, combinedPhi)
}