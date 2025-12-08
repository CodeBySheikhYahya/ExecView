import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  title: string;
};

export function AppHeader({ title }: Props) {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initials =
    user?.email?.slice(0, 1).toUpperCase() ||
    user?.user_metadata?.full_name?.slice(0, 1)?.toUpperCase() ||
    'U';

  const handleLogout = async () => {
    setOpen(false);
    const result = await signOut();
    if (result.success) {
      router.replace('/auth/signin');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      <View>
        <TouchableOpacity
          onPress={() => setOpen((prev) => !prev)}
          activeOpacity={0.8}
          style={[
            styles.avatar,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint },
          ]}>
          <ThemedText style={styles.avatarText}>{initials}</ThemedText>
        </TouchableOpacity>
        {open && (
          <View style={styles.dropdown}>
            <ThemedText style={styles.dropdownName}>
              {user?.email || 'User'}
            </ThemedText>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    minWidth: 160,
  },
  dropdownName: {
    marginBottom: 8,
    fontWeight: '600',
  },
  logoutBtn: {
    paddingVertical: 6,
  },
  logoutText: {
    color: '#d14343',
    fontWeight: '600',
  },
});


