import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, fonts, spacing } from '../theme/theme'
import { HowRankingWorksContent } from './HowRankingWorksContent'

export function HowRankingWorksScreen() {
  const router = useRouter()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Tilbage</Text>
      </Pressable>
      <HowRankingWorksContent />
    </View>
  )
}

const styles = StyleSheet.create({
  backButton: { paddingTop: 60, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  backButtonText: { color: colors.primary, fontSize: 15, fontFamily: fonts.displayMedium },
})