import { supabase } from '../lib/supabaseClient'
import type { Gender } from '../models/Gender'
import type { Role } from '../models/Role'
import type { User } from '../models/User'
import type { UserStatus } from '../models/UserStatus'

const TABLE = 'users'

interface UserRow {
  id: string
  name: string
  username: string
  club_id: string | null
  roles: Role[]
  status: UserStatus
  rating_left: number
  rating_left_rd: number
  rating_left_volatility: number
  rating_right: number
  rating_right_rd: number
  rating_right_volatility: number
  weight: number | null
  height: number | null
  birth_date: string | null
  gender: Gender | null
  consent_date: string | null
  created_date: string
}

export function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    clubId: row.club_id,
    roles: row.roles,
    status: row.status,
    ratingLeft: row.rating_left,
    ratingLeftRD: row.rating_left_rd,
    ratingLeftVolatility: row.rating_left_volatility,
    ratingRight: row.rating_right,
    ratingRightRD: row.rating_right_rd,
    ratingRightVolatility: row.rating_right_volatility,
    weight: row.weight,
    height: row.height,
    birthDate: row.birth_date,
    gender: row.gender,
    consentDate: row.consent_date,
    createdDate: row.created_date,
  }
}

function toRow(user: Partial<User>): Partial<UserRow> {
  const row: Partial<UserRow> = {}
  if (user.id !== undefined) row.id = user.id
  if (user.name !== undefined) row.name = user.name
  if (user.username !== undefined) row.username = user.username
  if (user.clubId !== undefined) row.club_id = user.clubId
  if (user.roles !== undefined) row.roles = user.roles
  if (user.status !== undefined) row.status = user.status
  if (user.ratingLeft !== undefined) row.rating_left = user.ratingLeft
  if (user.ratingLeftRD !== undefined) row.rating_left_rd = user.ratingLeftRD
  if (user.ratingLeftVolatility !== undefined) row.rating_left_volatility = user.ratingLeftVolatility
  if (user.ratingRight !== undefined) row.rating_right = user.ratingRight
  if (user.ratingRightRD !== undefined) row.rating_right_rd = user.ratingRightRD
  if (user.ratingRightVolatility !== undefined) row.rating_right_volatility = user.ratingRightVolatility
  if (user.weight !== undefined) row.weight = user.weight
  if (user.height !== undefined) row.height = user.height
  if (user.birthDate !== undefined) row.birth_date = user.birthDate
  if (user.gender !== undefined) row.gender = user.gender
  if (user.consentDate !== undefined) row.consent_date = user.consentDate
  if (user.createdDate !== undefined) row.created_date = user.createdDate
  return row
}

export const UserRepository = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase.from(TABLE).select('*')
    if (error) throw error
    return (data as UserRow[]).map(mapUserRow)
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return mapUserRow(data as UserRow)
  },

  async getByClubId(clubId: string): Promise<User[]> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('club_id', clubId)
    if (error) throw error
    return (data as UserRow[]).map(mapUserRow)
  },

  async create(user: Omit<User, 'id' | 'createdDate'> & { id?: string }): Promise<User> {
    const { data, error } = await supabase.from(TABLE).insert(toRow(user)).select().single()
    if (error) throw error
    return mapUserRow(data as UserRow)
  },

  async update(id: string, changes: Partial<User>): Promise<User> {
    const { data, error } = await supabase.from(TABLE).update(toRow(changes)).eq('id', id).select().single()
    if (error) throw error
    return mapUserRow(data as UserRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
  },
}