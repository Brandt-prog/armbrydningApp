import { useClubs } from '@/src/viewmodels/useClubs';
import { AuthGate } from '@/src/views/AuthGate';
import { MatchmakingScreen } from '@/src/views/MatchmakingScreen';

export default function MatchmakingTab() {
  const { clubs } = useClubs();

  return (
    <AuthGate>
      {(currentUser) => <MatchmakingScreen currentUser={currentUser} clubs={clubs} />}
    </AuthGate>
  );
}