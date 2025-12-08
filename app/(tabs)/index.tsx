import { StyleSheet, View } from 'react-native';

import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Dashboard" />
      <View style={styles.content}>
        <ThemedText style={styles.subtitle}>No data yet.</ThemedText>
      </View>
      <AppFooter />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  subtitle: {
    opacity: 0.6,
    textAlign: 'center',
    color: '#0b1a3a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
