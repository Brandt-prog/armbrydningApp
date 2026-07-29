import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { useClubs } from '../viewmodels/useClubs'

interface CompleteProfileScreenProps {
  onComplete: (profile: {
    name: string
    clubId: string
    weight: number | null
    height: number | null
    birthDate: string
    gender: 'male' | 'female'
  }) => Promise<void>
  error: string | null
}

export function CompleteProfileScreen({ onComplete, error }: CompleteProfileScreenProps) {
  const { clubs, loading: loadingClubs } = useClubs()
  const [name, setName] = useState('')
  const [clubId, setClubId] = useState<string | null>(null)
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!consent || !clubId || !name || !birthDate) return
    setSubmitting(true)
    try {
      await onComplete({
        name,
        clubId,
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        birthDate,
        gender,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>TRIN 2 AF 2</Text>
      <Text style={styles.title}>Fuldfør din profil</Text>

      <Text style={styles.label}>NAVN</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.inkMuted} />

      <Text style={styles.label}>KLUB</Text>
      {loadingClubs ? (
        <Text style={styles.info}>Indlæser klubber...</Text>
      ) : (
        <View>
          {clubs.map((club) => (
            <Pressable
              key={club.id}
              style={[styles.option, clubId === club.id && styles.optionSelected]}
              onPress={() => setClubId(club.id)}
            >
              <Text style={[styles.optionText, clubId === club.id && styles.optionTextSelected]}>
                {club.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.label}>FØDSELSDATO (ÅÅÅÅ-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="1995-05-15"
        placeholderTextColor={colors.inkMuted}
      />

      <Text style={styles.label}>KØN</Text>
      <View style={styles.genderRow}>
        <Pressable
          style={[styles.genderOption, gender === 'male' && styles.optionSelected]}
          onPress={() => setGender('male')}
        >
          <Text style={[styles.optionText, gender === 'male' && styles.optionTextSelected]}>Mand</Text>
        </Pressable>
        <Pressable
          style={[styles.genderOption, gender === 'female' && styles.optionSelected]}
          onPress={() => setGender('female')}
        >
          <Text style={[styles.optionText, gender === 'female' && styles.optionTextSelected]}>Kvinde</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>VÆGT (KG, VALGFRIT)</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        placeholderTextColor={colors.inkMuted}
      />

      <Text style={styles.label}>HØJDE (CM, VALGFRIT)</Text>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        placeholderTextColor={colors.inkMuted}
      />

      <View style={styles.consentRow}>
        <Switch value={consent} onValueChange={setConsent} trackColor={{ true: colors.primary }} />
        <Text style={styles.consentText}>
          Jeg accepterer, at mit navn og min rating vises på den nationale rangliste
        </Text>
      </View>

      <Pressable
        style={[styles.button, (!consent || !clubId) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting || !consent || !clubId}
      >
        <Text style={styles.buttonText}>{submitting ? 'OPRETTER...' : 'OPRET PROFIL'}</Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.background },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: fonts.displayMedium,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.display,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    textAlign: 'center',
    color: colors.ink,
  },
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
    padding: 14,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  info: { color: colors.inkMuted },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionText: { color: colors.ink, fontWeight: '600' },
  optionTextSelected: { color: '#fff' },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  consentRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, gap: spacing.sm },
  consentText: { flex: 1, fontSize: 13, color: colors.ink },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 16,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 15, fontFamily: fonts.displayMedium, letterSpacing: 0.5 },
  error: { color: colors.danger, marginTop: spacing.md, textAlign: 'center' },
})