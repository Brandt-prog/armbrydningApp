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
        </View>
      )}
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  link: {
    marginTop: 20,
    color: '#1D3D47',
    fontWeight: '600',
  },
});