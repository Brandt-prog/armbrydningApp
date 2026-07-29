import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { Club } from '../models/Club'
import type { User } from '../models/User'
import { useLeaderboard } from '../viewmodels/useLeaderboard'

interface LeaderboardScreenProps {
  currentUser: User
  clubs: Club[]
}

export function LeaderboardScreen({ currentUser, clubs }: LeaderboardScreenProps) {
  const [view, setView] = useState<'national' | 'club'>('national')
  const activeClubId = view === 'club' ? currentUser.clubId : null
  const { members, loading, error } = useLeaderboard(activeClubId)

  const clubName = clubs.find((c) => c.id === currentUser.clubId)?.name ?? 'din klub'

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, view === 'national' && styles.tabActive]}
          onPress={() => setView('national')}
        >
          <Text style={[styles.tabText, view === 'national' && styles.tabTextActive]}>
            National
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, view === 'club' && styles.tabActive]}
          onPress={() => setView('club')}
        >
          <Text style={[styles.tabText, view === 'club' && styles.tabTextActive]}>
            {clubName}
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
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <View style={styles.rowInfo}>
                <Text style={styles.name}>{item.name}</Text>
                {view === 'national' && (
                  <Text style={styles.club}>
                    {clubs.find((c) => c.id === item.clubId)?.name ?? 'Ukendt klub'}
                  </Text>
                )}
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
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  tabs: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#1D3D47' },
  tabText: { color: '#1a1a1a', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  info: { color: '#666', fontSize: 14 },
  error: { color: 'red' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  rank: { fontSize: 14, fontWeight: 'bold', color: '#666', width: 32 },
  rowInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  club: { fontSize: 12, color: '#666' },
  rating: { fontSize: 18, fontWeight: 'bold', color: '#1D3D47' },
})