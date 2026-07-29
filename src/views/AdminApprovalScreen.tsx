import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { User } from '../models/User'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { usePendingMembers } from '../viewmodels/usePendingMembers'

interface AdminApprovalScreenProps {
  currentUser: User
}

export function AdminApprovalScreen({ currentUser }: AdminApprovalScreenProps) {
  const { pendingMembers, loading, error, approve, reject } = usePendingMembers(currentUser)

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>Indlæser ventende medlemmer...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>ADMINISTRATION</Text>
      <Text style={styles.title}>Ventende medlemmer</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      {pendingMembers.length === 0 ? (
        <Text style={styles.info}>Ingen medlemmer venter på godkendelse.</Text>
      ) : (
        <FlatList
          data={pendingMembers}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.approveButton} onPress={() => approve(item.id)}>
                  <Text style={styles.buttonText}>GODKEND</Text>
                </Pressable>
                <Pressable style={styles.rejectButton} onPress={() => reject(item.id)}>
                  <Text style={styles.buttonText}>AFVIS</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { padding: spacing.md },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: fonts.displayMedium,
  },
  title: { fontSize: 20, fontFamily: fonts.display, marginBottom: spacing.md, color: colors.ink, marginTop: 4 },
  info: { color: colors.inkMuted, fontSize: 14 },
  error: { color: colors.danger, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: colors.ink },
  username: { fontSize: 13, color: colors.inkMuted },
  actions: { flexDirection: 'row', gap: spacing.xs },
  approveButton: {
    backgroundColor: colors.success,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rejectButton: {
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: { color: '#fff', fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 0.5 },
})