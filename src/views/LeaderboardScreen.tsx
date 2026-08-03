import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { Arm } from '../models/Arm'
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

function getClassLabel(user: User): string | null {
  if (!user.birthDate || !user.gender || !user.weight) return null
  const { ageCategory, weightClass } = classifyAthlete(user.birthDate, user.gender, user.weight)
  return `${ageCategory} · ${weightClass}`
}

export function LeaderboardScreen({ currentUser, clubs }: LeaderboardScreenProps) {
  const router = useRouter()
  const [view, setView] = useState<'national' | 'club'>('national')
  const [arm, setArm] = useState<Arm>('right')
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all')
  const [classFilter, setClassFilter] = useState<string | null>(null)

  const activeClubId = view === 'club' ? currentUser.clubId : null
  const { members, loading, error } = useLeaderboard(activeClubId, arm)

  const clubName = clubs.find((c) => c.id === currentUser.clubId)?.name ?? 'Din klub'
  const ratingField = arm === 'left' ? 'ratingLeft' : 'ratingRight'
  const rdField = arm === 'left' ? 'ratingLeftRD' : 'ratingRightRD'

  const genderFiltered = useMemo(
    () => (genderFilter === 'all' ? members : members.filter((m) => m.gender === genderFilter)),
    [members, genderFilter]
  )

  const availableClasses = useMemo(() => {
    const set = new Set<string>()
    genderFiltered.forEach((m) => {
      const label = getClassLabel(m)
      if (label) set.add(label)
    })
    return Array.from(set).sort()
  }, [genderFiltered])

  const finalMembers = useMemo(
    () => (classFilter ? genderFiltered.filter((m) => getClassLabel(m) === classFilter) : genderFiltered),
    [genderFiltered, classFilter]
  )

  return (
    <View style={styles.container}>
      <View style={styles.armTabs}>
        <Pressable
          style={[styles.armTab, arm === 'right' && styles.armTabActive]}
          onPress={() => setArm('right')}
        >
          <Text style={[styles.armTabText, arm === 'right' && styles.armTabTextActive]}>HØJRE</Text>
        </Pressable>
        <Pressable
          style={[styles.armTab, arm === 'left' && styles.armTabActive]}
          onPress={() => setArm('left')}
        >
          <Text style={[styles.armTabText, arm === 'left' && styles.armTabTextActive]}>VENSTRE</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, view === 'national' && styles.tabActive]}
          onPress={() => setView('national')}
        >
          <Text style={[styles.tabText, view === 'national' && styles.tabTextActive]}>NATIONAL</Text>
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

      <View style={styles.filterRow}>
        {(['all', 'male', 'female'] as const).map((g) => (
          <Pressable
            key={g}
            style={[styles.filterChip, genderFilter === g && styles.filterChipActive]}
            onPress={() => setGenderFilter(g)}
          >
            <Text style={[styles.filterChipText, genderFilter === g && styles.filterChipTextActive]}>
              {g === 'all' ? 'ALLE' : g === 'male' ? 'MÆND' : 'KVINDER'}
            </Text>
          </Pressable>
        ))}
      </View>

      {availableClasses.length > 0 && (
        <FlatList
          horizontal
          data={['Alle klasser', ...availableClasses]}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          style={styles.classFilterList}
          renderItem={({ item }) => {
            const isAll = item === 'Alle klasser'
            const active = isAll ? classFilter === null : classFilter === item
            return (
              <Pressable
                style={[styles.filterChip, styles.classChip, active && styles.filterChipActive]}
                onPress={() => setClassFilter(isAll ? null : item)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item}</Text>
              </Pressable>
            )
          }}
        />
      )}

      {loading ? (
        <Text style={styles.info}>Indlæser rangliste...</Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : finalMembers.length === 0 ? (
        <Text style={styles.info}>Ingen medlemmer matcher filtrene.</Text>
      ) : (
        <FlatList
          data={finalMembers}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          renderItem={({ item, index }) => (
            <Pressable
              style={styles.row}
              onPress={() => router.push({ pathname: '/player/[id]', params: { id: item.id } })}
            >
              <RankBadge rank={index + 1} />
              <View style={styles.rowInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.metaRow}>
                  {view === 'national' && (
                    <Text style={styles.club}>
                      {clubs.find((c) => c.id === item.clubId)?.name ?? 'Ukendt klub'}
                    </Text>
                  )}
                  {getClassLabel(item) && (
                    <View style={styles.classBadge}>
                      <Text style={styles.classBadgeText}>{getClassLabel(item)}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.ratingBlock}>
                <Text style={styles.rating}>{item[ratingField]}</Text>
                <Text style={styles.rd}>±{item[rdField]}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  armTabs: { flexDirection: 'row', marginBottom: spacing.sm, gap: spacing.xs },
  armTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  armTabActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  armTabText: { fontSize: 11, color: colors.inkMuted, fontFamily: fonts.displayMedium },
  armTabTextActive: { color: '#fff' },
  tabs: { flexDirection: 'row', marginBottom: spacing.sm, gap: spacing.sm },
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
  tabText: { color: colors.inkMuted, fontFamily: fonts.displayMedium, fontSize: 13, letterSpacing: 0.5 },
  tabTextActive: { color: '#fff' },
  filterRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterChipText: { fontSize: 10, color: colors.inkMuted, fontFamily: fonts.displayMedium },
  filterChipTextActive: { color: '#fff' },
  classFilterList: { marginBottom: spacing.md },
  classChip: { marginRight: spacing.xs },
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
  rankBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
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
  ratingBlock: { alignItems: 'flex-end' },
  rating: { fontSize: 20, fontFamily: fonts.display, color: colors.primary },
  rd: { fontSize: 10, color: colors.inkMuted, fontFamily: fonts.displayMedium },
})