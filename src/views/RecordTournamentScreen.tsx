import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { User } from '../models/User'
import { recordTournament } from '../services/TournamentService'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { useActiveUsers } from '../viewmodels/useActiveUsers'

interface RecordTournamentScreenProps {
  recordedBy: string
  organizingClubId: string | null
}

interface SelectedParticipant {
  user: User
  placement: number
}

export function RecordTournamentScreen({ recordedBy, organizingClubId }: RecordTournamentScreenProps) {
  const { users, loading } = useActiveUsers()
  const [name, setName] = useState('')
  const [participants, setParticipants] = useState<SelectedParticipant[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function toggleParticipant(user: User) {
    setParticipants((prev) => {
      const exists = prev.find((p) => p.user.id === user.id)
      if (exists) {
        return prev.filter((p) => p.user.id !== user.id)
      }
      return [...prev, { user, placement: prev.length + 1 }]
    })
  }

  function updatePlacement(userId: string, placement: number) {
    setParticipants((prev) => prev.map((p) => (p.user.id === userId ? { ...p, placement } : p)))
  }

  async function handleSubmit() {
    if (!name || participants.length < 2) return
    setSubmitting(true)
    setMessage(null)
    try {
      await recordTournament(
        name,
        new Date().toISOString(),
        organizingClubId,
        recordedBy,
        participants.map((p) => ({ userId: p.user.id, placement: p.placement }))
      )
      setMessage(`"${name}" registreret med ${participants.length} deltagere.`)
      setName('')
      setParticipants([])
    } catch (err) {
      setMessage((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>TURNERINGSNAVN</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Odense Open" />

      <Text style={styles.label}>VÆLG DELTAGERE</Text>
      {loading ? (
        <Text style={styles.info}>Indlæser medlemmer...</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const selected = participants.find((p) => p.user.id === item.id)
            return (
              <Pressable
                style={[styles.userRow, selected && styles.userRowSelected]}
                onPress={() => toggleParticipant(item)}
              >
                <Text style={[styles.userName, selected && { color: '#fff' }]}>{item.name}</Text>
                {selected && (
                  <TextInput
                    style={styles.placementInput}
                    keyboardType="numeric"
                    value={String(selected.placement)}
                    onChangeText={(v) => updatePlacement(item.id, Number(v) || 1)}
                  />
                )}
              </Pressable>
            )
          }}
        />
      )}

      <Pressable
        style={[styles.button, (submitting || !name || participants.length < 2) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting || !name || participants.length < 2}
      >
        <Text style={styles.buttonText}>{submitting ? 'REGISTRERER...' : 'REGISTRÉR TURNERING'}</Text>
      </Pressable>

      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    color: colors.inkMuted,
    fontFamily: fonts.displayMedium,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  info: { color: colors.inkMuted },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  userRowSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  userName: { color: colors.ink, fontWeight: '600' },
  placementInput: {
    backgroundColor: '#fff',
    borderRadius: 6,
    width: 40,
    textAlign: 'center',
    paddingVertical: 4,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 14,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontFamily: fonts.displayMedium, fontSize: 13, letterSpacing: 0.5 },
  message: { marginTop: spacing.md, color: colors.success, textAlign: 'center' },
})