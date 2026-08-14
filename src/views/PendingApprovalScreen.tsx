import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, fonts, spacing } from '../theme/theme'

interface PendingApprovalScreenProps {
  onSignOut: () => Promise<void>
}

export function PendingApprovalScreen({ onSignOut }: PendingApprovalScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>ARMBRYDNING DANMARK</Text>
      <Text style={styles.title}>Venter på godkendelse</Text>
      <Text style={styles.body}>
        Din profil er oprettet, men skal godkendes af en administrator i din klub, før du kan bruge appen.
      </Text>
      <Text style={styles.body}>Kontakt din klub, hvis det tager længere tid end forventet.</Text>

      <Pressable onPress={onSignOut} style={styles.signOutButton}>
        <Text style={styles.signOutText}>Log ud</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: spacing.lg },
  eyebrow: { color: colors.primary, fontSize: 11, letterSpacing: 1.5, fontFamily: fonts.displayMedium, textAlign: 'center', marginBottom: spacing.md },
  title: { fontSize: 24, fontFamily: fonts.display, color: colors.ink, textAlign: 'center', marginBottom: spacing.lg },
  body: { fontSize: 14, color: colors.ink, lineHeight: 21, textAlign: 'center', marginBottom: spacing.md },
  signOutButton: { marginTop: spacing.lg, alignSelf: 'center' },
  signOutText: { color: colors.primary, fontFamily: fonts.displayMedium, fontSize: 14 },
})