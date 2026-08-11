import { supabase } from '../lib/supabaseClient'
import type { Arm } from '../models/Arm'
import type { Match } from '../models/Match'
import { MatchRepository } from '../repositories/MatchRepository'

export class MatchServiceError extends Error {}

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
 * Step 2: the match is confirmed via the `confirm_club_match` database
 * function. All Glicko-2 calculation and the actual rating updates happen
 * server-side (SECURITY DEFINER) — the client never writes ratings
 * directly, and doesn't need to read the match back afterward.
 */
export async function confirmMatch(matchId: string): Promise<void> {
  const { error } = await supabase.rpc('confirm_club_match', { p_match_id: matchId })
  if (error) {
    throw new MatchServiceError(error.message)
  }
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