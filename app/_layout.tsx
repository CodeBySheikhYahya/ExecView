import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to sign in if not authenticated
      router.replace('/auth/signin');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect based on department if authenticated
      const department = user?.user_metadata?.department || 'admin';
      const departmentRoutes: Record<string, string> = {
        support: '/(tabs)/recharge',
        verification: '/(tabs)/recharge',
        operation: '/(tabs)/recharge',
        finance: '/(tabs)/recharge',
        admin: '/(tabs)',
        executive: '/(tabs)',
        monitoring: '/(tabs)/recharge',
        qa: '/(tabs)',
      };
      const route = departmentRoutes[department] || '/(tabs)';
      router.replace(route as any);
    }
  }, [isAuthenticated, loading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
