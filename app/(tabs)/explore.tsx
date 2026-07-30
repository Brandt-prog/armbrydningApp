import { useClubs } from '@/src/viewmodels/useClubs';
import { AuthGate } from '@/src/views/AuthGate';
import { ProfileScreen } from '@/src/views/ProfileScreen';

export default function ExploreScreen() {
  const { clubs } = useClubs();

  return (
    <AuthGate>
      {(currentUser, signOut) => (
        <ProfileScreen currentUser={currentUser} clubs={clubs} onSignOut={signOut} />
      )}
    </AuthGate>
  );
}