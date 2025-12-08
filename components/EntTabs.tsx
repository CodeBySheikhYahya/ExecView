import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface EntTabsProps {
  ents: string[];
  selectedEnt: string;
  onEntChange: (ent: string) => void;
}

export default function EntTabs({ ents, selectedEnt, onEntChange }: EntTabsProps) {
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}>
        {ents.map((ent) => (
          <TouchableOpacity
            key={ent}
            style={[styles.tab, selectedEnt === ent && styles.activeTab]}
            onPress={() => onEntChange(ent)}>
            <ThemedText style={[styles.tabText, selectedEnt === ent && styles.activeTabText]}>
              {ent}
            </ThemedText>
            {selectedEnt === ent && <ThemedView style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    position: 'relative',
  },
  activeTab: {
    // Active styling handled by text and underline
  },
  tabText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
  activeTabText: {
    fontSize: 14,
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


