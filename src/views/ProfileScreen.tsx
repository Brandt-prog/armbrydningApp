import type { Club } from '../models/Club'
import type { User } from '../models/User'
import { PlayerProfileView } from './PlayerProfileView'

interface ProfileScreenProps {
  currentUser: User
  clubs: Club[]
  onSignOut: () => Promise<void>
}

export function ProfileScreen({ currentUser, clubs, onSignOut }: ProfileScreenProps) {
  return <PlayerProfileView user={currentUser} clubs={clubs} isOwnProfile onSignOut={onSignOut} />
}