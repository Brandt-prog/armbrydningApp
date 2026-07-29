import { supabase } from '../lib/supabaseClient'
import type { Club } from '../models/Club'

const TABLE = 'clubs'

interface ClubRow {
  id: string
  name: string
  location: string | null
  created_date: string
}

function toDomain(row: ClubRow): Club {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    createdDate: row.created_date,
  }
}

function toRow(club: Partial<Club>): Partial<ClubRow> {
  const row: Partial<ClubRow> = {}
  if (club.id !== undefined) row.id = club.id
  if (club.name !== undefined) row.name = club.name
  if (club.location !== undefined) row.location = club.location
  if (club.createdDate !== undefined) row.created_date = club.createdDate
  return row
}

export const ClubRepository = {
  async getAll(): Promise<Club[]> {
    const { data, error } = await supabase.from(TABLE).select('*')
    if (error) throw error
    return (data as ClubRow[]).map(toDomain)
  },

  async getById(id: string): Promise<Club | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return toDomain(data as ClubRow)
  },

  async create(club: Omit<Club, 'id' | 'createdDate'>): Promise<Club> {
    const { data, error } = await supabase.from(TABLE).insert(toRow(club)).select().single()
    if (error) throw error
    return toDomain(data as ClubRow)
  },

  async update(id: string, changes: Partial<Club>): Promise<Club> {
    const { data, error } = await supabase.from(TABLE).update(toRow(changes)).eq('id', id).select().single()
    if (error) throw error
    return toDomain(data as ClubRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
  },
}