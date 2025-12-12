import { getRechargeType } from '@/constants/constant';
import { RechargeRequest } from '@/hooks/useRechargeData';
import { useRouter } from 'expo-router';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface RequestListProps {
  data: RechargeRequest[];
  showStatus?: boolean;
  showCompletedTime?: boolean;
}

export default function RequestList({ data, showStatus = false, showCompletedTime = false }: RequestListProps) {
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

  const formatDuration = (createdAt: string | null, updatedAt: string | null): string => {
    if (!createdAt || !updatedAt) return 'N/A';
    
    const start = new Date(createdAt).getTime();
    const end = new Date(updatedAt).getTime();
    const diffMs = end - start;
    
    if (diffMs < 0) return 'N/A';
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    const remainingHours = hours % 24;
    
    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    } else if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusColor = (status: string): { text: string; background: string } => {
    if (status === 'Assigned' || status === 'Screenshots Submitted') {
      return { text: '#16a34a', background: '#f0fdf4' }; // green - light
    } else if (status === 'Under Operation') {
      return { text: '#d97706', background: '#fffbeb' }; // yellow - light
    } else if (status === 'SC Confirmation Pending') {
      return { text: '#64748b', background: '#f8fafc' }; // gray - light
    } else if (
      status === 'Operation Cancelled' ||
      status === 'Operation Rejected' ||
      status === 'Verification Rejected' ||
      status === 'Finance Rejected' ||
      status === 'Blocked'
    ) {
      return { text: '#dc2626', background: '#fef2f2' }; // red - light
    }
    return { text: '#2563eb', background: '#eff6ff' }; // default blue - light
  };

  const renderItem = ({ item }: { item: RechargeRequest }) => {
    const playerName = item.players?.fullname || 'N/A';
    const teamCode = item.players?.teams?.team_code || 'N/A';
    const status = item.process_status ? getRechargeType(item.process_status) : 'N/A';
    const statusColors = getStatusColor(status);
    const paymentIcon = item.payment_methods?.payment_icon;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.itemContainer}
        onPress={() =>
          router.push({
            pathname: '/transaction/[id]',
            params: {
              id: item.id,
            },
          })
        }>
        <View style={styles.cardContent}>
          <View style={styles.rowTop}>
            <View style={styles.leftSection}>
              {paymentIcon && (
                <Image
                  source={{ uri: paymentIcon }}
                  style={styles.paymentIcon}
                  resizeMode="contain"
                />
              )}
              <View style={styles.nameSection}>
                <ThemedText style={styles.title}>{playerName}</ThemedText>
                {showStatus && (
                  <View style={[styles.statusBadge, { backgroundColor: statusColors.background }]}>
                    <ThemedText style={[styles.statusText, { color: statusColors.text }]}>
                      {status}
                    </ThemedText>
                  </View>
                )}
                {showCompletedTime && (
                  <ThemedText style={styles.completedTime}>
                    Completed in: {formatDuration(item.created_at, item.updated_at)}
                  </ThemedText>
                )}
              </View>
            </View>
            <View style={styles.rightSection}>
              <ThemedText style={styles.amount}>{formatAmount(item.amount)}</ThemedText>
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
  paymentIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
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
  completedTime: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
    letterSpacing: -0.1,
    marginTop: 4,
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
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});


