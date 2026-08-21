import type { Gender } from './Gender'
import type { Role } from './Role'
import type { UserStatus } from './UserStatus'

export interface User {
  id: string
  name: string
  username: string
  clubId: string | null
  roles: Role[]
  status: UserStatus

  ratingLeft: number
  ratingLeftRD: number
  ratingLeftVolatility: number

  ratingRight: number
  ratingRightRD: number
  ratingRightVolatility: number

  weight: number | null
  height: number | null
  birthDate: string | null
  gender: Gender | null

  consentDate: string | null
  parentalConsentGiven: boolean | null
  createdDate: string
}