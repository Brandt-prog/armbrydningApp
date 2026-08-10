import type { Arm } from '../models/Arm'
import type { Match } from '../models/Match'
import type { User } from '../models/User'
import { MatchRepository } from '../repositories/MatchRepository'
import { UserRepository } from '../repositories/UserRepository'
import type { GlickoRating } from './GlickoMath'
import { updateGlickoAfterGame } from './GlickoMath'

export class MatchServiceError extends Error {}

function getGlicko(user: User, arm: Arm): GlickoRating {
  return arm === 'left'
    ? { rating: user.ratingLeft, rd: user.ratingLeftRD, volatility: user.ratingLeftVolatility }
    : { rating: user.ratingRight, rd: user.ratingRightRD, volatility: user.ratingRightVolatility }
}

/**
 * Step 1: one player reports a casual club match. No rating changes yet —
 * the match sits as 'pending_confirmation' until the other player (or a
 * judge) confirms it.
 */
export async function reportMatch(
  playerAId: string,
  playerBId: string,
  winnerId: string,
  arm: Arm,
  reportedById: string
): Promise<Match> {
  if (playerAId === playerBId) {
    throw new MatchServiceError('A player cannot play against themselves.')
  }
  if (winnerId !== playerAId && winnerId !== playerBId) {
    throw new MatchServiceError('The winner must be one of the two players.')
  }
  if (reportedById !== playerAId && reportedById !== playerBId) {
    throw new MatchServiceError('Only one of the two players can report the match.')
  }

  return MatchRepository.create({
    playerAId,
    playerBId,
    winnerId,
    date: new Date().toISOString(),
    arm,
    reportedBy: reportedById,
    confirmedBy: null,
    status: 'pending_confirmation',
    ratingABefore: null,
    ratingBBefore: null,
    ratingAAfter: null,
    ratingBAfter: null,
  })
}

/**
 * Step 2: the match is confirmed — either by the other player (handshake),
 * or by a user with the 'judge' role. Only now is Glicko-2 applied.
 */
export async function confirmMatch(matchId: string, confirmingUserId: string): Promise<Match> {
  const match = await MatchRepository.getById(matchId)
  if (!match) {
    throw new MatchServiceError('Match not found.')
  }
  if (match.status !== 'pending_confirmation') {
    throw new MatchServiceError(`Match cannot be confirmed from status "${match.status}".`)
  }

  const confirmingUser = await UserRepository.getById(confirmingUserId)
  if (!confirmingUser) {
    throw new MatchServiceError('Confirming user not found.')
  }

  const isOtherPlayer =
    (confirmingUserId === match.playerAId || confirmingUserId === match.playerBId) &&
    confirmingUserId !== match.reportedBy
  const isJudge = confirmingUser.roles.includes('judge')

  if (!isOtherPlayer && !isJudge) {
    throw new MatchServiceError('Only the other player, or a judge, can confirm this match.')
  }

  const [playerA, playerB] = await Promise.all([
    UserRepository.getById(match.playerAId),
    UserRepository.getById(match.playerBId),
  ])
  if (!playerA || !playerB) {
    throw new MatchServiceError('One or both players could not be found.')
  }

  const ratingA = getGlicko(playerA, match.arm)
  const ratingB = getGlicko(playerB, match.arm)

  const scoreA: 0 | 1 = match.winnerId === playerA.id ? 1 : 0
  const scoreB: 0 | 1 = match.winnerId === playerB.id ? 1 : 0

  const newA = updateGlickoAfterGame(ratingA, ratingB, scoreA)
  const newB = updateGlickoAfterGame(ratingB, ratingA, scoreB)

  const updatedMatch = await MatchRepository.update(matchId, {
    status: 'confirmed',
    confirmedBy: confirmingUserId,
    ratingABefore: ratingA.rating,
    ratingBBefore: ratingB.rating,
    ratingAAfter: newA.rating,
    ratingBAfter: newB.rating,
  })

  const fieldsA =
    match.arm === 'left'
      ? { ratingLeft: newA.rating, ratingLeftRD: newA.rd, ratingLeftVolatility: newA.volatility }
      : { ratingRight: newA.rating, ratingRightRD: newA.rd, ratingRightVolatility: newA.volatility }
  const fieldsB =
    match.arm === 'left'
      ? { ratingLeft: newB.rating, ratingLeftRD: newB.rd, ratingLeftVolatility: newB.volatility }
      : { ratingRight: newB.rating, ratingRightRD: newB.rd, ratingRightVolatility: newB.volatility }

  await Promise.all([
    UserRepository.update(playerA.id, fieldsA),
    UserRepository.update(playerB.id, fieldsB),
  ])

  return updatedMatch
}

export async function cancelMatch(matchId: string): Promise<Match> {
  const match = await MatchRepository.getById(matchId)
  if (!match) {
    throw new MatchServiceError('Match not found.')
  }
  if (match.status !== 'pending_confirmation') {
    throw new MatchServiceError(`Match cannot be cancelled from status "${match.status}".`)
  }
  return MatchRepository.update(matchId, { status: 'cancelled' })
}