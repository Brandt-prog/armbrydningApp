import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { Arm } from '../models/Arm'
import type { Club } from '../models/Club'
import type { User } from '../models/User'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { useLeaderboard, type LeaderboardEntry } from '../viewmodels/useLeaderboard'

interface LeaderboardScreenProps {
  currentUser: User
  clubs: Club[]
}

function RankBadge({ rank }: { rank: number }) {
  const medalColor = rank === 1 ? colors.gold : rank === 2 ? colors.silver : rank === 3 ? colors.bronze : null
  return (
    <View style={[styles.rankBadge, medalColor ? { backgroundColor: medalColor } : styles.rankBadgeDefault]}>
      <Text style={[styles.rankBadgeText, medalColor ? { color: '#fff' } : { color: colors.inkMuted }]}>{rank}</Text>
    </View>
  )
}

function getClassLabel(entry: LeaderboardEntry): string | null {
  if (!entry.ageCategory || !entry.weightClass) return null
  return `${entry.ageCategory} · ${entry.weightClass}`
}

function reasonFor(entry: LeaderboardEntry): string {
  if (!entry.isMainCluster) return `Kun ${entry.opponentCount} modstandere`
  if (!entry.isEstablished) return 'For lidt data endnu'
  return ''
}

export function LeaderboardScreen({ currentUser, clubs }: LeaderboardScreenProps) {
  const router = useRouter()
  const [arm, setArm] = useState<Arm>('right')
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all')
  const [classFilter, setClassFilter] = useState<string | null>(null)

  const { established, provisional, loading, error } = useLeaderboard(currentUser.clubId, arm)

  const clubName = clubs.find((c) => c.id === currentUser.clubId)?.name ?? 'Din klub'
  const ratingField = arm === 'left' ? 'ratingLeft' : 'ratingRight'
  const rdField = arm === 'left' ? 'ratingLeftRD' : 'ratingRightRD'

  function applyFilters(entries: LeaderboardEntry[]) {
    let filtered = genderFilter === 'all' ? entries : entries.filter((e) => e.user.gender === genderFilter)
    if (classFilter) filtered = filtered.filter((e) => getClassLabel(e) === classFilter)
    return filtered
  }

  const filteredEstablished = useMemo(() => applyFilters(established), [established, genderFilter, classFilter])
  const filteredProvisional = useMemo(() => applyFilters(provisional), [provisional, genderFilter, classFilter])

  const availableClasses = useMemo(() => {
    const set = new Set<string>()
    const all = genderFilter === 'all' ? [...established, ...provisional] : [...established, ...provisional].filter((e) => e.user.gender === genderFilter)
    all.forEach((e) => {
      const label = getClassLabel(e)
      if (label) set.add(label)
    })
    return Array.from(set).sort()
  }, [established, provisional, genderFilter])

  function renderRow(entry: LeaderboardEntry, index: number, showReason: boolean) {
    return (
      <Pressable
        key={entry.user.id}
        style={styles.row}
        onPress={() => router.push({ pathname: '/player/[id]', params: { id: entry.user.id } })}
      >
        <RankBadge rank={index + 1} />
        <View style={styles.rowInfo}>
          <Text style={styles.name}>{entry.user.name}</Text>
          <View style={styles.metaRow}>
            {getClassLabel(entry) && (
              <View style={styles.classBadge}>
                <Text style={styles.classBadgeText}>{getClassLabel(entry)}</Text>
              </View>
            )}
            {showReason && reasonFor(entry) && (
              <View style={styles.reasonBadge}>
                <Text style={styles.reasonBadgeText}>{reasonFor(entry)}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.ratingBlock}>
          <Text style={styles.rating}>{entry.user[ratingField]}</Text>
          <Text style={styles.rd}>±{entry.user[rdField]}</Text>
        </View>
      </Pressable>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.clubTitle}>{clubName.toUpperCase()}</Text>

      <Pressable onPress={() => router.push('/how-ranking-works')} style={styles.howItWorksLink}>
        <Text style={styles.howItWorksLinkText}>ℹ️ Sådan virker ranglisten</Text>
      </Pressable>

      <View style={styles.armTabs}>
        <Pressable style={[styles.armTab, arm === 'right' && styles.armTabActive]} onPress={() => setArm('right')}>
          <Text style={[styles.armTabText, arm === 'right' && styles.armTabTextActive]}>HØJRE</Text>
        </Pressable>
        <Pressable style={[styles.armTab, arm === 'left' && styles.armTabActive]} onPress={() => setArm('left')}>
          <Text style={[styles.armTabText, arm === 'left' && styles.armTabTextActive]}>VENSTRE</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'male', 'female'] as const).map((g) => (
          <Pressable key={g} style={[styles.filterChip, genderFilter === g && styles.filterChipActive]} onPress={() => setGenderFilter(g)}>
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
              <Pressable style={[styles.filterChip, styles.classChip, active && styles.filterChipActive]} onPress={() => setClassFilter(isAll ? null : item)}>
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
      ) : (
        <FlatList
          data={[{ type: 'established' as const }, { type: 'provisional' as const }]}
          keyExtractor={(item) => item.type}
          scrollEnabled={false}
          renderItem={({ item }) => {
            if (item.type === 'established') {
              return (
                <View>
                  <Text style={styles.sectionTitle}>🏆 RANGLISTE</Text>
                  {filteredEstablished.length === 0 ? (
                    <Text style={styles.info}>Ingen etablerede spillere endnu.</Text>
                  ) : (
                    filteredEstablished.map((entry, index) => renderRow(entry, index, false))
                  )}
                </View>
              )
            }
            if (filteredProvisional.length === 0) return null
            return (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionTitle}>⚠️ IKKE NOK DATA ENDNU</Text>
                {filteredProvisional.map((entry, index) => renderRow(entry, index, true))}
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
  clubTitle: { fontSize: 12, letterSpacing: 1, color: colors.primary, fontFamily: fonts.displayMedium, marginBottom: spacing.sm },
  howItWorksLink: { marginBottom: spacing.sm },
  howItWorksLinkText: { fontSize: 12, color: colors.primary, textDecorationLine: 'underline' },
  armTabs: { flexDirection: 'row', marginBottom: spacing.sm, gap: spacing.xs },
  armTab: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  armTabActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  armTabText: { fontSize: 11, color: colors.inkMuted, fontFamily: fonts.displayMedium },
  armTabTextActive: { color: '#fff' },
  filterRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  filterChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterChipText: { fontSize: 10, color: colors.inkMuted, fontFamily: fonts.displayMedium },
  filterChipTextActive: { color: '#fff' },
  classFilterList: { marginBottom: spacing.md },
  classChip: { marginRight: spacing.xs },
  info: { color: colors.inkMuted, fontSize: 14 },
  error: { color: colors.danger },
  sectionTitle: { fontSize: 13, fontFamily: fonts.displayMedium, color: colors.ink, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  rankBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  rankBadgeDefault: { backgroundColor: colors.background },
  rankBadgeText: { fontFamily: fonts.display, fontSize: 14 },
  rowInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: colors.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  classBadge: { backgroundColor: colors.background, borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8, borderWidth: 1, borderColor: colors.border },
  classBadgeText: { fontSize: 10, color: colors.inkMuted, fontFamily: fonts.displayMedium },
  reasonBadge: { backgroundColor: '#FFF3E0', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8, borderWidth: 1, borderColor: '#F0C36D' },
  reasonBadgeText: { fontSize: 10, color: '#8A6416', fontFamily: fonts.displayMedium },
  ratingBlock: { alignItems: 'flex-end' },
  rating: { fontSize: 20, fontFamily: fonts.display, color: colors.primary },
  rd: { fontSize: 10, color: colors.inkMuted, fontFamily: fonts.displayMedium },
})