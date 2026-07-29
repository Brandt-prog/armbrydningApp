import { AdminApprovalScreen } from '@/src/views/AdminApprovalScreen';
import { AuthGate } from '@/src/views/AuthGate';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <AuthGate>
      {(currentUser, signOut) => (
        <View style={styles.container}>
          <Text style={styles.title}>Velkommen, {currentUser.name}!</Text>
          <Text>Brugernavn: {currentUser.username}</Text>
          <Text>Status: {currentUser.status}</Text>
          <Text>Rating: {currentUser.rating}</Text>
          <Text>Roller: {currentUser.roles.join(', ')}</Text>
          <Text style={styles.link} onPress={signOut}>
            Log ud
          </Text>

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
  container: {
    flex: 1,
    padding: 24,
    gap: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  link: {
    marginTop: 20,
    color: '#1D3D47',
    fontWeight: '600',
  },
  adminSection: {
    marginTop: 24,
    flex: 1,
  },
});