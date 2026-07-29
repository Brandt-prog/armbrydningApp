import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
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
      <Text style={styles.title}>Fuldfør din profil</Text>

      <Text style={styles.label}>Navn</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#999" />

      <Text style={styles.label}>Klub</Text>
      {loadingClubs ? (
        <Text style={styles.label}>Indlæser klubber...</Text>
      ) : (
        <View>
          {clubs.map((club) => (
            <Pressable
              key={club.id}
              style={[styles.clubOption, clubId === club.id && styles.clubOptionSelected]}
              onPress={() => setClubId(club.id)}
            >
              <Text style={styles.optionText}>{club.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.label}>Fødselsdato (ÅÅÅÅ-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="1995-05-15"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Køn</Text>
      <View style={styles.genderRow}>
        <Pressable
          style={[styles.genderOption, gender === 'male' && styles.clubOptionSelected]}
          onPress={() => setGender('male')}
        >
          <Text style={styles.optionText}>Mand</Text>
        </Pressable>
        <Pressable
          style={[styles.genderOption, gender === 'female' && styles.clubOptionSelected]}
          onPress={() => setGender('female')}
        >
          <Text style={styles.optionText}>Kvinde</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Vægt (kg, valgfrit)</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Højde (cm, valgfrit)</Text>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <View style={styles.consentRow}>
        <Switch value={consent} onValueChange={setConsent} />
        <Text style={styles.consentText}>
          Jeg accepterer, at mit navn og min rating vises på den nationale rangliste
        </Text>
      </View>

      <Pressable
        style={[styles.button, (!consent || !clubId) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting || !consent || !clubId}
      >
        <Text style={styles.buttonText}>{submitting ? 'Opretter...' : 'Opret profil'}</Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#1a1a1a' },
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
  clubOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  clubOptionSelected: {
    borderColor: '#1D3D47',
    backgroundColor: '#e8f0f1',
  },
  optionText: { color: '#1a1a1a' },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  consentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 8 },
  consentText: { flex: 1, fontSize: 13, color: '#1a1a1a' },
  button: {
    backgroundColor: '#1D3D47',
    borderRadius: 8,
    padding: 14,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: 'red', marginTop: 16, textAlign: 'center' },
})