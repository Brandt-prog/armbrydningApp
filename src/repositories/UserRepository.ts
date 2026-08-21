import { supabase } from '../lib/supabaseClient'
import type { Gender } from '../models/Gender'
import type { Role } from '../models/Role'
import type { User } from '../models/User'
import type { UserStatus } from '../models/UserStatus'

const TABLE = 'users'

const PUBLIC_COLUMNS =
  'id, name, username, club_id, roles, status, rating_left, rating_left_rd, rating_left_volatility, rating_right, rating_right_rd, rating_right_volatility, gender, consent_date, parental_consent_given, created_date'

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
  parental_consent_given: boolean | null
  created_date: string
}

type PublicUserRow = Omit<UserRow, 'weight' | 'height' | 'birth_date'>

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
    parentalConsentGiven: row.parental_consent_given,
    createdDate: row.created_date,
  }
}

function mapPublicUserRow(row: PublicUserRow): User {
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
    weight: null,
    height: null,
    birthDate: null,
    gender: row.gender,
    consentDate: row.consent_date,
    parentalConsentGiven: row.parental_consent_given,
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
  if (user.parentalConsentGiven !== undefined) row.parental_consent_given = user.parentalConsentGiven
  if (user.createdDate !== undefined) row.created_date = user.createdDate
  return row
}

export const UserRepository = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase.from(TABLE).select(PUBLIC_COLUMNS)
    if (error) throw error
    return (data as PublicUserRow[]).map(mapPublicUserRow)
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from(TABLE).select(PUBLIC_COLUMNS).eq('id', id).single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return mapPublicUserRow(data as PublicUserRow)
  },

  async getByClubId(clubId: string): Promise<User[]> {
    const { data, error } = await supabase.from(TABLE).select(PUBLIC_COLUMNS).eq('club_id', clubId)
    if (error) throw error
    return (data as PublicUserRow[]).map(mapPublicUserRow)
  },

  async getMyFullProfile(): Promise<User | null> {
    const { data, error } = await supabase.rpc('get_my_profile')
    if (error) throw error
    if (!data || !data.id) return null
    return mapUserRow(data as UserRow)
  },

  async getMemberProfileForAdmin(targetUserId: string): Promise<User | null> {
    const { data, error } = await supabase.rpc('get_member_profile_for_admin', { target_user_id: targetUserId })
    if (error) throw error
    if (!data || !data.id) return null
    return mapUserRow(data as UserRow)
  },

  async getClassification(targetUserId: string): Promise<{ ageCategory: string; weightClass: string } | null> {
    const { data, error } = await supabase.rpc('get_classification', { target_user_id: targetUserId })
    if (error) throw error
    if (!data || data.length === 0) return null
    return { ageCategory: data[0].age_category, weightClass: data[0].weight_class }
  },

  async getClassificationsBulk(userIds: string[]): Promise<Map<string, { ageCategory: string; weightClass: string }>> {
    if (userIds.length === 0) return new Map()
    const { data, error } = await supabase.rpc('get_classifications_bulk', { user_ids: userIds })
    if (error) throw error
    const map = new Map<string, { ageCategory: string; weightClass: string }>()
    for (const row of data ?? []) {
      map.set(row.user_id, { ageCategory: row.age_category, weightClass: row.weight_class })
    }
    return map
  },

  async create(user: Omit<User, 'id' | 'createdDate'> & { id?: string }): Promise<User> {
    const { error: insertError } = await supabase.from(TABLE).insert(toRow(user))
    if (insertError) throw insertError

    const { data, error: fetchError } = await supabase.rpc('get_my_profile')
    if (fetchError) throw fetchError
    if (!data || !data.id) throw new Error('Kunne ikke hente den oprettede profil.')
    return mapUserRow(data as UserRow)
  },

  async update(id: string, changes: Partial<User>): Promise<User> {
    const { error: updateError } = await supabase.from(TABLE).update(toRow(changes)).eq('id', id)
    if (updateError) throw updateError

    const { data, error: fetchError } = await supabase.rpc('get_my_profile')
    if (fetchError) throw fetchError
    if (!data || !data.id) throw new Error('Kunne ikke hente den opdaterede profil.')
    return mapUserRow(data as UserRow)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
  },
}