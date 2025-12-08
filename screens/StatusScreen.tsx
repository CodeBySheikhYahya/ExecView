import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function StatusScreen() {
  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Status" />
      <View style={styles.content}>
        <ThemedText>App status coming soon.</ThemedText>
      </View>
      <AppFooter />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});


