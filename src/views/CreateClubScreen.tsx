import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { ClubRepository } from '../repositories/ClubRepository'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { useClubs } from '../viewmodels/useClubs'

export function CreateClubScreen() {
  const { clubs, loading, refresh } = useClubs()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit() {
    if (!name.trim()) return
    setSubmitting(true)
    setMessage(null)
    try {
      await ClubRepository.create({
        name: name.trim(),
        location: location.trim() || null,
      })
      setMessage(`"${name}" oprettet.`)
      setName('')
      setLocation('')
      refresh()
    } catch (err) {
      setMessage((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>KLUBNAVN</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Armbrydning 5000"
        placeholderTextColor={colors.inkMuted}
      />

      <Text style={styles.label}>LOKATION (VALGFRIT)</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Odense"
        placeholderTextColor={colors.inkMuted}
      />

      <Pressable
        style={[styles.button, (!name.trim() || submitting) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!name.trim() || submitting}
      >
        <Text style={styles.buttonText}>{submitting ? 'OPRETTER...' : 'OPRET KLUB'}</Text>
      </Pressable>

      {message && <Text style={styles.message}>{message}</Text>}

      <Text style={[styles.label, { marginTop: spacing.lg }]}>EKSISTERENDE KLUBBER</Text>
      {loading ? (
        <Text style={styles.info}>Indlæser...</Text>
      ) : (
        <FlatList
          data={clubs}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.clubRow}>
              <Text style={styles.clubName}>{item.name}</Text>
              {item.location && <Text style={styles.clubLocation}>{item.location}</Text>}
            </View>
          )}
        />
      )}
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
  info: { color: colors.inkMuted },
  clubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clubName: { color: colors.ink, fontWeight: '600' },
  clubLocation: { color: colors.inkMuted, fontSize: 13 },
})