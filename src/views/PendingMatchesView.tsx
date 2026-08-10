import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Match } from '../models/Match'
import type { User } from '../models/User'
import { colors, fonts, radius, spacing } from '../theme/theme'

interface PendingMatchesViewProps {
  pendingMatches: Match[]
  activeMembers: User[]
  currentUserId: string
  onConfirm: (matchId: string) => Promise<void>
  onCancel: (matchId: string) => Promise<void>
  error: string | null
}

export function PendingMatchesView({
  pendingMatches,
  activeMembers,
  currentUserId,
  onConfirm,
  onCancel,
  error,
}: PendingMatchesViewProps) {
  function nameFor(userId: string): string {
    if (userId === currentUserId) return 'dig'
    return activeMembers.find((m) => m.id === userId)?.name ?? 'ukendt'
  }

  if (pendingMatches.length === 0) {
    return <Text style={styles.info}>Ingen kampe venter på din bekræftelse.</Text>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>VENTER PÅ DIN BEKRÆFTELSE</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {pendingMatches.map((match) => {
        const winnerName = nameFor(match.winnerId)
        const opponentId = match.playerAId === currentUserId ? match.playerBId : match.playerAId
        return (
          <View key={match.id} style={styles.row}>
            <Text style={styles.text}>
              {nameFor(opponentId)} rapporterede: <Text style={styles.winner}>{winnerName}</Text> vandt (
              {match.arm === 'left' ? 'venstre' : 'højre'})
            </Text>
            <View style={styles.actions}>
              <Pressable style={styles.confirmButton} onPress={() => onConfirm(match.id)}>
                <Text style={styles.buttonText}>BEKRÆFT</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={() => onCancel(match.id)}>
                <Text style={styles.buttonText}>AFVIS</Text>
              </Pressable>
            </View>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md },
  label: { fontSize: 11, letterSpacing: 1, marginBottom: spacing.sm, color: colors.inkMuted, fontFamily: fonts.displayMedium },
  info: { color: colors.inkMuted, fontSize: 13 },
  error: { color: colors.danger, marginBottom: spacing.sm },
  row: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  text: { fontSize: 13, color: colors.ink, marginBottom: spacing.sm },
  winner: { fontFamily: fonts.displayMedium, color: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.xs },
  confirmButton: { flex: 1, backgroundColor: colors.success, borderRadius: radius.sm, paddingVertical: 8, alignItems: 'center' },
  cancelButton: { flex: 1, backgroundColor: colors.danger, borderRadius: radius.sm, paddingVertical: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 0.5 },
})