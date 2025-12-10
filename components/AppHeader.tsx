import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';

type Props = {
  title: string;
};

export function AppHeader({ title }: Props) {
  const { user, signOut } = useAuth();
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
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      <View>
        <TouchableOpacity onPress={() => setOpen((prev) => !prev)} activeOpacity={0.8}>
          <LinearGradient
            colors={['#7c3aed', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}>
            <ThemedText style={styles.avatarText}>{initials}</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        {open && (
          <LinearGradient
            colors={['#7c3aed', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dropdown}>
            <ThemedText style={styles.dropdownName}>
              {user?.email || 'User'}
            </ThemedText>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    zIndex: 30,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0b1a3a',
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
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 16,
    minWidth: 170,
    zIndex: 40,
  },
  dropdownName: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#ffffff',
  },
  logoutBtn: {
    paddingVertical: 6,
  },
  logoutText: {
    color: '#ffebee',
    fontWeight: '700',
  },
});


