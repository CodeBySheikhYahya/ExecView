import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRechargeDetail } from '@/hooks/useRechargeDetail';

export default function TransactionScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { data, loading, error } = useRechargeDetail(params.id || '');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null) return '$0.00';
    return `$${Number(amount).toFixed(2)}`;
  };

  const totalAmount = data
    ? Number(data.amount || 0) + Number(data.bonus_amount || 0)
    : 0;

  const getScreenshotUrls = (): string[] => {
    if (!data?.screenshot_url) return [];
    
    if (Array.isArray(data.screenshot_url)) {
      return data.screenshot_url
        .map((url: any) => (typeof url === 'string' ? url : null))
        .filter((url: string | null): url is string => url !== null);
    }
    
    if (typeof data.screenshot_url === 'string') {
      return [data.screenshot_url];
    }
    
    return [];
  };

  const screenshotUrls = getScreenshotUrls();

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <AppHeader title="Recharge Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !data) {
    return (
      <ThemedView style={styles.container}>
        <AppHeader title="Recharge Details" />
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            {error?.message || 'Failed to load transaction details'}
          </ThemedText>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <ThemedText style={styles.backText}>Back</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Recharge Details" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <DetailRow label="Recharge ID" value={data.recharge_id || 'N/A'} />
        <DetailRow
          label="Player"
          value={(data as any).players?.fullname || 'N/A'}
        />
        <DetailRow
          label="Username"
          value={(data as any).player_platfrom_usernames?.game_username || 'N/A'}
        />
        <DetailRow
          label="Platform"
          value={(data as any).games?.game_name || 'N/A'}
        />
        <DetailRow
          label="Team"
          value={(data as any).teams?.team_code || 'N/A'}
        />
        <DetailRow label="Amount" value={formatAmount(data.amount)} />
        <DetailRow label="Bonus Amount" value={formatAmount(data.bonus_amount)} />
        <DetailRow label="Total Amount to be loaded" value={formatAmount(totalAmount)} />
        <DetailRow
          label="Payment Method"
          value={(data as any).payment_methods?.payment_method || 'N/A'}
        />
        <DetailRow label="Tag Type" value={data.ct_type || 'N/A'} />
        <DetailRow label="Target ID" value={data.target_id || 'N/A'} />
        <DetailRow label="Remarks" value={data.remarks || 'N/A'} />
        <DetailRow label="Created" value={formatDate(data.created_at)} />

        {screenshotUrls.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="images-outline" size={20} color="#6b7280" />
              <ThemedText style={styles.sectionTitle}>Payment Screenshots</ThemedText>
            </View>
            <View style={styles.screenshotGrid}>
              {screenshotUrls.map((url, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.screenshotThumbnail}
                  onPress={() => setSelectedImage(url)}
                  activeOpacity={0.8}>
                  <Image
                    source={{ uri: url }}
                    style={styles.thumbnailImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.thumbnailOverlay}>
                    <Ionicons name="expand-outline" size={20} color="#ffffff" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Modal
          visible={selectedImage !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedImage(null)}
                activeOpacity={0.8}>
                <Ionicons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.fullImage}
                  contentFit="contain"
                  transition={200}
                />
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ThemedText style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: string;
}) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.label}>{label}:</ThemedText>
      <View style={styles.valueContainer}>
        {icon && <Ionicons name={icon as any} size={18} color="#6b7280" style={styles.icon} />}
        <ThemedText style={styles.value} numberOfLines={3}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
    marginRight: 16,
  },
  valueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  icon: {
    marginRight: 6,
  },
  value: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  section: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  sectionNote: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  screenshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  screenshotThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '90%',
  },
  backBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  backText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 16,
  },
});


