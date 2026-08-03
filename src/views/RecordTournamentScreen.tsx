import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import type { Arm } from '../models/Arm'
import type { Tournament } from '../models/Tournament'
import type { User } from '../models/User'
import { createTournament, recordTournamentMatch } from '../services/TournamentService'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { useActiveUsers } from '../viewmodels/useActiveUsers'

interface RecordTournamentScreenProps {
  recordedBy: string
  organizingClubId: string | null
}

interface RecordedMatchRow {
  id: string
  playerAName: string
  playerBName: string
  winnerName: string
}

const MAX_SUGGESTIONS = 6

function PlayerSearchPicker({
  label,
  users,
  excludeId,
  selected,
  onSelect,
}: {
  label: string
  users: User[]
  excludeId?: string
  selected: User | null
  onSelect: (user: User) => void
}) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (query.trim().length === 0) return []
    const lower = query.toLowerCase()
    return users
      .filter((u) => u.id !== excludeId)
      .filter((u) => u.name.toLowerCase().includes(lower) || u.username.toLowerCase().includes(lower))
      .slice(0, MAX_SUGGESTIONS)
  }, [users, excludeId, query])

  if (selected) {
    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={styles.selectedRow}
          onPress={() => {
            onSelect(null as unknown as User)
            setQuery('')
          }}
        >
          <Text style={styles.selectedName}>{selected.name}</Text>
          <Text style={styles.selectedClear}>SKIFT</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Søg efter navn..."
        placeholderTextColor={colors.inkMuted}
      />
      {results.length > 0 && (
        <View style={styles.suggestionsBox}>
          {results.map((u) => (
            <Pressable
              key={u.id}
              style={styles.suggestionRow}
              onPress={() => {
                onSelect(u)
                setQuery('')
              }}
            >
              <Text style={styles.suggestionName}>{u.name}</Text>
              <Text style={styles.suggestionUsername}>@{u.username}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {query.length > 0 && results.length === 0 && (
        <Text style={styles.noResults}>Ingen medlemmer matcher "{query}"</Text>
      )}
    </View>
  )
}

export function RecordTournamentScreen({ recordedBy, organizingClubId }: RecordTournamentScreenProps) {
  const { users, loading } = useActiveUsers()
  const [name, setName] = useState('')
  const [arm, setArm] = useState<Arm>('right')
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [playerA, setPlayerA] = useState<User | null>(null)
  const [playerB, setPlayerB] = useState<User | null>(null)
  const [recordedMatches, setRecordedMatches] = useState<RecordedMatchRow[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreateTournament() {
    if (!name) return
    setSubmitting(true)
    setError(null)
    try {
      const t = await createTournament(name, new Date().toISOString(), arm, organizingClubId, recordedBy)
      setTournament(t)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRecordMatch(winner: User) {
    if (!tournament || !playerA || !playerB) return
    setSubmitting(true)
    setError(null)
    try {
      const match = await recordTournamentMatch(tournament.id, playerA.id, playerB.id, winner.id)
      setRecordedMatches((prev) => [
        ...prev,
        {
          id: match.id,
          playerAName: playerA.name,
          playerBName: playerB.name,
          winnerName: winner.name,
        },
      ])
      setPlayerA(null)
      setPlayerB(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleFinish() {
    setTournament(null)
    setName('')
    setRecordedMatches([])
    setPlayerA(null)
    setPlayerB(null)
  }

  if (loading) return <Text style={styles.info}>Indlæser medlemmer...</Text>

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>TURNERINGSNAVN</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Odense Open" />

        <Text style={styles.label}>ARM</Text>
        <View style={styles.armRow}>
          <Pressable
            style={[styles.armChip, arm === 'right' && styles.armChipSelected]}
            onPress={() => setArm('right')}
          >
            <Text style={[styles.armChipText, arm === 'right' && { color: '#fff' }]}>Højre</Text>
          </Pressable>
          <Pressable
            style={[styles.armChip, arm === 'left' && styles.armChipSelected]}
            onPress={() => setArm('left')}
          >
            <Text style={[styles.armChipText, arm === 'left' && { color: '#fff' }]}>Venstre</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.button, (!name || submitting) && styles.buttonDisabled]}
          onPress={handleCreateTournament}
          disabled={!name || submitting}
        >
          <Text style={styles.buttonText}>{submitting ? 'OPRETTER...' : 'START TURNERING'}</Text>
        </Pressable>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.tournamentTitle}>{tournament.name}</Text>
      <Text style={styles.hint}>
        Registrér hver enkelt kamp, som den spilles — enhver runde, vinder- eller taberbracket.
      </Text>

      <PlayerSearchPicker label="SPILLER A" users={users} selected={playerA} onSelect={setPlayerA} />
      <PlayerSearchPicker
        label="SPILLER B"
        users={users}
        excludeId={playerA?.id}
        selected={playerB}
        onSelect={setPlayerB}
      />

      {playerA && playerB && (
        <View style={styles.winnerButtons}>
          <Pressable
            style={styles.winnerButtonA}
            onPress={() => handleRecordMatch(playerA)}
            disabled={submitting}
          >
            <Text style={styles.winnerButtonText}>{playerA.name} VANDT</Text>
          </Pressable>
          <Pressable
            style={styles.winnerButtonB}
            onPress={() => handleRecordMatch(playerB)}
            disabled={submitting}
          >
            <Text style={styles.winnerButtonText}>{playerB.name} VANDT</Text>
          </Pressable>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {recordedMatches.length > 0 && (
        <View style={styles.recordedWrap}>
          <Text style={styles.label}>REGISTREREDE KAMPE ({recordedMatches.length})</Text>
          {recordedMatches.map((m) => (
            <View key={m.id} style={styles.recordedRow}>
              <Text style={styles.recordedText}>
                {m.playerAName} vs {m.playerBName} — <Text style={styles.recordedWinner}>{m.winnerName}</Text> vandt
              </Text>
            </View>
          ))}
        </View>
      )}

      <Pressable style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>AFSLUT TURNERING</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md },
  tournamentTitle: { fontSize: 20, fontFamily: fonts.display, color: colors.ink },
  hint: { fontSize: 12, color: colors.inkMuted, marginTop: 4, marginBottom: spacing.md },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    color: colors.inkMuted,
    fontFamily: fonts.displayMedium,
  },
  info: { color: colors.inkMuted, padding: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  armRow: { flexDirection: 'row', gap: spacing.xs },
  armChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  armChipSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  armChipText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  selectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.surface,
  },
  selectedName: { fontSize: 15, fontWeight: '600', color: colors.ink },
  selectedClear: { fontSize: 11, color: colors.primary, fontFamily: fonts.displayMedium },
  suggestionsBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginTop: 4,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  suggestionName: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  suggestionUsername: { color: colors.inkMuted, fontSize: 12 },
  noResults: { fontSize: 12, color: colors.inkMuted, marginTop: 4 },
  winnerButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  winnerButtonA: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  winnerButtonB: { flex: 1, backgroundColor: colors.primaryDark, borderRadius: radius.md, padding: 14, alignItems: 'center' },
  winnerButtonText: { color: '#fff', fontFamily: fonts.displayMedium, fontSize: 12, textAlign: 'center' },
  recordedWrap: { marginTop: spacing.lg },
  recordedRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  recordedText: { fontSize: 13, color: colors.ink },
  recordedWinner: { fontFamily: fonts.displayMedium, color: colors.success },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 14,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontFamily: fonts.displayMedium, fontSize: 13, letterSpacing: 0.5 },
  finishButton: {
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    padding: 14,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  finishButtonText: { color: '#fff', fontFamily: fonts.displayMedium, fontSize: 12, letterSpacing: 0.5 },
  error: { color: colors.danger, marginTop: spacing.sm, textAlign: 'center' },
})