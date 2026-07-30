import { ScrollView, StyleSheet, Text, View } from 'react-native'
import type { Club } from '../models/Club'
import type { User } from '../models/User'
import { classifyAthlete } from '../services/WeightClassService'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { usePlayerHistory } from '../viewmodels/usePlayerHistory'

interface ProfileScreenProps {
  currentUser: User
  clubs: Club[]
  onSignOut: () => Promise<void>
}

export function ProfileScreen({ currentUser, clubs, onSignOut }: ProfileScreenProps) {
  const { tournaments, supermatches, loading, error } = usePlayerHistory(currentUser.id)
  const clubName = clubs.find((c) => c.id === currentUser.clubId)?.name ?? 'Ukendt klub'

  const classification =
    currentUser.birthDate && currentUser.gender && currentUser.weight
      ? classifyAthlete(currentUser.birthDate, currentUser.gender, currentUser.weight)
      : null

  function formatDate(iso: string) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{clubName.toUpperCase()}</Text>
        <Text style={styles.name}>{currentUser.name}</Text>

        {classification && (
          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>
              {classification.ageCategory} · {classification.weightClass}
            </Text>
          </View>
        )}

        <Text style={styles.rating}>{currentUser.rating}</Text>
        <Text style={styles.ratingLabel}>RATING</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.signOut} onPress={onSignOut}>
          Log ud
        </Text>

        {loading ? (
          <Text style={styles.info}>Indlæser historik...</Text>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>TURNERINGER</Text>
            {tournaments.length === 0 ? (
              <Text style={styles.info}>Ingen turneringer spillet endnu.</Text>
            ) : (
              tournaments.map((t) => (
                <View key={t.tournamentId} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>{t.tournamentName}</Text>
                    <Text style={styles.cardDate}>{formatDate(t.date)}</Text>
                  </View>
                  <View style={styles.cardBottom}>
                    <Text style={styles.placement}>#{t.placement} plads</Text>
                    <Text
                      style={[
                        styles.change,
                        { color: t.ratingAfter >= t.ratingBefore ? colors.success : colors.danger },
                      ]}
                    >
                      {t.ratingAfter >= t.ratingBefore ? '+' : ''}
                      {t.ratingAfter - t.ratingBefore}
                    </Text>
                  </View>
                </View>
              ))
            )}

            <Text style={styles.sectionTitle}>SUPERMATCHES</Text>
            {supermatches.length === 0 ? (
              <Text style={styles.info}>Ingen supermatches spillet endnu.</Text>
            ) : (
              supermatches.map((s) => (
                <View key={s.supermatchId} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>vs. {s.opponentName}</Text>
                    <Text style={styles.cardDate}>{formatDate(s.date)}</Text>
                  </View>
                  <View style={styles.cardBottom}>
                    <Text style={styles.placement}>
                      {s.gamesWon} - {s.gamesLost}
                    </Text>
                    <Text
                      style={[
                        styles.change,
                        { color: s.ratingAfter >= s.ratingBefore ? colors.success : colors.danger },
                      ]}
                    >
                      {s.ratingAfter >= s.ratingBefore ? '+' : ''}
                      {s.ratingAfter - s.ratingBefore}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  header: { paddingTop: 60, paddingBottom: spacing.xl, paddingHorizontal: spacing.md, alignItems: 'center' },
  eyebrow: { color: '#fff', opacity: 0.75, fontSize: 11, letterSpacing: 1.5, fontFamily: fonts.displayMedium },
  name: { fontSize: 24, color: '#fff', fontFamily: fonts.display, marginTop: 4 },
  classBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: spacing.xs,
  },
  classBadgeText: { color: '#fff', fontSize: 11, fontFamily: fonts.displayMedium, letterSpacing: 0.5 },
  rating: { fontSize: 48, color: '#fff', fontFamily: fonts.display, marginTop: spacing.sm },
  ratingLabel: { color: '#fff', opacity: 0.75, fontSize: 11, letterSpacing: 1.5, fontFamily: fonts.displayMedium },
  body: { backgroundColor: colors.background, padding: spacing.md, minHeight: 400 },
  signOut: { color: colors.primary, fontWeight: '600', marginBottom: spacing.md },
  info: { color: colors.inkMuted, marginBottom: spacing.md },
  error: { color: colors.danger },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1,
    color: colors.inkMuted,
    fontFamily: fonts.displayMedium,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  cardDate: { fontSize: 12, color: colors.inkMuted },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  placement: { fontSize: 13, color: colors.inkMuted },
  change: { fontSize: 16, fontFamily: fonts.display },
})