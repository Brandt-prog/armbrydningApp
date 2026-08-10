import { colors, fonts, spacing } from '@/src/theme/theme';
import { useClubs } from '@/src/viewmodels/useClubs';
import { AdminApprovalScreen } from '@/src/views/AdminApprovalScreen';
import { AuthGate } from '@/src/views/AuthGate';
import { LeaderboardScreen } from '@/src/views/LeaderboardScreen';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { clubs } = useClubs();

  return (
    <AuthGate>
      {(currentUser, signOut) => {
        const isAdmin = currentUser.roles.includes('club_admin') || currentUser.roles.includes('super_admin');

        return (
          <ScrollView style={styles.container}>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>ARMBRYDNING</Text>
                <Text style={styles.title}>{currentUser.name}</Text>
              </View>
              <Text style={styles.link} onPress={signOut}>Log ud</Text>
            </View>

            {currentUser.status === 'active' && (
              <LeaderboardScreen currentUser={currentUser} clubs={clubs} />
            )}

            {isAdmin && (
              <View style={styles.adminSection}>
                <AdminApprovalScreen currentUser={currentUser} />
              </View>
            )}
          </ScrollView>
        );
      }}
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  eyebrow: { color: '#fff', opacity: 0.75, fontSize: 11, letterSpacing: 1.5, fontFamily: fonts.displayMedium },
  title: { fontSize: 26, color: '#fff', fontFamily: fonts.display, marginTop: 4 },
  link: { color: '#fff', fontWeight: '600', paddingBottom: 4 },
  adminSection: { padding: spacing.md, backgroundColor: colors.background },
});