import { supabase } from '../lib/supabaseClient'
import type { Arm } from '../models/Arm'
import type { Supermatch } from '../models/Supermatch'
import type { GameWinner, SupermatchGame } from '../models/SupermatchGame'

const SUPERMATCH_TABLE = 'supermatches'
const GAME_TABLE = 'supermatch_games'

interface SupermatchRow {
  id: string
  player_a_id: string
  player_b_id: string
  date: string
  arm: Arm
  format: string
  organizing_club_id: string | null
  recorded_by: string
  final_rating_a: number
  final_rating_b: number
}

interface SupermatchGameRow {
  id: string
  supermatch_id: string
  game_number: number
  winner: GameWinner
  rating_a_before: number
  rating_b_before: number
  rating_a_after: number
  rating_b_after: number
}

function toDomainSupermatch(row: SupermatchRow): Supermatch {
  return {
    id: row.id,
    playerAId: row.player_a_id,
    playerBId: row.player_b_id,
    date: row.date,
    arm: row.arm,
    format: row.format,
    organizingClubId: row.organizing_club_id,
    recordedBy: row.recorded_by,
    finalRatingA: row.final_rating_a,
    finalRatingB: row.final_rating_b,
  }
}

function toRowSupermatch(s: Partial<Supermatch>): Partial<SupermatchRow> {
  const row: Partial<SupermatchRow> = {}
  if (s.id !== undefined) row.id = s.id
  if (s.playerAId !== undefined) row.player_a_id = s.playerAId
  if (s.playerBId !== undefined) row.player_b_id = s.playerBId
  if (s.date !== undefined) row.date = s.date
  if (s.arm !== undefined) row.arm = s.arm
  if (s.format !== undefined) row.format = s.format
  if (s.organizingClubId !== undefined) row.organizing_club_id = s.organizingClubId
  if (s.recordedBy !== undefined) row.recorded_by = s.recordedBy
  if (s.finalRatingA !== undefined) row.final_rating_a = s.finalRatingA
  if (s.finalRatingB !== undefined) row.final_rating_b = s.finalRatingB
  return row
}

function toDomainGame(row: SupermatchGameRow): SupermatchGame {
  return {
    id: row.id,
    supermatchId: row.supermatch_id,
    gameNumber: row.game_number,
    winner: row.winner,
    ratingABefore: row.rating_a_before,
    ratingBBefore: row.rating_b_before,
    ratingAAfter: row.rating_a_after,
    ratingBAfter: row.rating_b_after,
  }
}

function toRowGame(g: Partial<SupermatchGame>): Partial<SupermatchGameRow> {
  const row: Partial<SupermatchGameRow> = {}
  if (g.id !== undefined) row.id = g.id
  if (g.supermatchId !== undefined) row.supermatch_id = g.supermatchId
  if (g.gameNumber !== undefined) row.game_number = g.gameNumber
  if (g.winner !== undefined) row.winner = g.winner
  if (g.ratingABefore !== undefined) row.rating_a_before = g.ratingABefore
  if (g.ratingBBefore !== undefined) row.rating_b_before = g.ratingBBefore
  if (g.ratingAAfter !== undefined) row.rating_a_after = g.ratingAAfter
  if (g.ratingBAfter !== undefined) row.rating_b_after = g.ratingBAfter
  return row
}

export const SupermatchRepository = {
  async getAll(): Promise<Supermatch[]> {
    const { data, error } = await supabase.from(SUPERMATCH_TABLE).select('*')
    if (error) throw error
    return (data as SupermatchRow[]).map(toDomainSupermatch)
  },

  async create(s: Omit<Supermatch, 'id'>): Promise<Supermatch> {
    const { data, error } = await supabase.from(SUPERMATCH_TABLE).insert(toRowSupermatch(s)).select().single()
    if (error) throw error
    return toDomainSupermatch(data as SupermatchRow)
  },

  async createGames(games: Omit<SupermatchGame, 'id'>[]): Promise<SupermatchGame[]> {
    const { data, error } = await supabase.from(GAME_TABLE).insert(games.map(toRowGame)).select()
    if (error) throw error
    return (data as SupermatchGameRow[]).map(toDomainGame)
  },

  async getGamesBySupermatchId(supermatchId: string): Promise<SupermatchGame[]> {
    const { data, error } = await supabase
      .from(GAME_TABLE)
      .select('*')
      .eq('supermatch_id', supermatchId)
      .order('game_number')
    if (error) throw error
    return (data as SupermatchGameRow[]).map(toDomainGame)
  },

  async getByPlayerId(playerId: string): Promise<Supermatch[]> {
    const { data, error } = await supabase
      .from(SUPERMATCH_TABLE)
      .select('*')
      .or(`player_a_id.eq.${playerId},player_b_id.eq.${playerId}`)
    if (error) throw error
    return (data as SupermatchRow[]).map(toDomainSupermatch)
  },

  async getAllByArm(arm: Arm): Promise<Supermatch[]> {
    const { data, error } = await supabase.from(SUPERMATCH_TABLE).select('*').eq('arm', arm)
    if (error) throw error
    return (data as SupermatchRow[]).map(toDomainSupermatch)
  },
}