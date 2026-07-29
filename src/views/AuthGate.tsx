import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import type { User } from '../models/User'
import { useAuth } from '../viewmodels/useAuth'
import { CompleteProfileScreen } from './CompleteProfileScreen'
import { LoginScreen } from './LoginScreen'

interface AuthGateProps {
  children: (currentUser: User, signOut: () => Promise<void>) => ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const { status, currentUser, error, signUp, signIn, completeProfile, signOut } = useAuth()

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Indlæser...</Text>
      </View>
    )
  }

  if (status === 'signed_out') {
    return <LoginScreen onSignUp={signUp} onSignIn={signIn} error={error} />
  }

  if (status === 'needs_profile') {
    return <CompleteProfileScreen onComplete={completeProfile} error={error} />
  }

  if (!currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Noget gik galt — prøv at genstarte appen.</Text>
      </View>
    )
  }

  return <>{children(currentUser, signOut)}</>
}