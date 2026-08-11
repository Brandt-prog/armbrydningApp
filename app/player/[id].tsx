import { colors } from '@/src/theme/theme';
import { useClubs } from '@/src/viewmodels/useClubs';
import { useUserById } from '@/src/viewmodels/useUserById';
import { AuthGate } from '@/src/views/AuthGate';
import { PlayerProfileView } from '@/src/views/PlayerProfileView';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function PlayerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clubs } = useClubs();
  const { user, loading, error } = useUserById(id);

  return (
    <AuthGate>
      {(currentUser) => {
        if (loading) {
          return (
            <View style={styles.center}>
              <Text>Indlæser profil...</Text>
            </View>
          );
        }
        if (error || !user) {
          return (
            <View style={styles.center}>
              <Text>Kunne ikke finde spilleren.</Text>
            </View>
          );
        }
        return (
          <PlayerProfileView
            user={user}
            clubs={clubs}
            viewerUserId={currentUser.id}
            isOwnProfile={currentUser.id === user.id}
            showBackButton
          />
        );
      }}
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
});