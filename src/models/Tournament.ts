import type { Arm } from './Arm'

export interface Tournament {
  id: string
  name: string
  date: string
  arm: Arm
  organizingClubId: string | null
  recordedBy: string
}