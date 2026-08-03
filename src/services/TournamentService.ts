import type { Arm } from '../models/Arm'
import type { Tournament } from '../models/Tournament'
import type { TournamentMatch } from '../models/TournamentMatch'
import type { User } from '../models/User'
import { TournamentMatchRepository } from '../repositories/TournamentMatchRepository'
import { TournamentRepository } from '../repositories/TournamentRepository'
import { UserRepository } from '../repositories/UserRepository'
import type { GlickoRating } from './GlickoMath'
import { updateGlickoAfterGame } from './GlickoMath'

export class TournamentServiceError extends Error {}

function getGlicko(user: User, arm: Arm): GlickoRating {
  return arm === 'left'
    ? { rating: user.ratingLeft, rd: user.ratingLeftRD, volatility: user.ratingLeftVolatility }
    : { rating: user.ratingRight, rd: user.ratingRightRD, volatility: user.ratingRightVolatility }
}

export async function createTournament(
  name: string,
  date: string,
  arm: Arm,
  organizingClubId: string | null,
  recordedBy: string
): Promise<Tournament> {
  return TournamentRepository.create({ name, date, arm, organizingClubId, recordedBy })
}

/**
 * Records a single real match within a tournament (any round or bracket).
 * Rating updates immediately using Glicko-2, treating this game as its
 * own one-opponent rating period.
 */
export async function recordTournamentMatch(
  tournamentId: string,
  playerAId: string,
  playerBId: string,
  winnerId: string
): Promise<TournamentMatch> {
  if (playerAId === playerBId) {
    throw new TournamentServiceError('A player cannot play against themselves.')
  }
  if (winnerId !== playerAId && winnerId !== playerBId) {
    throw new TournamentServiceError('The winner must be one of the two players.')
  }

  const tournament = await TournamentRepository.getById(tournamentId)
  if (!tournament) {
    throw new TournamentServiceError('Tournament not found.')
  }
  const arm = tournament.arm

  const [playerA, playerB] = await Promise.all([
    UserRepository.getById(playerAId),
    UserRepository.getById(playerBId),
  ])
  if (!playerA || !playerB) {
    throw new TournamentServiceError('One or both players could not be found.')
  }

  const ratingA = getGlicko(playerA, arm)
  const ratingB = getGlicko(playerB, arm)

  const scoreA: 0 | 1 = winnerId === playerAId ? 1 : 0
  const scoreB: 0 | 1 = winnerId === playerBId ? 1 : 0

  const newA = updateGlickoAfterGame(ratingA, ratingB, scoreA)
  const newB = updateGlickoAfterGame(ratingB, ratingA, scoreB)

  const existingMatches = await TournamentMatchRepository.getByTournamentId(tournamentId)
  const sequenceNumber = existingMatches.length + 1

  const match = await TournamentMatchRepository.create({
    tournamentId,
    arm,
    playerAId,
    playerBId,
    winnerId,
    sequenceNumber,
    ratingABefore: ratingA.rating,
    ratingBBefore: ratingB.rating,
    ratingAAfter: newA.rating,
    ratingBAfter: newB.rating,
  })

  const fieldsA =
    arm === 'left'
      ? { ratingLeft: newA.rating, ratingLeftRD: newA.rd, ratingLeftVolatility: newA.volatility }
      : { ratingRight: newA.rating, ratingRightRD: newA.rd, ratingRightVolatility: newA.volatility }
  const fieldsB =
    arm === 'left'
      ? { ratingLeft: newB.rating, ratingLeftRD: newB.rd, ratingLeftVolatility: newB.volatility }
      : { ratingRight: newB.rating, ratingRightRD: newB.rd, ratingRightVolatility: newB.volatility }

  await Promise.all([
    UserRepository.update(playerAId, fieldsA),
    UserRepository.update(playerBId, fieldsB),
  ])

  return match
}