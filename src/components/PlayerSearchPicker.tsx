import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { User } from '../models/User'
import { colors, fonts, radius, spacing } from '../theme/theme'

const MAX_SUGGESTIONS = 6

interface PlayerSearchPickerProps {
  label: string
  users: User[]
  excludeId?: string
  selected: User | null
  onSelect: (user: User | null) => void
}

export function PlayerSearchPicker({ label, users, excludeId, selected, onSelect }: PlayerSearchPickerProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (query.trim().length === 0) return []
    const lower = query.toLowerCase()
    return users
      .filter((u) => u.id !== excludeId)
      .filter((u) => u.name.toLowerCase().includes(lower) || u.username.toLowerCase().includes(lower))
      .slice(0, MAX_SUGGESTIONS)
  }, [users, excludeId, query])

  if (selected) {
    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={styles.selectedRow}
          onPress={() => {
            onSelect(null)
            setQuery('')
          }}
        >
          <Text style={styles.selectedName}>{selected.name}</Text>
          <Text style={styles.selectedClear}>SKIFT</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Søg efter navn..."
        placeholderTextColor={colors.inkMuted}
      />
      {results.length > 0 && (
        <View style={styles.suggestionsBox}>
          {results.map((u) => (
            <Pressable
              key={u.id}
              style={styles.suggestionRow}
              onPress={() => {
                onSelect(u)
                setQuery('')
              }}
            >
              <Text style={styles.suggestionName}>{u.name}</Text>
              <Text style={styles.suggestionUsername}>@{u.username}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {query.length > 0 && results.length === 0 && (
        <Text style={styles.noResults}>Ingen medlemmer matcher "{query}"</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    color: colors.inkMuted,
    fontFamily: fonts.displayMedium,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  selectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.surface,
  },
  selectedName: { fontSize: 15, fontWeight: '600', color: colors.ink },
  selectedClear: { fontSize: 11, color: colors.primary, fontFamily: fonts.displayMedium },
  suggestionsBox: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, marginTop: 4, overflow: 'hidden' },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  suggestionName: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  suggestionUsername: { color: colors.inkMuted, fontSize: 12 },
  noResults: { fontSize: 12, color: colors.inkMuted, marginTop: 4 },
})