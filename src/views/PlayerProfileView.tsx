import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import type { Club } from '../models/Club'
import type { User } from '../models/User'
import { classifyAthlete } from '../services/WeightClassService'
import { colors, fonts, radius, spacing } from '../theme/theme'
import { useChangePassword } from '../viewmodels/useChangePassword'
import { useConnectivity } from '../viewmodels/useConnectivity'
import { useEditProfile } from '../viewmodels/useEditProfile'
import { usePlayerHistory } from '../viewmodels/usePlayerHistory'

interface PlayerProfileViewProps {
  user: User
  clubs: Club[]
  isOwnProfile?: boolean
  onSignOut?: () => Promise<void>
  viewerUserId?: string
  showBackButton?: boolean
  isAdmin?: boolean
}

export function PlayerProfileView({ user, clubs, isOwnProfile, onSignOut, viewerUserId, showBackButton, isAdmin }: PlayerProfileViewProps) {
  const router = useRouter()
  const { tournaments, supermatches, clubMatches, loading, error, voidClubMatch } = usePlayerHistory(user.id)
  const clubName = clubs.find((c) => c.id === user.clubId)?.name ?? 'Ukendt klub'
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [voidingId, setVoidingId] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(user.name)
  const [editWeight, setEditWeight] = useState(user.weight?.toString() ?? '')
  const [editHeight, setEditHeight] = useState(user.height?.toString() ?? '')
  const { save, submitting, error: saveError } = useEditProfile(user.id)

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { changePassword, submitting: changingPassword, error: passwordError, success: passwordSuccess } = useChangePassword()

  const showConnectivity = !isOwnProfile && !!viewerUserId
  const { connectedRight, connectedLeft, loading: loadingConnectivity } = useConnectivity(viewerUserId ?? user.id, user.id)

  const classification = user.birthDate && user.gender && user.weight ? classifyAthlete(user.birthDate, user.gender, user.weight) : null

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

  async function handleSave() {
    try {
      await save({
        name: editName,
        weight: editWeight ? Number(editWeight) : null,
        height: editHeight ? Number(editHeight) : null,
      })
      setEditing(false)
    } catch {
      // error surfaced via saveError
    }
  }

  async function handleVoid(matchId: string) {
    setVoidingId(matchId)
    try {
      await voidClubMatch(matchId)
    } catch {
      // error will show via a future refresh; kept silent here for simplicity
    } finally {
      setVoidingId(null)
    }
  }

  async function handleChangePassword() {
    await changePassword(newPassword, confirmPassword)
    if (newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6) {
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  function closePasswordModal() {
    setShowChangePassword(false)
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={20}
    >
      <View style={styles.header}>
        {showBackButton && (
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹ Tilbage</Text>
          </Pressable>
        )}

        <Text style={styles.eyebrow}>{clubName.toUpperCase()}</Text>

        {editing ? (
          <View style={styles.editBox}>
            <Text style={styles.editLabel}>NAVN</Text>
            <TextInput style={styles.editInput} value={editName} onChangeText={setEditName} />

            <Text style={styles.editLabel}>VÆGT (KG)</Text>
            <TextInput style={styles.editInput} value={editWeight} onChangeText={setEditWeight} keyboardType="numeric" />

            <Text style={styles.editLabel}>HØJDE (CM)</Text>
            <TextInput style={styles.editInput} value={editHeight} onChangeText={setEditHeight} keyboardType="numeric" />

            <View style={styles.editButtons}>
              <Pressable style={styles.saveButton} onPress={handleSave} disabled={submitting}>
                <Text style={styles.saveButtonText}>{submitting ? 'GEMMER...' : 'GEM'}</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={() => setEditing(false)}>
                <Text style={styles.cancelButtonText}>ANNULLÉR</Text>
              </Pressable>
            </View>
            {saveError && <Text style={styles.editError}>{saveError}</Text>}
          </View>
        ) : (
          <>
            <Text style={styles.name}>{user.name}</Text>
            {isOwnProfile && (
              <>
                <Pressable onPress={() => setEditing(true)}>
                  <Text style={styles.editLink}>Rediger profil</Text>
                </Pressable>
                <Pressable onPress={() => setShowChangePassword(true)}>
                  <Text style={styles.editLink}>Skift kodeord</Text>
                </Pressable>
                <Pressable onPress={() => router.push('/privacy')}>
                  <Text style={styles.privacyLink}>Se privatlivspolitik</Text>
                </Pressable>
              </>
            )}
          </>
        )}

        {!editing && classification && (
          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>{classification.ageCategory} · {classification.weightClass}</Text>
          </View>
        )}

        {!editing && (
          <View style={styles.ratingsRow}>
            <View style={styles.ratingBlock}>
              <Text style={styles.rating}>{user.ratingRight}</Text>
              <Text style={styles.rd}>±{user.ratingRightRD}</Text>
              <Text style={styles.ratingLabel}>HØJRE</Text>
              {showConnectivity && !loadingConnectivity && connectedRight !== null && (
                <View style={[styles.connBadge, connectedRight ? styles.connBadgeYes : styles.connBadgeNo]}>
                  <Text style={styles.connBadgeText}>{connectedRight ? 'SAMMENLIGNELIG' : 'IKKE SAMMENLIGNELIG'}</Text>
                </View>
              )}
            </View>
            <View style={styles.ratingDivider} />
            <View style={styles.ratingBlock}>
              <Text style={styles.rating}>{user.ratingLeft}</Text>
              <Text style={styles.rd}>±{user.ratingLeftRD}</Text>
              <Text style={styles.ratingLabel}>VENSTRE</Text>
              {showConnectivity && !loadingConnectivity && connectedLeft !== null && (
                <View style={[styles.connBadge, connectedLeft ? styles.connBadgeYes : styles.connBadgeNo]}>
                  <Text style={styles.connBadgeText}>{connectedLeft ? 'SAMMENLIGNELIG' : 'IKKE SAMMENLIGNELIG'}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {showConnectivity && (connectedRight === false || connectedLeft === false) && (
          <Text style={styles.connHint}>Ingen fælles modstandere endnu — rating-forskellen er ikke nødvendigvis retvisende.</Text>
        )}
      </View>

      <View style={styles.body}>
        {isOwnProfile && onSignOut && (
          <Text style={styles.signOut} onPress={onSignOut}>Log ud</Text>
        )}

        {loading ? (
          <Text style={styles.info}>Indlæser historik...</Text>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>KLUBKAMPE</Text>
            {clubMatches.length === 0 ? (
              <Text style={styles.info}>Ingen klubkampe spillet endnu.</Text>
            ) : (
              clubMatches.map((m) => (
                <View key={m.matchId} style={[styles.card, m.voided && styles.cardVoided]}>
                  <Pressable onPress={() => goToOpponent(m.opponentId)}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle}>vs. {m.opponentName}</Text>
                      <Text style={styles.cardDate}>{formatDate(m.date)}</Text>
                    </View>
                    <View style={styles.cardBottom}>
                      <Text style={styles.placement}>
                        {m.arm === 'left' ? 'Venstre' : 'Højre'} · {m.won ? 'Vundet' : 'Tabt'}
                        {m.voided ? ' · ANNULLERET' : ''}
                      </Text>
                      <Text style={[styles.change, { color: m.ratingAfter >= m.ratingBefore ? colors.success : colors.danger }]}>
                        {m.ratingAfter >= m.ratingBefore ? '+' : ''}{m.ratingAfter - m.ratingBefore}
                      </Text>
                    </View>
                  </Pressable>
                  {isAdmin && !m.voided && (
                    <Pressable
                      style={styles.voidButton}
                      onPress={() => handleVoid(m.matchId)}
                      disabled={voidingId === m.matchId}
                    >
                      <Text style={styles.voidButtonText}>
                        {voidingId === m.matchId ? 'ANNULLERER...' : 'ANNULLÉR KAMP'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))
            )}

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
                      <Text style={styles.placement}>{wins}W – {losses}L</Text>
                      <Text style={[styles.change, { color: t.netChange >= 0 ? colors.success : colors.danger }]}>
                        {t.netChange >= 0 ? '+' : ''}{t.netChange}
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
                              <Pressable key={`${m.opponentId}-${i}`} style={styles.opponentRow} onPress={() => goToOpponent(m.opponentId)}>
                                <Text style={[styles.opponentResult, { color: m.won ? colors.success : colors.danger }]}>{m.won ? 'VUNDET' : 'TABT'}</Text>
                                <Text style={styles.opponentName}>{m.opponentName}</Text>
                                <Text style={[styles.opponentChange, { color: m.ratingAfter >= m.ratingBefore ? colors.success : colors.danger }]}>
                                  {m.ratingAfter >= m.ratingBefore ? '+' : ''}{m.ratingAfter - m.ratingBefore}
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
                    <Text style={styles.placement}>{s.gamesWon} - {s.gamesLost}</Text>
                    <Text style={[styles.change, { color: s.ratingAfter >= s.ratingBefore ? colors.success : colors.danger }]}>
                      {s.ratingAfter >= s.ratingBefore ? '+' : ''}{s.ratingAfter - s.ratingBefore}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </View>

      <Modal visible={showChangePassword} animationType="slide" onRequestClose={closePasswordModal}>
        <View style={styles.modalContainer}>
          <Pressable onPress={closePasswordModal} style={styles.modalCloseButton}>
            <Text style={styles.modalCloseText}>Luk</Text>
          </Pressable>
          <Text style={styles.modalTitle}>Skift kodeord</Text>

          <Text style={styles.modalLabel}>NYT KODEORD</Text>
          <TextInput
            style={styles.modalInput}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.modalLabel}>BEKRÆFT NYT KODEORD</Text>
          <TextInput
            style={styles.modalInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Pressable
            style={[styles.modalButton, changingPassword && styles.modalButtonDisabled]}
            onPress={handleChangePassword}
            disabled={changingPassword}
          >
            <Text style={styles.modalButtonText}>{changingPassword ? 'SKIFTER...' : 'SKIFT KODEORD'}</Text>
          </Pressable>

          {passwordError && <Text style={styles.modalError}>{passwordError}</Text>}
          {passwordSuccess && <Text style={styles.modalSuccess}>Kodeord skiftet!</Text>}
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  header: { paddingTop: 60, paddingBottom: spacing.xl, paddingHorizontal: spacing.md, alignItems: 'center' },
  backButton: { position: 'absolute', top: 60, left: spacing.md, zIndex: 10 },
  backButtonText: { color: '#fff', fontSize: 15, fontFamily: fonts.displayMedium },
  eyebrow: { color: '#fff', opacity: 0.75, fontSize: 11, letterSpacing: 1.5, fontFamily: fonts.displayMedium },
  name: { fontSize: 24, color: '#fff', fontFamily: fonts.display, marginTop: 4 },
  editLink: { color: '#fff', opacity: 0.85, fontSize: 12, textDecorationLine: 'underline', marginTop: 6 },
  privacyLink: { color: '#fff', opacity: 0.6, fontSize: 11, textDecorationLine: 'underline', marginTop: 4 },
  editBox: { width: '100%', marginTop: spacing.sm },
  editLabel: { color: '#fff', opacity: 0.75, fontSize: 10, letterSpacing: 1, marginTop: spacing.sm, marginBottom: 4, fontFamily: fonts.displayMedium },
  editInput: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.sm, padding: 10, color: '#fff', fontSize: 14 },
  editButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  saveButton: { flex: 1, backgroundColor: '#fff', borderRadius: radius.sm, paddingVertical: 10, alignItems: 'center' },
  saveButtonText: { color: colors.primary, fontFamily: fonts.displayMedium, fontSize: 12 },
  cancelButton: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.sm, paddingVertical: 10, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontFamily: fonts.displayMedium, fontSize: 12 },
  editError: { color: '#FFD1D1', fontSize: 11, marginTop: spacing.sm, textAlign: 'center' },
  classBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12, marginTop: spacing.xs },
  classBadgeText: { color: '#fff', fontSize: 11, fontFamily: fonts.displayMedium, letterSpacing: 0.5 },
  ratingsRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.md },
  ratingBlock: { alignItems: 'center', paddingHorizontal: spacing.lg },
  ratingDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 8 },
  rating: { fontSize: 40, color: '#fff', fontFamily: fonts.display },
  rd: { fontSize: 12, color: '#fff', opacity: 0.75, fontFamily: fonts.displayMedium },
  ratingLabel: { color: '#fff', opacity: 0.75, fontSize: 11, letterSpacing: 1.5, fontFamily: fonts.displayMedium, marginTop: 2 },
  connBadge: { marginTop: 6, borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8 },
  connBadgeYes: { backgroundColor: 'rgba(255,255,255,0.2)' },
  connBadgeNo: { backgroundColor: 'rgba(0,0,0,0.25)' },
  connBadgeText: { fontSize: 8, color: '#fff', fontFamily: fonts.displayMedium, letterSpacing: 0.3 },
  connHint: { color: '#fff', opacity: 0.8, fontSize: 11, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.lg },
  body: { backgroundColor: colors.background, padding: spacing.md, minHeight: 400 },
  signOut: { color: colors.primary, fontWeight: '600', marginBottom: spacing.md },
  info: { color: colors.inkMuted, marginBottom: spacing.md },
  error: { color: colors.danger },
  sectionTitle: { fontSize: 12, letterSpacing: 1, color: colors.inkMuted, fontFamily: fonts.displayMedium, marginTop: spacing.md, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardVoided: { opacity: 0.5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  cardDate: { fontSize: 12, color: colors.inkMuted },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  placement: { fontSize: 13, color: colors.inkMuted },
  change: { fontSize: 16, fontFamily: fonts.display },
  voidButton: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  voidButtonText: { color: colors.danger, fontSize: 11, fontFamily: fonts.displayMedium, letterSpacing: 0.5 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  summaryText: { fontSize: 12, color: colors.inkMuted },
  summaryToggle: { fontSize: 10, color: colors.primary, fontFamily: fonts.displayMedium },
  opponentsWrap: { marginTop: spacing.sm, gap: 4 },
  opponentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: 2 },
  opponentResult: { fontSize: 10, fontFamily: fonts.displayMedium, width: 52 },
  opponentName: { fontSize: 12, color: colors.primary, flex: 1, textDecorationLine: 'underline' },
  opponentChange: { fontSize: 11, fontFamily: fonts.display },
  modalContainer: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 60 },
  modalCloseButton: { marginBottom: spacing.lg },
  modalCloseText: { color: colors.primary, fontSize: 15, fontFamily: fonts.displayMedium },
  modalTitle: { fontSize: 22, fontFamily: fonts.display, color: colors.ink, marginBottom: spacing.lg },
  modalLabel: { fontSize: 11, letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.md, color: colors.inkMuted, fontFamily: fonts.displayMedium },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, fontSize: 16, color: colors.ink, backgroundColor: colors.surface },
  modalButton: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 16, marginTop: spacing.lg, alignItems: 'center' },
  modalButtonDisabled: { opacity: 0.4 },
  modalButtonText: { color: '#fff', fontSize: 15, fontFamily: fonts.displayMedium, letterSpacing: 0.5 },
  modalError: { color: colors.danger, marginTop: spacing.md, textAlign: 'center' },
  modalSuccess: { color: colors.success, marginTop: spacing.md, textAlign: 'center' },
})