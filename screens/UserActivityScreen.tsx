import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function UserActivityScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const colorScheme = useColorScheme();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      const result = await signOut();

      if (result.success) {
        router.replace('/auth/signin');
      } else {
        Alert.alert('Logout failed', result.error || 'Please try again.');
      }
    } catch (error) {
      Alert.alert('Logout failed', 'Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Activity" />
      <View style={styles.content}>
        <ThemedText style={styles.placeholder}>Activity content coming soon.</ThemedText>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.logoutButton,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint },
        ]}
        onPress={handleLogout}
        disabled={isSigningOut}>
        <ThemedText style={styles.logoutText}>
          {isSigningOut ? 'Logging out...' : 'Logout'}
        </ThemedText>
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    marginBottom: 16,
    opacity: 0.7,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 16,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});

