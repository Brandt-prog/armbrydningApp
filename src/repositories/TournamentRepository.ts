import { supabase } from '../lib/supabaseClient'
import type { Tournament } from '../models/Tournament'
import type { TournamentResult } from '../models/TournamentResult'

const TOURNAMENT_TABLE = 'tournaments'
const RESULT_TABLE = 'tournament_results'

interface TournamentRow {
  id: string
  name: string
  date: string
  organizing_club_id: string | null
  recorded_by: string
}

interface TournamentResultRow {
  id: string
  tournament_id: string
  user_id: string
  placement: number
  rating_before: number
  rating_after: number
}

function toDomainTournament(row: TournamentRow): Tournament {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    organizingClubId: row.organizing_club_id,
    recordedBy: row.recorded_by,
  }
}

function toRowTournament(t: Partial<Tournament>): Partial<TournamentRow> {
  const row: Partial<TournamentRow> = {}
  if (t.id !== undefined) row.id = t.id
  if (t.name !== undefined) row.name = t.name
  if (t.date !== undefined) row.date = t.date
  if (t.organizingClubId !== undefined) row.organizing_club_id = t.organizingClubId
  if (t.recordedBy !== undefined) row.recorded_by = t.recordedBy
  return row
}

function toDomainResult(row: TournamentResultRow): TournamentResult {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    userId: row.user_id,
    placement: row.placement,
    ratingBefore: row.rating_before,
    ratingAfter: row.rating_after,
  }
}

function toRowResult(r: Partial<TournamentResult>): Partial<TournamentResultRow> {
  const row: Partial<TournamentResultRow> = {}
  if (r.id !== undefined) row.id = r.id
  if (r.tournamentId !== undefined) row.tournament_id = r.tournamentId
  if (r.userId !== undefined) row.user_id = r.userId
  if (r.placement !== undefined) row.placement = r.placement
  if (r.ratingBefore !== undefined) row.rating_before = r.ratingBefore
  if (r.ratingAfter !== undefined) row.rating_after = r.ratingAfter
  return row
}

export const TournamentRepository = {
  async getAll(): Promise<Tournament[]> {
    const { data, error } = await supabase.from(TOURNAMENT_TABLE).select('*')
    if (error) throw error
    return (data as TournamentRow[]).map(toDomainTournament)
  },

  async getById(id: string): Promise<Tournament | null> {
    const { data, error } = await supabase.from(TOURNAMENT_TABLE).select('*').eq('id', id).single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return toDomainTournament(data as TournamentRow)
  },

  async create(t: Omit<Tournament, 'id'>): Promise<Tournament> {
    const { data, error } = await supabase.from(TOURNAMENT_TABLE).insert(toRowTournament(t)).select().single()
    if (error) throw error
    return toDomainTournament(data as TournamentRow)
  },

  async getResultsByUserId(userId: string): Promise<TournamentResult[]> {
    const { data, error } = await supabase.from(RESULT_TABLE).select('*').eq('user_id', userId)
    if (error) throw error
    return (data as TournamentResultRow[]).map(toDomainResult)
  },

  async getResultsByTournamentId(tournamentId: string): Promise<TournamentResult[]> {
    const { data, error } = await supabase.from(RESULT_TABLE).select('*').eq('tournament_id', tournamentId)
    if (error) throw error
    return (data as TournamentResultRow[]).map(toDomainResult)
  },

  async createResult(r: Omit<TournamentResult, 'id'>): Promise<TournamentResult> {
    const { data, error } = await supabase.from(RESULT_TABLE).insert(toRowResult(r)).select().single()
    if (error) throw error
    return toDomainResult(data as TournamentResultRow)
  },
}