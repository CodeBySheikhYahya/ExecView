import { RechargeRequest } from '@/hooks/useRechargeData';
import { FlatList, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface RequestListProps {
  data: RechargeRequest[];
}

export default function RequestList({ data }: RequestListProps) {
  console.log('[RequestList] ===== RECHARGE LIST RENDER =====');
  console.log('[RequestList] Received data array length:', data.length);
  console.log('[RequestList] Data IDs:', data.map(item => item.id));
  console.log('[RequestList] =================================');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const renderItem = ({ item }: { item: RechargeRequest }) => {
    const playerName = item.players?.fullname || 'N/A';
    const teamCode = item.players?.teams?.team_code || 'N/A';

    return (
      <ThemedView style={styles.itemContainer}>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Recharge ID:</ThemedText>
          <ThemedText style={styles.value}>{item.recharge_id || 'N/A'}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>User Name:</ThemedText>
          <ThemedText style={styles.value}>{playerName}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Amount:</ThemedText>
          <ThemedText style={styles.value}>{formatAmount(item.amount)}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Team:</ThemedText>
          <ThemedText style={styles.value}>{teamCode}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Date:</ThemedText>
          <ThemedText style={styles.value}>{formatDate(item.created_at)}</ThemedText>
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

