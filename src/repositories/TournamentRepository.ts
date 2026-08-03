import { supabase } from '../lib/supabaseClient'
import type { Arm } from '../models/Arm'
import type { Tournament } from '../models/Tournament'

const TABLE = 'tournaments'

interface TournamentRow {
  id: string
  name: string
  date: string
  arm: Arm
  organizing_club_id: string | null
  recorded_by: string
}

function toDomain(row: TournamentRow): Tournament {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    arm: row.arm,
    organizingClubId: row.organizing_club_id,
    recordedBy: row.recorded_by,
  }
}

function toRow(t: Partial<Tournament>): Partial<TournamentRow> {
  const row: Partial<TournamentRow> = {}
  if (t.id !== undefined) row.id = t.id
  if (t.name !== undefined) row.name = t.name
  if (t.date !== undefined) row.date = t.date
  if (t.arm !== undefined) row.arm = t.arm
  if (t.organizingClubId !== undefined) row.organizing_club_id = t.organizingClubId
  if (t.recordedBy !== undefined) row.recorded_by = t.recordedBy
  return row
}

export const TournamentRepository = {
  async getAll(): Promise<Tournament[]> {
    const { data, error } = await supabase.from(TABLE).select('*')
    if (error) throw error
    return (data as TournamentRow[]).map(toDomain)
  },

  async getById(id: string): Promise<Tournament | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return toDomain(data as TournamentRow)
  },

  async create(t: Omit<Tournament, 'id'>): Promise<Tournament> {
    const { data, error } = await supabase.from(TABLE).insert(toRow(t)).select().single()
    if (error) throw error
    return toDomain(data as TournamentRow)
  },
}