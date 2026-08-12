import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, fonts, spacing } from '../theme/theme'

export function ForgotPasswordScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Tilbage</Text>
      </Pressable>

      <Text style={styles.title}>Glemt kodeord?</Text>
      <Text style={styles.body}>
        Da vi ikke bruger almindelige e-mails til login, kan kodeord ikke nulstilles automatisk.
      </Text>
      <Text style={styles.body}>
        Kontakt din klubs administrator på{' '}
        <Text style={styles.link}>kontakt@armbrydning5000.dk</Text>, og oplys dit brugernavn — så
        nulstiller de dit kodeord for dig.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 60 },
  backButton: { marginBottom: spacing.lg },
  backButtonText: { color: colors.primary, fontSize: 15, fontFamily: fonts.displayMedium },
  title: { fontSize: 22, fontFamily: fonts.display, color: colors.ink, marginBottom: spacing.md },
  body: { fontSize: 14, color: colors.ink, lineHeight: 21, marginBottom: spacing.md },
  link: { color: colors.primary, fontFamily: fonts.displayMedium },
})