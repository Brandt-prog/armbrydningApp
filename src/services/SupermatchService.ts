import type { Arm } from '../models/Arm'
import type { Supermatch } from '../models/Supermatch'
import type { GameWinner } from '../models/SupermatchGame'
import type { User } from '../models/User'
import { SupermatchRepository } from '../repositories/SupermatchRepository'
import { UserRepository } from '../repositories/UserRepository'
import type { GlickoRating } from './GlickoMath'
import { updateGlickoAfterGame } from './GlickoMath'

export class SupermatchServiceError extends Error {}

function getGlicko(user: User, arm: Arm): GlickoRating {
  return arm === 'left'
    ? { rating: user.ratingLeft, rd: user.ratingLeftRD, volatility: user.ratingLeftVolatility }
    : { rating: user.ratingRight, rd: user.ratingRightRD, volatility: user.ratingRightVolatility }
}

export async function recordSupermatch(
  playerAId: string,
  playerBId: string,
  date: string,
  arm: Arm,
  format: string,
  organizingClubId: string | null,
  recordedBy: string,
  gameWinners: GameWinner[]
): Promise<Supermatch> {
  if (playerAId === playerBId) {
    throw new SupermatchServiceError('A player cannot compete against themselves.')
  }
  if (gameWinners.length === 0) {
    throw new SupermatchServiceError('A supermatch needs at least one game result.')
  }

  const [playerA, playerB] = await Promise.all([
    UserRepository.getById(playerAId),
    UserRepository.getById(playerBId),
  ])
  if (!playerA || !playerB) {
    throw new SupermatchServiceError('One or both players could not be found.')
  }

  let ratingA = getGlicko(playerA, arm)
  let ratingB = getGlicko(playerB, arm)

  const gameRows: {
    gameNumber: number
    winner: GameWinner
    ratingABefore: number
    ratingBBefore: number
    ratingAAfter: number
    ratingBAfter: number
  }[] = []

  gameWinners.forEach((winner, index) => {
    const scoreA: 0 | 1 = winner === 'A' ? 1 : 0
    const scoreB: 0 | 1 = winner === 'B' ? 1 : 0

    const newA = updateGlickoAfterGame(ratingA, ratingB, scoreA)
    const newB = updateGlickoAfterGame(ratingB, ratingA, scoreB)

    gameRows.push({
      gameNumber: index + 1,
      winner,
      ratingABefore: ratingA.rating,
      ratingBBefore: ratingB.rating,
      ratingAAfter: newA.rating,
      ratingBAfter: newB.rating,
    })

    ratingA = newA
    ratingB = newB
  })

  const supermatch = await SupermatchRepository.create({
    playerAId,
    playerBId,
    date,
    arm,
    format,
    organizingClubId,
    recordedBy,
    finalRatingA: ratingA.rating,
    finalRatingB: ratingB.rating,
  })

  await SupermatchRepository.createGames(
    gameRows.map((g) => ({
      supermatchId: supermatch.id,
      gameNumber: g.gameNumber,
      winner: g.winner,
      ratingABefore: g.ratingABefore,
      ratingBBefore: g.ratingBBefore,
      ratingAAfter: g.ratingAAfter,
      ratingBAfter: g.ratingBAfter,
    }))
  )

  const fieldsA =
    arm === 'left'
      ? { ratingLeft: ratingA.rating, ratingLeftRD: ratingA.rd, ratingLeftVolatility: ratingA.volatility }
      : { ratingRight: ratingA.rating, ratingRightRD: ratingA.rd, ratingRightVolatility: ratingA.volatility }
  const fieldsB =
    arm === 'left'
      ? { ratingLeft: ratingB.rating, ratingLeftRD: ratingB.rd, ratingLeftVolatility: ratingB.volatility }
      : { ratingRight: ratingB.rating, ratingRightRD: ratingB.rd, ratingRightVolatility: ratingB.volatility }

  await Promise.all([
    UserRepository.update(playerAId, fieldsA),
    UserRepository.update(playerBId, fieldsB),
  ])

  return supermatch
}