import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { Club } from '../models/Club'
import type { User } from '../models/User'
import { classifyAthlete } from '../services/WeightClassService'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { useLeaderboard } from '../viewmodels/useLeaderboard'

interface LeaderboardScreenProps {
  currentUser: User
  clubs: Club[]
}

function RankBadge({ rank }: { rank: number }) {
  const medalColor =
    rank === 1 ? colors.gold : rank === 2 ? colors.silver : rank === 3 ? colors.bronze : null

  return (
    <View style={[styles.rankBadge, medalColor ? { backgroundColor: medalColor } : styles.rankBadgeDefault]}>
      <Text style={[styles.rankBadgeText, medalColor ? { color: '#fff' } : { color: colors.inkMuted }]}>
        {rank}
      </Text>
    </View>
  )
}

function ClassBadge({ user }: { user: User }) {
  if (!user.birthDate || !user.gender || !user.weight) return null
  const { ageCategory, weightClass } = classifyAthlete(user.birthDate, user.gender, user.weight)

  return (
    <View style={styles.classBadge}>
      <Text style={styles.classBadgeText}>
        {ageCategory} · {weightClass}
      </Text>
    </View>
  )
}

export function LeaderboardScreen({ currentUser, clubs }: LeaderboardScreenProps) {
  const [view, setView] = useState<'national' | 'club'>('national')
  const activeClubId = view === 'club' ? currentUser.clubId : null
  const { members, loading, error } = useLeaderboard(activeClubId)

  const clubName = clubs.find((c) => c.id === currentUser.clubId)?.name ?? 'Din klub'

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, view === 'national' && styles.tabActive]}
          onPress={() => setView('national')}
        >
          <Text style={[styles.tabText, view === 'national' && styles.tabTextActive]}>
            NATIONAL
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, view === 'club' && styles.tabActive]}
          onPress={() => setView('club')}
        >
          <Text style={[styles.tabText, view === 'club' && styles.tabTextActive]} numberOfLines={1}>
            {clubName.toUpperCase()}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <Text style={styles.info}>Indlæser rangliste...</Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : members.length === 0 ? (
        <Text style={styles.info}>Ingen aktive medlemmer endnu.</Text>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <RankBadge rank={index + 1} />
              <View style={styles.rowInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.metaRow}>
                  {view === 'national' && (
                    <Text style={styles.club}>
                      {clubs.find((c) => c.id === item.clubId)?.name ?? 'Ukendt klub'}
                    </Text>
                  )}
                  <ClassBadge user={item} />
                </View>
              </View>
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  tabs: { flexDirection: 'row', marginBottom: spacing.md, gap: spacing.sm },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: {
    color: colors.inkMuted,
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  tabTextActive: { color: '#fff' },
  info: { color: colors.inkMuted, fontSize: 14 },
  error: { color: colors.danger },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeDefault: { backgroundColor: colors.background },
  rankBadgeText: { fontFamily: fonts.display, fontSize: 14 },
  rowInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: colors.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  club: { fontSize: 12, color: colors.inkMuted },
  classBadge: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  classBadgeText: { fontSize: 10, color: colors.inkMuted, fontFamily: fonts.displayMedium },
  rating: { fontSize: 20, fontFamily: fonts.display, color: colors.primary },
})