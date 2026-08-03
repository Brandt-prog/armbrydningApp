import { supabase } from '../lib/supabaseClient'
import type { Arm } from '../models/Arm'
import type { TournamentMatch } from '../models/TournamentMatch'

const TABLE = 'tournament_matches'

interface TournamentMatchRow {
  id: string
  tournament_id: string
  arm: Arm
  player_a_id: string
  player_b_id: string
  winner_id: string
  sequence_number: number
  rating_a_before: number
  rating_b_before: number
  rating_a_after: number
  rating_b_after: number
}

function toDomain(row: TournamentMatchRow): TournamentMatch {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    arm: row.arm,
    playerAId: row.player_a_id,
    playerBId: row.player_b_id,
    winnerId: row.winner_id,
    sequenceNumber: row.sequence_number,
    ratingABefore: row.rating_a_before,
    ratingBBefore: row.rating_b_before,
    ratingAAfter: row.rating_a_after,
    ratingBAfter: row.rating_b_after,
  }
}

function toRow(m: Omit<TournamentMatch, 'id'>): Omit<TournamentMatchRow, 'id'> {
  return {
    tournament_id: m.tournamentId,
    arm: m.arm,
    player_a_id: m.playerAId,
    player_b_id: m.playerBId,
    winner_id: m.winnerId,
    sequence_number: m.sequenceNumber,
    rating_a_before: m.ratingABefore,
    rating_b_before: m.ratingBBefore,
    rating_a_after: m.ratingAAfter,
    rating_b_after: m.ratingBAfter,
  }
}

export const TournamentMatchRepository = {
  async create(m: Omit<TournamentMatch, 'id'>): Promise<TournamentMatch> {
    const { data, error } = await supabase.from(TABLE).insert(toRow(m)).select().single()
    if (error) throw error
    return toDomain(data as TournamentMatchRow)
  },

  async getByTournamentId(tournamentId: string): Promise<TournamentMatch[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('sequence_number')
    if (error) throw error
    return (data as TournamentMatchRow[]).map(toDomain)
  },

  async getByPlayerId(playerId: string): Promise<TournamentMatch[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .or(`player_a_id.eq.${playerId},player_b_id.eq.${playerId}`)
    if (error) throw error
    return (data as TournamentMatchRow[]).map(toDomain)
  },

  async getAllByArm(arm: Arm): Promise<TournamentMatch[]> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('arm', arm)
    if (error) throw error
    return (data as TournamentMatchRow[]).map(toDomain)
  },
}