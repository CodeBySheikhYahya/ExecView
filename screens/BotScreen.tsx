import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function BotScreen() {
  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Bot" />
      <View style={styles.content}>
        <ThemedText style={styles.message}>Bot workspace coming soon.</ThemedText>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  message: {
    color: '#0b1a3a',
    fontSize: 16,
    fontWeight: '600',
  },
});


