import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

type TabType = 'Pending' | 'Completed' | 'Rejected';

interface StatusTabsProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
  hideRejected?: boolean;
  pendingCount?: number;
}

export default function StatusTabs({ selectedTab, onTabChange, hideRejected = false, pendingCount }: StatusTabsProps) {

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'Pending' && styles.pendingActive,
        ]}
        onPress={() => onTabChange('Pending')}>
        <ThemedText
          style={[
            styles.tabText,
            selectedTab === 'Pending' && styles.pendingText,
          ]}>
          Pending
        </ThemedText>
      </TouchableOpacity>
      {!hideRejected && (
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'Rejected' && styles.rejectedActive,
          ]}
          onPress={() => onTabChange('Rejected')}>
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === 'Rejected' && styles.rejectedText,
            ]}>
            Rejected
          </ThemedText>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'Completed' && styles.completedActive,
        ]}
        onPress={() => onTabChange('Completed')}>
        <ThemedText
          style={[
            styles.tabText,
            selectedTab === 'Completed' && styles.completedText,
          ]}>
          Completed
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pendingActive: {
    borderWidth: 1,
    borderColor: '#fbbf24',
    backgroundColor: '#fef9c3',
    borderRadius: 50,
  },
  pendingText: {
    color: '#ca8a04',
    fontWeight: '700',
  },
  rejectedActive: {
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
    borderRadius: 50,
  },
  rejectedText: {
    color: '#991b1b',
    fontWeight: '700',
  },
  completedActive: {
    borderWidth: 1,
    borderColor: '#22c55e',
    backgroundColor: '#dcfce7',
    borderRadius: 50,
  },
  completedText: {
    color: '#166534',
    fontWeight: '700',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

