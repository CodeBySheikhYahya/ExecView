import { NewAccountRequest } from '@/hooks/useNewAccountData';
import { FlatList, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface NewAccountListProps {
  data: NewAccountRequest[];
  isCompleted: boolean;
}

export default function NewAccountList({ data, isCompleted }: NewAccountListProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (createdAt: string | null, completedAt: string | null): string | null => {
    if (!createdAt || !completedAt) return null;
    const start = new Date(createdAt).getTime();
    const end = new Date(completedAt).getTime();
    const diffMs = end - start;
    if (diffMs < 0) return null;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    const remainingHours = hours % 24;

    if (days > 0) return `${days}d ${remainingHours}h`;
    if (hours > 0) return `${hours}h ${remainingMinutes}m`;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${seconds}s`;
  };

  const renderItem = ({ item }: { item: NewAccountRequest }) => {
    const playerName = item.players?.fullname || 'N/A';
    const teamCode = item.players?.teams?.team_code || 'N/A';
    const gamePlatform = item.games?.game_name || 'N/A';
    const completedDuration = isCompleted
      ? formatDuration(item.created_at, item.operation_new_account_process_at)
      : null;
    const initial = (playerName?.trim().charAt(0).toUpperCase() as string | undefined) || 'U';
    const statusLabel = isCompleted ? 'Completed' : 'Pending';
    const statusColor = isCompleted ? '#16a34a' : '#d97706';

    return (
      <View style={styles.itemContainer}>
        <View style={styles.cardContent}>
          <View style={styles.rowTop}>
            <View style={styles.leftSection}>
              <View style={styles.iconCircle}>
                <ThemedText style={styles.iconText}>{initial}</ThemedText>
              </View>
              <View style={styles.nameSection}>
                <ThemedText style={styles.title}>{playerName}</ThemedText>
                {isCompleted && completedDuration ? (
                  <ThemedText style={styles.completedTime}>Completed in: {completedDuration}</ThemedText>
                ) : (
                  <ThemedText style={[styles.statusText, { color: statusColor }]}>{statusLabel}</ThemedText>
                )}
              </View>
            </View>
            <View style={styles.rightSection}>
              <ThemedText style={styles.amount}>{item.account_id || 'N/A'}</ThemedText>
              <ThemedText style={styles.subtitle}>{teamCode}</ThemedText>
              <ThemedText style={styles.date}>{formatDate(item.created_at)}</ThemedText>
            </View>
          </View>

          <View style={styles.rowBottom}>
            <ThemedText style={styles.metaLabel}>Game Platform:</ThemedText>
            <ThemedText style={styles.metaValue}>{gamePlatform}</ThemedText>
          </View>
          <View style={styles.rowBottom}>
            <ThemedText style={styles.metaLabel}>Username:</ThemedText>
            <ThemedText style={styles.metaValue}>{item.game_username || 'N/A'}</ThemedText>
          </View>
          <View style={styles.rowBottom}>
            <ThemedText style={styles.metaLabel}>Password:</ThemedText>
            <ThemedText style={styles.metaValue}>{isCompleted ? item.new_password || 'N/A' : '—'}</ThemedText>
          </View>
          <View style={styles.rowBottom}>
            <ThemedText style={styles.metaLabel}>Remarks:</ThemedText>
            <ThemedText style={styles.metaValue}>{item.remarks || 'N/A'}</ThemedText>
          </View>
        </View>
      </View>
    );
  };

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No requests found</ThemedText>
      </View>
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
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 16,
  },
  itemContainer: {
    marginBottom: 0,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  nameSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  completedTime: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 120,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  date: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 13,
    color: '#0f172a',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
  },
  emptyText: {
    fontSize: 16,
    color: '#111827',
  },
});

