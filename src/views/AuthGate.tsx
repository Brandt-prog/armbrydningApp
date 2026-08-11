import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import type { User } from '../models/User'
import { useAuth } from '../viewmodels/useAuth'

interface AuthGateProps {
  children: (currentUser: User, signOut: () => Promise<void>) => ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const { currentUser, signOut } = useAuth()

  if (!currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Indlæser...</Text>
      </View>
    )
  }

  return <>{children(currentUser, signOut)}</>
}