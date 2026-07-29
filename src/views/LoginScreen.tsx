import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
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
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await onSignUp(username, password)
      } else {
        await onSignIn(username, password)
      }
    } catch {
      // error is captured via the `error` prop
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
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

      <Text style={styles.label}>KODEORD</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        placeholderTextColor={colors.inkMuted}
      />

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>
          {submitting ? 'VENT...' : mode === 'signin' ? 'LOG IND' : 'OPRET KONTO'}
        </Text>
      </Pressable>

      <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        <Text style={styles.switchText}>
          {mode === 'signin' ? 'Ny her? Opret konto' : 'Har allerede en konto? Log ind'}
        </Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
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
  error: { color: colors.danger, marginTop: spacing.md, textAlign: 'center' },
})