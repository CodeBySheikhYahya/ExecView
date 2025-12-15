import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

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
  const activeColor = '#ffffff'; // white icon for active tab
  const inactiveColor = '#e5e7eb'; // light icon for inactive tabs

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {navItems.map((item) => {
          const isActive = pathname === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={styles.navItem}
              // Cast is safe here because routes are known, static strings
              onPress={() => router.replace(item.route as any)}>
              <Ionicons
                name={item.icon as any}
                size={22}
                color={isActive ? activeColor : inactiveColor}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ffffff', // white strip under the purple bar
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundImage: 'linear-gradient(90deg,rgb(99, 102, 241), rgb(179, 103, 255))',
    // backgroundColor: '#5b21b6', // solid purple bar like the design
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  navItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});


