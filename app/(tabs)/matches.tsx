import { colors, spacing } from '@/src/theme/theme';
import { useActiveUsers } from '@/src/viewmodels/useActiveUsers';
import { useMatches } from '@/src/viewmodels/useMatches';
import { AuthGate } from '@/src/views/AuthGate';
import { PendingMatchesView } from '@/src/views/PendingMatchesView';
import { ReportMatchView } from '@/src/views/ReportMatchView';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

function MatchesContent({ currentUserId }: { currentUserId: string }) {
  const { users } = useActiveUsers();
  const { pendingMatches, error, report, confirm, cancel } = useMatches(currentUserId);
  const activeMembers = users.filter((u) => u.id !== currentUserId);

  return (
    <KeyboardAwareScrollView
      style={styles.body}
      contentContainerStyle={styles.bodyContent}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={20}
    >
      <PendingMatchesView
        pendingMatches={pendingMatches}
        activeMembers={activeMembers}
        currentUserId={currentUserId}
        onConfirm={confirm}
        onCancel={cancel}
        error={error}
      />
      <View style={styles.divider} />
      <ReportMatchView
        currentUserId={currentUserId}
        activeMembers={activeMembers}
        onReport={report}
        error={error}
      />
    </KeyboardAwareScrollView>
  );
}

export default function MatchesTab() {
  return (
    <AuthGate>
      {(currentUser) =>
        currentUser.status === 'active' ? (
          <MatchesContent currentUserId={currentUser.id} />
        ) : (
          <View style={styles.body} />
        )
      }
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: colors.background },
  bodyContent: { padding: spacing.md, paddingTop: 60 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
});