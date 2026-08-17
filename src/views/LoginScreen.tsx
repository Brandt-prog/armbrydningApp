import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { validateUsername } from '../services/AuthService'
import { colors, fonts, radius, spacing } from '../theme/theme'

interface LoginScreenProps {
  onSignUp: (username: string, password: string) => Promise<void>
  onSignIn: (username: string, password: string) => Promise<void>
  error: string | null
}

export function LoginScreen({ onSignUp, onSignIn, error }: LoginScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  async function handleSubmit() {
    setLocalError(null)

    if (mode === 'signup') {
      const usernameError = validateUsername(username)
      if (usernameError) {
        setLocalError(usernameError)
        return
      }
      if (password.length < 6) {
        setLocalError('Kodeord skal være mindst 6 tegn.')
        return
      }
      if (password !== confirmPassword) {
        setLocalError('Kodeordene matcher ikke.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await onSignUp(username.trim(), password)
      } else {
        await onSignIn(username.trim(), password)
      }
    } catch {
      // error is captured via the `error` prop
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode() {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setLocalError(null)
    setPassword('')
    setConfirmPassword('')
  }

  const displayError = localError ?? error

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={20}
    >
      <Text style={styles.eyebrow}>ARMBRYDNING DANMARK</Text>
      <Text style={styles.title}>{mode === 'signin' ? 'Log ind' : 'Opret konto'}</Text>

      <Text style={styles.label}>BRUGERNAVN</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={colors.inkMuted}
      />
      {mode === 'signup' && (
        <Text style={styles.hint}>Kun bogstaver, tal, - og _. Ingen mellemrum.</Text>
      )}

      <Text style={styles.label}>KODEORD</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        placeholderTextColor={colors.inkMuted}
      />

      {mode === 'signup' && (
        <>
          <Text style={styles.label}>BEKRÆFT KODEORD</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholderTextColor={colors.inkMuted}
          />
        </>
      )}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>
          {submitting ? 'VENT...' : mode === 'signin' ? 'LOG IND' : 'OPRET KONTO'}
        </Text>
      </Pressable>

      <Pressable onPress={switchMode}>
        <Text style={styles.switchText}>
          {mode === 'signin' ? 'Ny her? Opret konto' : 'Har allerede en konto? Log ind'}
        </Text>
      </Pressable>

      {mode === 'signin' && (
        <Pressable onPress={() => setShowForgotPassword(true)}>
          <Text style={styles.forgotText}>Glemt kodeord?</Text>
        </Pressable>
      )}

      {displayError && <Text style={styles.error}>{displayError}</Text>}

      <Modal visible={showForgotPassword} animationType="slide" onRequestClose={() => setShowForgotPassword(false)}>
        <View style={styles.modalContainer}>
          <Pressable onPress={() => setShowForgotPassword(false)} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>Luk</Text>
          </Pressable>
          <Text style={styles.modalTitle}>Glemt kodeord?</Text>
          <Text style={styles.modalBody}>
            Da vi ikke bruger almindelige e-mails til login, kan kodeord ikke nulstilles automatisk.
          </Text>
          <Text style={styles.modalBody}>
            Kontakt din klubs administrator på{' '}
            <Text style={styles.modalLink}>kontakt@armbrydning5000.dk</Text>, og oplys dit brugernavn
            — så nulstiller de dit kodeord for dig.
          </Text>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: fonts.displayMedium,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.display,
    marginBottom: spacing.lg,
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
  hint: { fontSize: 11, color: colors.inkMuted, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: 16,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 15, fontFamily: fonts.displayMedium, letterSpacing: 0.5 },
  switchText: { textAlign: 'center', marginTop: spacing.md, color: colors.primary },
  forgotText: { textAlign: 'center', marginTop: spacing.sm, color: colors.inkMuted, fontSize: 13, textDecorationLine: 'underline' },
  error: { color: colors.danger, marginTop: spacing.md, textAlign: 'center' },
  modalContainer: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 60 },
  modalCloseButton: { marginBottom: spacing.lg },
  modalCloseText: { color: colors.primary, fontSize: 15, fontFamily: fonts.displayMedium },
  modalTitle: { fontSize: 22, fontFamily: fonts.display, color: colors.ink, marginBottom: spacing.md },
  modalBody: { fontSize: 14, color: colors.ink, lineHeight: 21, marginBottom: spacing.md },
  modalLink: { color: colors.primary, fontFamily: fonts.displayMedium },
})