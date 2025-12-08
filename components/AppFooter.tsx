import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const navItems = [
  { label: 'Dashboard', icon: 'home-outline', route: '/(tabs)' },
  { label: 'Activity', icon: 'list-outline', route: '/(tabs)/activity' },
  { label: 'Status', icon: 'stats-chart-outline', route: '/(tabs)/status' },
  { label: 'Bot', icon: 'chatbubbles-outline', route: '/(tabs)/bot' },
];

export function AppFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const activeColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = pathname === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            style={styles.navItem}
            onPress={() => router.replace(item.route)}>
            <Ionicons
              name={item.icon as any}
              size={22}
              color={isActive ? activeColor : '#6b7280'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  navItem: {
    padding: 8,
  },
});


