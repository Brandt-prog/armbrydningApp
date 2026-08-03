import { supabase } from '../lib/supabaseClient'
import type { Arm } from '../models/Arm'
import type { Match } from '../models/Match'
import type { MatchStatus } from '../models/MatchStatus'

const TABLE = 'matches'

interface MatchRow {
  id: string
  player_a_id: string
  player_b_id: string
  winner_id: string
  date: string
  arm: Arm
  recorded_by: string
  status: MatchStatus
  rating_a_before: number
  rating_b_before: number
  rating_a_after: number
  rating_b_after: number
}

function toDomain(row: MatchRow): Match {
  return {
    id: row.id,
    playerAId: row.player_a_id,
    playerBId: row.player_b_id,
    winnerId: row.winner_id,
    date: row.date,
    arm: row.arm,
    recordedBy: row.recorded_by,
    status: row.status,
    ratingABefore: row.rating_a_before,
    ratingBBefore: row.rating_b_before,
    ratingAAfter: row.rating_a_after,
    ratingBAfter: row.rating_b_after,
  }
}

function toRow(m: Partial<Match>): Partial<MatchRow> {
  const row: Partial<MatchRow> = {}
  if (m.id !== undefined) row.id = m.id
  if (m.playerAId !== undefined) row.player_a_id = m.playerAId
  if (m.playerBId !== undefined) row.player_b_id = m.playerBId
  if (m.winnerId !== undefined) row.winner_id = m.winnerId
  if (m.date !== undefined) row.date = m.date
  if (m.arm !== undefined) row.arm = m.arm
  if (m.recordedBy !== undefined) row.recorded_by = m.recordedBy
  if (m.status !== undefined) row.status = m.status
  if (m.ratingABefore !== undefined) row.rating_a_before = m.ratingABefore
  if (m.ratingBBefore !== undefined) row.rating_b_before = m.ratingBBefore
  if (m.ratingAAfter !== undefined) row.rating_a_after = m.ratingAAfter
  if (m.ratingBAfter !== undefined) row.rating_b_after = m.ratingBAfter
  return row
}

export const MatchRepository = {
  async getAll(): Promise<Match[]> {
    const { data, error } = await supabase.from(TABLE).select('*')
    if (error) throw error
    return (data as MatchRow[]).map(toDomain)
  },

  async getByPlayerId(playerId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .or(`player_a_id.eq.${playerId},player_b_id.eq.${playerId}`)
    if (error) throw error
    return (data as MatchRow[]).map(toDomain)
  },

  async create(m: Omit<Match, 'id'>): Promise<Match> {
    const { data, error } = await supabase.from(TABLE).insert(toRow(m)).select().single()
    if (error) throw error
    return toDomain(data as MatchRow)
  },
}