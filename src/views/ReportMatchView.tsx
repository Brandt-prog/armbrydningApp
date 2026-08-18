import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { PlayerSearchPicker } from '../components/PlayerSearchPicker'
import type { Arm } from '../models/Arm'
import type { User } from '../models/User'
import { colors, fonts, radius, spacing } from '../theme/theme'

interface ReportMatchViewProps {
  currentUserId: string
  activeMembers: User[]
  onReport: (opponentId: string, winnerId: string, arm: Arm) => Promise<void>
  error: string | null
}

export function ReportMatchView({ currentUserId, activeMembers, onReport, error }: ReportMatchViewProps) {
  const [opponent, setOpponent] = useState<User | null>(null)
  const [arm, setArm] = useState<Arm>('right')
  const [winner, setWinner] = useState<'me' | 'opponent'>('me')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    if (!opponent) return
    setSubmitting(true)
    setSuccess(false)
    try {
      const winnerId = winner === 'me' ? currentUserId : opponent.id
      await onReport(opponent.id, winnerId, arm)
      setSuccess(true)
      setOpponent(null)
    } catch {
      // error surfaced via `error` prop
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>RAPPORTÉR EN KAMP</Text>

      <PlayerSearchPicker
        label="MODSTANDER"
        users={activeMembers}
        excludeId={currentUserId}
        selected={opponent}
        onSelect={setOpponent}
      />

      <Text style={styles.sublabel}>ARM</Text>
      <View style={styles.armRow}>
        <Pressable style={[styles.chip, arm === 'right' && styles.chipSelected]} onPress={() => setArm('right')}>
          <Text style={[styles.chipText, arm === 'right' && { color: '#fff' }]}>Højre</Text>
        </Pressable>
        <Pressable style={[styles.chip, arm === 'left' && styles.chipSelected]} onPress={() => setArm('left')}>
          <Text style={[styles.chipText, arm === 'left' && { color: '#fff' }]}>Venstre</Text>
        </Pressable>
      </View>

      <Text style={styles.sublabel}>VINDER</Text>
      <View style={styles.armRow}>
        <Pressable style={[styles.chip, winner === 'me' && styles.chipSelected]} onPress={() => setWinner('me')}>
          <Text style={[styles.chipText, winner === 'me' && { color: '#fff' }]}>Jeg vandt</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, winner === 'opponent' && styles.chipSelected]}
          onPress={() => setWinner('opponent')}
        >
          <Text style={[styles.chipText, winner === 'opponent' && { color: '#fff' }]}>Modstanderen vandt</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.button, (submitting || !opponent) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting || !opponent}
      >
        <Text style={styles.buttonText}>{submitting ? 'RAPPORTERER...' : 'RAPPORTÉR RESULTAT'}</Text>
      </Pressable>

      {success && <Text style={styles.success}>Rapporteret! Venter på modstanderens bekræftelse.</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md },
  label: { fontSize: 11, letterSpacing: 1, marginBottom: spacing.sm, color: colors.inkMuted, fontFamily: fonts.displayMedium },
  sublabel: { fontSize: 10, letterSpacing: 1, marginTop: spacing.sm, marginBottom: spacing.xs, color: colors.inkMuted, fontFamily: fonts.displayMedium },
  armRow: { flexDirection: 'row', gap: spacing.xs },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 14, marginTop: spacing.lg, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontFamily: fonts.displayMedium, fontSize: 13, letterSpacing: 0.5 },
  success: { marginTop: spacing.md, color: colors.success, textAlign: 'center' },
  error: { marginTop: spacing.md, color: colors.danger, textAlign: 'center' },
})