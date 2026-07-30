import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import type { Club } from '../models/Club'
import type { User } from '../models/User'
import { classifyAthlete } from '../services/WeightClassService'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { useMatchmaking } from '../viewmodels/useMatchmaking'

interface MatchmakingScreenProps {
  currentUser: User
  clubs: Club[]
}

const RANGE_OPTIONS = [50, 100, 200]

export function MatchmakingScreen({ currentUser, clubs }: MatchmakingScreenProps) {
  const { candidates, loading, ratingRange, setRatingRange, sameWeightClassOnly, setSameWeightClassOnly } =
    useMatchmaking(currentUser)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>FIND EN MODSTANDER</Text>
        <Text style={styles.title}>Din rating: {currentUser.rating}</Text>
      </View>

      <View style={styles.filters}>
        <Text style={styles.filterLabel}>RATING-INTERVAL (±)</Text>
        <View style={styles.rangeRow}>
          {RANGE_OPTIONS.map((r) => (
            <Pressable
              key={r}
              style={[styles.rangeChip, ratingRange === r && styles.rangeChipActive]}
              onPress={() => setRatingRange(r)}
            >
              <Text style={[styles.rangeChipText, ratingRange === r && styles.rangeChipTextActive]}>
                ±{r}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.switchRow}>
          <Switch
            value={sameWeightClassOnly}
            onValueChange={setSameWeightClassOnly}
            trackColor={{ true: colors.primary }}
          />
          <Text style={styles.switchLabel}>Kun samme vægtklasse (±5 kg)</Text>
        </View>
      </View>

      {loading ? (
        <Text style={styles.info}>Indlæser medlemmer...</Text>
      ) : candidates.length === 0 ? (
        <Text style={styles.info}>Ingen medlemmer matcher dine filtre lige nu.</Text>
      ) : (
        <FlatList
          data={candidates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          renderItem={({ item }) => {
            const clubName = clubs.find((c) => c.id === item.clubId)?.name ?? 'Ukendt klub'
            const classification =
              item.birthDate && item.gender && item.weight
                ? classifyAthlete(item.birthDate, item.gender, item.weight)
                : null
            const diff = (item.rating ?? 1200) - (currentUser.rating ?? 1200)

            return (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.club}>{clubName}</Text>
                  {classification && (
                    <Text style={styles.classText}>
                      {classification.ageCategory} · {classification.weightClass}
                    </Text>
                  )}
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.rating}>{item.rating}</Text>
                  <Text style={[styles.diff, { color: diff >= 0 ? colors.danger : colors.success }]}>
                    {diff >= 0 ? '+' : ''}
                    {diff}
                  </Text>
                </View>
              </View>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  header: { marginBottom: spacing.md },
  eyebrow: { color: colors.primary, fontSize: 11, letterSpacing: 1.5, fontFamily: fonts.displayMedium },
  title: { fontSize: 18, color: colors.ink, fontFamily: fonts.display, marginTop: 4 },
  filters: { marginBottom: spacing.md },
  filterLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.inkMuted,
    fontFamily: fonts.displayMedium,
    marginBottom: spacing.xs,
  },
  rangeRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  rangeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  rangeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rangeChipText: { fontSize: 13, color: colors.inkMuted, fontWeight: '600' },
  rangeChipTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  switchLabel: { color: colors.ink, fontSize: 13 },
  info: { color: colors.inkMuted },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLeft: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: colors.ink },
  club: { fontSize: 12, color: colors.inkMuted, marginTop: 2 },
  classText: { fontSize: 11, color: colors.inkMuted, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  rating: { fontSize: 18, fontFamily: fonts.display, color: colors.ink },
  diff: { fontSize: 12, fontWeight: '600' },
})