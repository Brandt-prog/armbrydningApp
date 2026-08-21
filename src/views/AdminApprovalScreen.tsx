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
          renderItem={({ item }) => {
            const isMinor = item.parentalConsentGiven !== null
            return (
              <View style={[styles.row, isMinor && styles.rowMinor]}>
                <View style={styles.rowInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    {isMinor && (
                      <View style={styles.minorBadge}>
                        <Text style={styles.minorBadgeText}>MINDREÅRIG</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.username}>@{item.username}</Text>
                  {isMinor && (
                    <Text style={styles.minorHint}>
                      Har selv bekræftet forældresamtykke — verificér gerne, før du godkender.
                    </Text>
                  )}
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
            )
          }}
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
  rowMinor: { borderColor: '#F0C36D', borderWidth: 2 },
  rowInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontSize: 16, fontWeight: '600', color: colors.ink },
  minorBadge: { backgroundColor: '#FFF3E0', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8, borderWidth: 1, borderColor: '#F0C36D' },
  minorBadgeText: { fontSize: 9, color: '#8A6416', fontFamily: fonts.displayMedium, letterSpacing: 0.3 },
  username: { fontSize: 13, color: colors.inkMuted },
  minorHint: { fontSize: 11, color: '#8A6416', marginTop: 4, maxWidth: 260 },
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