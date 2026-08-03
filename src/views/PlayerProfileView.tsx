import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { Club } from '../models/Club'
import type { User } from '../models/User'
import { classifyAthlete } from '../services/WeightClassService'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { usePlayerHistory } from '../viewmodels/usePlayerHistory'

interface PlayerProfileViewProps {
  user: User
  clubs: Club[]
  isOwnProfile?: boolean
  onSignOut?: () => Promise<void>
}

export function PlayerProfileView({ user, clubs, isOwnProfile, onSignOut }: PlayerProfileViewProps) {
  const router = useRouter()
  const { tournaments, supermatches, loading, error } = usePlayerHistory(user.id)
  const clubName = clubs.find((c) => c.id === user.clubId)?.name ?? 'Ukendt klub'
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const classification =
    user.birthDate && user.gender && user.weight
      ? classifyAthlete(user.birthDate, user.gender, user.weight)
      : null

  function formatDate(iso: string) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function goToOpponent(opponentId: string) {
    if (opponentId === user.id) return
    router.push({ pathname: '/player/[id]', params: { id: opponentId } })
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{clubName.toUpperCase()}</Text>
        <Text style={styles.name}>{user.name}</Text>

        {classification && (
          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>
              {classification.ageCategory} · {classification.weightClass}
            </Text>
          </View>
        )}

        <View style={styles.ratingsRow}>
          <View style={styles.ratingBlock}>
            <Text style={styles.rating}>{user.ratingRight}</Text>
            <Text style={styles.rd}>±{user.ratingRightRD}</Text>
            <Text style={styles.ratingLabel}>HØJRE</Text>
          </View>
          <View style={styles.ratingDivider} />
          <View style={styles.ratingBlock}>
            <Text style={styles.rating}>{user.ratingLeft}</Text>
            <Text style={styles.rd}>±{user.ratingLeftRD}</Text>
            <Text style={styles.ratingLabel}>VENSTRE</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {isOwnProfile && onSignOut && (
          <Text style={styles.signOut} onPress={onSignOut}>
            Log ud
          </Text>
        )}

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
              tournaments.map((t) => {
                const wins = t.matches.filter((m) => m.won).length
                const losses = t.matches.length - wins
                const isExpanded = expanded.has(t.tournamentId)

                return (
                  <View key={t.tournamentId} style={styles.card}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle}>{t.tournamentName}</Text>
                      <Text style={styles.cardDate}>{formatDate(t.date)}</Text>
                    </View>
                    <View style={styles.cardBottom}>
                      <Text style={styles.placement}>
                        {wins}W – {losses}L
                      </Text>
                      <Text
                        style={[
                          styles.change,
                          { color: t.netChange >= 0 ? colors.success : colors.danger },
                        ]}
                      >
                        {t.netChange >= 0 ? '+' : ''}
                        {t.netChange}
                      </Text>
                    </View>

                    {t.matches.length > 0 && (
                      <>
                        <Pressable style={styles.summaryRow} onPress={() => toggle(t.tournamentId)}>
                          <Text style={styles.summaryText}>{t.matches.length} kampe</Text>
                          <Text style={styles.summaryToggle}>{isExpanded ? 'SKJUL' : 'VIS ALLE'}</Text>
                        </Pressable>

                        {isExpanded && (
                          <View style={styles.opponentsWrap}>
                            {t.matches.map((m, i) => (
                              <Pressable
                                key={`${m.opponentId}-${i}`}
                                style={styles.opponentRow}
                                onPress={() => goToOpponent(m.opponentId)}
                              >
                                <Text
                                  style={[
                                    styles.opponentResult,
                                    { color: m.won ? colors.success : colors.danger },
                                  ]}
                                >
                                  {m.won ? 'VUNDET' : 'TABT'}
                                </Text>
                                <Text style={styles.opponentName}>{m.opponentName}</Text>
                                <Text
                                  style={[
                                    styles.opponentChange,
                                    { color: m.ratingAfter >= m.ratingBefore ? colors.success : colors.danger },
                                  ]}
                                >
                                  {m.ratingAfter >= m.ratingBefore ? '+' : ''}
                                  {m.ratingAfter - m.ratingBefore}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        )}
                      </>
                    )}
                  </View>
                )
              })
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
  ratingsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  ratingBlock: { alignItems: 'center', paddingHorizontal: spacing.lg },
  ratingDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },
  rating: { fontSize: 40, color: '#fff', fontFamily: fonts.display },
  rd: { fontSize: 12, color: '#fff', opacity: 0.75, fontFamily: fonts.displayMedium },
  ratingLabel: { color: '#fff', opacity: 0.75, fontSize: 11, letterSpacing: 1.5, fontFamily: fonts.displayMedium, marginTop: 2 },
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryText: { fontSize: 12, color: colors.inkMuted },
  summaryToggle: { fontSize: 10, color: colors.primary, fontFamily: fonts.displayMedium },
  opponentsWrap: { marginTop: spacing.sm, gap: 4 },
  opponentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: 2 },
  opponentResult: { fontSize: 10, fontFamily: fonts.displayMedium, width: 52 },
  opponentName: { fontSize: 12, color: colors.primary, flex: 1, textDecorationLine: 'underline' },
  opponentChange: { fontSize: 11, fontFamily: fonts.display },
})