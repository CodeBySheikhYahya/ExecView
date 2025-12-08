import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type ActivityTabType = 'Recharge' | 'Redeem' | 'Transfer' | 'Reset Password' | 'New Account';

interface HorizontalTabsProps {
  selectedTab: ActivityTabType;
  onTabChange: (tab: ActivityTabType) => void;
}

export default function HorizontalTabs({ selectedTab, onTabChange }: HorizontalTabsProps) {
  const tabs: ActivityTabType[] = ['Recharge', 'Redeem', 'Transfer', 'Reset Password', 'New Account'];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => onTabChange(tab)}>
            <ThemedText style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab}
            </ThemedText>
            {selectedTab === tab && <ThemedView style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 24,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    position: 'relative',
  },
  activeTab: {
    // Active styling handled by text and underline
  },
  tabText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#000',
  },
});

