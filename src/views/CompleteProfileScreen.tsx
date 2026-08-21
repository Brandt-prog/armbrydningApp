import { useMemo, useState } from 'react'
import { Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { useClubs } from '../viewmodels/useClubs'
import { PrivacyPolicyContent } from './PrivacyPolicyContent'

interface CompleteProfileScreenProps {
  onComplete: (profile: {
    name: string
    clubId: string
    weight: number | null
    height: number | null
    birthDate: string
    gender: 'male' | 'female'
    parentalConsentGiven: boolean | null
  }) => Promise<void>
  error: string | null
}

function calculateAge(birthDateStr: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDateStr)) return null
  const birthDate = new Date(birthDateStr)
  if (isNaN(birthDate.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
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
  const [parentalConsent, setParentalConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const age = useMemo(() => calculateAge(birthDate), [birthDate])
  const isMinor = age !== null && age < 18

  const missingClub = attemptedSubmit && !clubId
  const missingName = attemptedSubmit && !name.trim()
  const missingBirthDate = attemptedSubmit && !birthDate.trim()

  async function handleSubmit() {
    setAttemptedSubmit(true)
    if (!consent || !clubId || !name.trim() || !birthDate.trim()) return
    if (isMinor && !parentalConsent) return

    setSubmitting(true)
    try {
      await onComplete({
        name,
        clubId,
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        birthDate,
        gender,
        parentalConsentGiven: isMinor ? parentalConsent : null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={20}
    >
      <Text style={styles.eyebrow}>TRIN 2 AF 2</Text>
      <Text style={styles.title}>Fuldfør din profil</Text>

      <Text style={styles.label}>NAVN {missingName && <Text style={styles.requiredError}>— påkrævet</Text>}</Text>
      <TextInput
        style={[styles.input, missingName && styles.inputError]}
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.inkMuted}
      />

      <Text style={styles.label}>
        KLUB (PÅKRÆVET) {missingClub && <Text style={styles.requiredError}>— vælg en klub</Text>}
      </Text>
      {loadingClubs ? (
        <Text style={styles.info}>Indlæser klubber...</Text>
      ) : (
        <View style={missingClub ? styles.clubListError : undefined}>
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

      <Text style={styles.label}>
        FØDSELSDATO (ÅÅÅÅ-MM-DD) {missingBirthDate && <Text style={styles.requiredError}>— påkrævet</Text>}
      </Text>
      <TextInput
        style={[styles.input, missingBirthDate && styles.inputError]}
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
          Jeg accepterer, at mit navn og min rating vises på ranglisten.{' '}
          <Text style={styles.consentLink} onPress={() => setShowPrivacy(true)}>
            Se privatlivspolitik
          </Text>
        </Text>
      </View>
      {attemptedSubmit && !consent && (
        <Text style={styles.requiredError}>Du skal acceptere for at fortsætte</Text>
      )}

      {isMinor && (
        <View style={styles.minorBox}>
          <Text style={styles.minorTitle}>Du er under 18 år</Text>
          <Text style={styles.minorText}>
            Da du er under 18, kræver oprettelse af en profil tilladelse fra en forælder eller værge.
          </Text>
          <View style={styles.consentRow}>
            <Switch value={parentalConsent} onValueChange={setParentalConsent} trackColor={{ true: colors.primary }} />
            <Text style={styles.consentText}>
              Jeg bekræfter, at min forælder eller værge har givet tilladelse til, at jeg opretter en profil, og at mine oplysninger behandles som beskrevet i privatlivspolitikken.
            </Text>
          </View>
          {attemptedSubmit && !parentalConsent && (
            <Text style={styles.requiredError}>Forældre-/værgesamtykke er påkrævet for at fortsætte</Text>
          )}
        </View>
      )}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'OPRETTER...' : 'OPRET PROFIL'}</Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={showPrivacy} animationType="slide" onRequestClose={() => setShowPrivacy(false)}>
        <View style={{ flex: 1 }}>
          <Pressable onPress={() => setShowPrivacy(false)} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>Luk</Text>
          </Pressable>
          <PrivacyPolicyContent />
        </View>
      </Modal>
    </KeyboardAwareScrollView>
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
  requiredError: { color: colors.danger, fontFamily: fonts.displayMedium },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.danger, borderWidth: 2 },
  clubListError: { borderWidth: 2, borderColor: colors.danger, borderRadius: radius.md, padding: spacing.xs },
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
  consentLink: { color: colors.primary, textDecorationLine: 'underline', fontWeight: '600' },
  minorBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#F0C36D',
  },
  minorTitle: { fontSize: 14, fontFamily: fonts.displayMedium, color: colors.ink, marginBottom: 4 },
  minorText: { fontSize: 13, color: colors.ink, lineHeight: 19 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 16,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 15, fontFamily: fonts.displayMedium, letterSpacing: 0.5 },
  error: { color: colors.danger, marginTop: spacing.md, textAlign: 'center' },
  modalCloseButton: { paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  modalCloseText: { color: colors.primary, fontSize: 15, fontFamily: fonts.displayMedium },
})