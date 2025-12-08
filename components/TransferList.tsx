import { TransferRequest } from '@/hooks/useTransferData';
import { FlatList, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface TransferListProps {
  data: TransferRequest[];
}

export default function TransferList({ data }: TransferListProps) {
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

  const formatAmount = (amount: number | null) => {
    if (!amount) return '$0.00';
    return `$${amount.toFixed(2)}`;
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

  const renderItem = ({ item }: { item: TransferRequest }) => {
    const playerName = item.players?.fullname || 'N/A';
    const teamCode = item.players?.teams?.team_code || 'N/A';
    const fromPlatform = item.from_platform_game?.game_name || 'N/A';
    const toPlatform = item.to_platform_game?.game_name || 'N/A';
    const fromUsername = item.from_username_data?.game_username || '';
    const toUsername = item.to_username_data?.game_username || '';

    return (
      <ThemedView style={styles.itemContainer}>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Time:</ThemedText>
          <ThemedText style={styles.value}>
            {getRelativeTime(item.created_at)} ({formatDate(item.created_at)})
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Transfer ID:</ThemedText>
          <ThemedText style={styles.value}>{item.transfer_id || 'N/A'}</ThemedText>
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
          <ThemedText style={styles.label}>From:</ThemedText>
          <ThemedText style={styles.value}>
            {fromPlatform} {fromUsername && `(${fromUsername})`}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>To:</ThemedText>
          <ThemedText style={styles.value}>
            {toPlatform} {toUsername && `(${toUsername})`}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Amount:</ThemedText>
          <ThemedText style={styles.value}>{formatAmount(item.amount)}</ThemedText>
        </ThemedView>
        {item.rejectedreason && (
          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Rejection Reason:</ThemedText>
            <ThemedText style={styles.value}>{item.rejectedreason}</ThemedText>
          </ThemedView>
        )}
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

