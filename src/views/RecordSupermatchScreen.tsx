import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { Arm } from '../models/Arm'
import type { GameWinner } from '../models/SupermatchGame'
import type { User } from '../models/User'
import { recordSupermatch } from '../services/SupermatchService'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { useActiveUsers } from '../viewmodels/useActiveUsers'

interface RecordSupermatchScreenProps {
  recordedBy: string
  organizingClubId: string | null
}

export function RecordSupermatchScreen({ recordedBy, organizingClubId }: RecordSupermatchScreenProps) {
  const { users, loading } = useActiveUsers()
  const [arm, setArm] = useState<Arm>('right')
  const [playerA, setPlayerA] = useState<User | null>(null)
  const [playerB, setPlayerB] = useState<User | null>(null)
  const [games, setGames] = useState<GameWinner[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function addGame(winner: GameWinner) {
    setGames((prev) => [...prev, winner])
  }
  function removeLastGame() {
    setGames((prev) => prev.slice(0, -1))
  }

  async function handleSubmit() {
    if (!playerA || !playerB || games.length === 0) return
    setSubmitting(true)
    setMessage(null)
    try {
      await recordSupermatch(
        playerA.id,
        playerB.id,
        new Date().toISOString(),
        arm,
        `best_of_${games.length}`,
        organizingClubId,
        recordedBy,
        games
      )
      const aWins = games.filter((g) => g === 'A').length
      const bWins = games.filter((g) => g === 'B').length
      setMessage(`Supermatch registreret: ${playerA.name} ${aWins} - ${bWins} ${playerB.name}`)
      setPlayerA(null)
      setPlayerB(null)
      setGames([])
    } catch (err) {
      setMessage((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Text style={styles.info}>Indlæser medlemmer...</Text>

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>ARM</Text>
      <View style={styles.armRow}>
        <Pressable style={[styles.armChip, arm === 'right' && styles.armChipSelected]} onPress={() => setArm('right')}>
          <Text style={[styles.armChipText, arm === 'right' && { color: '#fff' }]}>Højre</Text>
        </Pressable>
        <Pressable style={[styles.armChip, arm === 'left' && styles.armChipSelected]} onPress={() => setArm('left')}>
          <Text style={[styles.armChipText, arm === 'left' && { color: '#fff' }]}>Venstre</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>SPILLER A</Text>
      <View style={styles.pickerRow}>
        {users.map((u) => (
          <Pressable key={u.id} style={[styles.pickChip, playerA?.id === u.id && styles.pickChipSelected]} onPress={() => setPlayerA(u)}>
            <Text style={[styles.pickChipText, playerA?.id === u.id && { color: '#fff' }]}>{u.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>SPILLER B</Text>
      <View style={styles.pickerRow}>
        {users.filter((u) => u.id !== playerA?.id).map((u) => (
          <Pressable key={u.id} style={[styles.pickChip, playerB?.id === u.id && styles.pickChipSelected]} onPress={() => setPlayerB(u)}>
            <Text style={[styles.pickChipText, playerB?.id === u.id && { color: '#fff' }]}>{u.name}</Text>
          </Pressable>
        ))}
      </View>

      {playerA && playerB && (
        <>
          <Text style={styles.label}>REGISTRÉR SPIL ({games.length} spillet)</Text>
          <Text style={styles.score}>
            {playerA.name} {games.filter((g) => g === 'A').length} — {games.filter((g) => g === 'B').length} {playerB.name}
          </Text>

          <View style={styles.gameButtons}>
            <Pressable style={styles.gameButtonA} onPress={() => addGame('A')}>
              <Text style={styles.gameButtonText}>{playerA.name} VANDT</Text>
            </Pressable>
            <Pressable style={styles.gameButtonB} onPress={() => addGame('B')}>
              <Text style={styles.gameButtonText}>{playerB.name} VANDT</Text>
            </Pressable>
          </View>

          {games.length > 0 && (
            <Pressable onPress={removeLastGame}>
              <Text style={styles.undoText}>Fortryd sidste spil</Text>
            </Pressable>
          )}

          <Pressable style={[styles.button, (submitting || games.length === 0) && styles.buttonDisabled]} onPress={handleSubmit} disabled={submitting || games.length === 0}>
            <Text style={styles.buttonText}>{submitting ? 'REGISTRERER...' : 'AFSLUT OG REGISTRÉR SUPERMATCH'}</Text>
          </Pressable>
        </>
      )}

      {message && <Text style={styles.message}>{message}</Text>}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md },
  label: { fontSize: 11, letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.md, color: colors.inkMuted, fontFamily: fonts.displayMedium },
  info: { color: colors.inkMuted, padding: spacing.md },
  armRow: { flexDirection: 'row', gap: spacing.xs },
  armChip: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 8, alignItems: 'center', backgroundColor: colors.surface },
  armChipSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  armChipText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pickChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.surface },
  pickChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pickChipText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  score: { fontSize: 20, fontFamily: fonts.display, color: colors.ink, textAlign: 'center', marginVertical: spacing.sm },
  gameButtons: { flexDirection: 'row', gap: spacing.sm },
  gameButtonA: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  gameButtonB: { flex: 1, backgroundColor: colors.primaryDark, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  gameButtonText: { color: '#fff', fontFamily: fonts.displayMedium, fontSize: 12, textAlign: 'center' },
  undoText: { textAlign: 'center', color: colors.inkMuted, marginTop: spacing.sm, textDecorationLine: 'underline' },
  button: { backgroundColor: colors.success, borderRadius: radius.md, padding: 14, marginTop: spacing.lg, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontFamily: fonts.displayMedium, fontSize: 12, letterSpacing: 0.5 },
  message: { marginTop: spacing.md, color: colors.success, textAlign: 'center', marginBottom: spacing.xl },
})