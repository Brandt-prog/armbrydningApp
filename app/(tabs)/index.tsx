import { useClubs } from '@/src/viewmodels/useClubs';
import { AdminApprovalScreen } from '@/src/views/AdminApprovalScreen';
import { AuthGate } from '@/src/views/AuthGate';
import { LeaderboardScreen } from '@/src/views/LeaderboardScreen';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { clubs } = useClubs();

  return (
    <AuthGate>
      {(currentUser, signOut) => (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Hej, {currentUser.name}</Text>
            <Text style={styles.link} onPress={signOut}>
              Log ud
            </Text>
          </View>

          {currentUser.status === 'active' && (
            <LeaderboardScreen currentUser={currentUser} clubs={clubs} />
          )}

          {(currentUser.roles.includes('club_admin') || currentUser.roles.includes('super_admin')) && (
            <View style={styles.adminSection}>
              <AdminApprovalScreen currentUser={currentUser} />
            </View>
          )}
        </View>
      )}
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  link: { color: '#1D3D47', fontWeight: '600' },
  adminSection: { padding: 16 },
});