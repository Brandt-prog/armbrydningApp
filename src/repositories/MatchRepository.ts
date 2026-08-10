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
  reported_by: string
  confirmed_by: string | null
  status: MatchStatus
  rating_a_before: number | null
  rating_b_before: number | null
  rating_a_after: number | null
  rating_b_after: number | null
}

function toDomain(row: MatchRow): Match {
  return {
    id: row.id,
    playerAId: row.player_a_id,
    playerBId: row.player_b_id,
    winnerId: row.winner_id,
    date: row.date,
    arm: row.arm,
    reportedBy: row.reported_by,
    confirmedBy: row.confirmed_by,
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
  if (m.reportedBy !== undefined) row.reported_by = m.reportedBy
  if (m.confirmedBy !== undefined) row.confirmed_by = m.confirmedBy
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

  async getById(id: string): Promise<Match | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return toDomain(data as MatchRow)
  },

  async getByPlayerId(playerId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .or(`player_a_id.eq.${playerId},player_b_id.eq.${playerId}`)
    if (error) throw error
    return (data as MatchRow[]).map(toDomain)
  },

  async getPendingForPlayer(playerId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .or(`player_a_id.eq.${playerId},player_b_id.eq.${playerId}`)
      .eq('status', 'pending_confirmation')
    if (error) throw error
    return (data as MatchRow[]).map(toDomain)
  },

  async getAllByArm(arm: Arm): Promise<Match[]> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('arm', arm)
    if (error) throw error
    return (data as MatchRow[]).map(toDomain)
  },

  async create(m: Omit<Match, 'id'>): Promise<Match> {
    const { data, error } = await supabase.from(TABLE).insert(toRow(m)).select().single()
    if (error) throw error
    return toDomain(data as MatchRow)
  },

  async update(id: string, changes: Partial<Match>): Promise<Match> {
    const { data, error } = await supabase.from(TABLE).update(toRow(changes)).eq('id', id).select().single()
    if (error) throw error
    return toDomain(data as MatchRow)
  },
}