import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

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
      <Text style={styles.title}>{mode === 'signin' ? 'Log ind' : 'Opret konto'}</Text>

      <Text style={styles.label}>Brugernavn</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Kodeord</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        placeholderTextColor="#999"
      />

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>
          {submitting ? 'Vent...' : mode === 'signin' ? 'Log ind' : 'Opret konto'}
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
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#1a1a1a' },
  label: { fontSize: 14, marginBottom: 4, marginTop: 12, color: '#1a1a1a' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#1D3D47',
    borderRadius: 8,
    padding: 14,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  switchText: { textAlign: 'center', marginTop: 16, color: '#1D3D47' },
  error: { color: 'red', marginTop: 16, textAlign: 'center' },
})