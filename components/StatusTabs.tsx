import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type TabType = 'Pending' | 'Completed' | 'Rejected';

interface StatusTabsProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
  hideRejected?: boolean;
  pendingCount?: number;
}

export default function StatusTabs({ selectedTab, onTabChange, hideRejected = false, pendingCount }: StatusTabsProps) {
  console.log('[StatusTabs] ===== RENDER =====');
  console.log('[StatusTabs] Received pendingCount:', pendingCount);
  console.log('[StatusTabs] pendingCount type:', typeof pendingCount);
  console.log('[StatusTabs] pendingCount !== undefined:', pendingCount !== undefined);
  console.log('[StatusTabs] Display text will be:', `Pending${pendingCount !== undefined ? ` (${pendingCount})` : ''}`);
  console.log('[StatusTabs] ===================');

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'Pending' && styles.activeTab]}
        onPress={() => onTabChange('Pending')}>
        <ThemedText style={[styles.tabText, selectedTab === 'Pending' && styles.activeTabText]}>
          Pending{pendingCount !== undefined ? ` (${pendingCount})` : ''}
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'Completed' && styles.activeTab]}
        onPress={() => onTabChange('Completed')}>
        <ThemedText style={[styles.tabText, selectedTab === 'Completed' && styles.activeTabText]}>
          Completed
        </ThemedText>
      </TouchableOpacity>
      {!hideRejected && (
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Rejected' && styles.activeTab]}
          onPress={() => onTabChange('Rejected')}>
          <ThemedText style={[styles.tabText, selectedTab === 'Rejected' && styles.activeTabText]}>
            Rejected
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

