import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { User } from '../models/User'
import { usePendingMembers } from '../viewmodels/usePendingMembers'

interface AdminApprovalScreenProps {
  currentUser: User
}

export function AdminApprovalScreen({ currentUser }: AdminApprovalScreenProps) {
  const { pendingMembers, loading, error, approve, reject } = usePendingMembers(currentUser)

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Indlæser ventende medlemmer...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ventende medlemmer</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      {pendingMembers.length === 0 ? (
        <Text style={styles.empty}>Ingen medlemmer venter på godkendelse.</Text>
      ) : (
        <FlatList
          data={pendingMembers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.approveButton} onPress={() => approve(item.id)}>
                  <Text style={styles.buttonText}>Godkend</Text>
                </Pressable>
                <Pressable style={styles.rejectButton} onPress={() => reject(item.id)}>
                  <Text style={styles.buttonText}>Afvis</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1a1a1a' },
  empty: { color: '#666', fontSize: 14 },
  error: { color: 'red', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  username: { fontSize: 13, color: '#666' },
  actions: { flexDirection: 'row', gap: 8 },
  approveButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rejectButton: {
    backgroundColor: '#c62828',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
})