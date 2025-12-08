import { ResetPasswordRequest } from '@/hooks/useResetPasswordData';
import { FlatList, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface ResetPasswordListProps {
  data: ResetPasswordRequest[];
}

export default function ResetPasswordList({ data }: ResetPasswordListProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getCompletedDuration = (createdAt: string | null, completedAt: string | null) => {
    if (!createdAt || !completedAt) return null;
    const created = new Date(createdAt);
    const completed = new Date(completedAt);
    const diffMs = completed.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const renderItem = ({ item }: { item: ResetPasswordRequest }) => {
    const playerName = item.players?.fullname || 'N/A';
    const teamCode = item.players?.teams?.team_code || 'N/A';
    const gamePlatform = item.game_platform_data?.game_name || 'N/A';
    const completedDuration = item.process_status === '1' 
      ? getCompletedDuration(item.created_at, item.operation_reset_password_process_at)
      : null;

    return (
      <ThemedView style={styles.itemContainer}>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Time:</ThemedText>
          <ThemedView style={styles.valueContainer}>
            <ThemedText style={styles.value}>
              {getRelativeTime(item.created_at)} ({formatDate(item.created_at)})
            </ThemedText>
            {completedDuration !== null && (
              <ThemedText style={styles.completedText}>
                Completed in: {completedDuration} minutes
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Reset ID:</ThemedText>
          <ThemedText style={styles.value}>{item.reset_id || 'N/A'}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Team:</ThemedText>
          <ThemedText style={styles.value}>{teamCode}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>User:</ThemedText>
          <ThemedText style={styles.value}>{playerName}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Game Platform:</ThemedText>
          <ThemedText style={styles.value}>{gamePlatform}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Game Username:</ThemedText>
          <ThemedText style={styles.value}>{item.suggested_username || 'N/A'}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>New Password:</ThemedText>
          <ThemedText style={styles.value}>{item.new_password || 'N/A'}</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  };

  if (data.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No requests found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={true}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    gap: 12,
  },
  itemContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  valueContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  completedText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

