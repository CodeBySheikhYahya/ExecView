import { getRedeemType } from '@/constants/constant';
import { RedeemRequest } from '@/hooks/useRedeemData';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface RedeemListProps {
  data: RedeemRequest[];
}

export default function RedeemList({ data }: RedeemListProps) {
  const router = useRouter();

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

  const getStatusColor = (status: string): { text: string; background: string } => {
    if (status === 'Pending' || status === 'Queued') {
      return { text: '#2563eb', background: '#eff6ff' };
    }
    if (status === 'Completed') {
      return { text: '#16a34a', background: '#f0fdf4' };
    }
    if (status === 'Cancelled' || status.includes('Rejected') || status.includes('Failed')) {
      return { text: '#dc2626', background: '#fef2f2' };
    }
    return { text: '#6b7280', background: '#f8fafc' };
  };

  const renderItem = ({ item }: { item: RedeemRequest }) => {
    const playerName = item.players?.fullname || 'N/A';
    const teamCode = item.players?.teams?.team_code || 'N/A';
    const status = item.process_status ? getRedeemType(item.process_status) : 'N/A';
    const statusColors = getStatusColor(status);
    const initial = playerName.trim().charAt(0).toUpperCase() || 'R';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.itemContainer}
        onPress={() =>
          router.push({
            pathname: '/redeem/[id]',
            params: { id: item.id },
          })
        }>
        <View style={styles.cardContent}>
          <View style={styles.rowTop}>
            <View style={styles.leftSection}>
              <View style={styles.iconCircle}>
                <ThemedText style={styles.iconText}>{initial}</ThemedText>
              </View>
              <View style={styles.nameSection}>
                <ThemedText style={styles.title}>{playerName}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: statusColors.background }]}>
                  <ThemedText style={[styles.statusText, { color: statusColors.text }]}>
                    {status}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.rightSection}>
              <ThemedText style={styles.amount}>{formatAmount(item.total_amount)}</ThemedText>
              <ThemedText style={styles.subtitle}>{teamCode}</ThemedText>
              <ThemedText style={styles.date}>{formatDate(item.created_at)}</ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  nameSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 120,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  date: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    letterSpacing: -0.1,
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

