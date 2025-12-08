import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = colorScheme === 'dark' ? '#4a5568' : '#e5eaf2';
  const placeholderColor = colorScheme === 'dark' ? '#666' : '#999';

  const handleSignIn = async () => {
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    const result = await signIn(email, password);

    if (result.success && result.user) {
      // Get department from user metadata
      const department = result.user.user_metadata?.department || 'admin';
      
      // Redirect based on department
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
      setErrorMessage('');
    } else {
      setErrorMessage(result.error || 'Invalid credentials');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <ThemedText type="title" style={styles.brand}>
              Techmile's Executive
            </ThemedText>
            <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputShell, { borderColor }]}>
              <Ionicons name="mail-outline" size={18} color="#1f3c88" style={styles.icon} />
              <TextInput
                style={[styles.input, styles.inputTransparent, { color: '#0b1a3a' }]}
                placeholder="Email"
                placeholderTextColor={placeholderColor}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!isLoading}
                returnKeyType="next"
              />
            </View>

            <View style={[styles.inputShell, { borderColor }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#1f3c88" style={styles.icon} />
              <TextInput
                style={[styles.input, styles.inputTransparent, { color: '#0b1a3a' }]}
                placeholder="Password"
                placeholderTextColor={placeholderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                onSubmitEditing={handleSignIn}
                returnKeyType="go"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeButton}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#1f3c88"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.buttonWrapper} onPress={handleSignIn} disabled={isLoading}>
              <LinearGradient
                colors={['#4b6cb7', '#182848']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, isLoading && styles.buttonDisabled]}>
                <ThemedText style={styles.buttonText}>
                  {isLoading ? 'Signing in...' : 'Login'}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            {!!errorMessage && (
              <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 4,
  },
  brand: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#0b1a3a',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.65,
    fontSize: 14,
    color: '#64748b',
  },
  form: {
    gap: 16,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9fbff',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  icon: {
    marginRight: 8,
  },
  eyeButton: {
    padding: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0b1a3a',
  },
  inputTransparent: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  buttonWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  button: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    marginTop: 8,
    color: '#d14343',
    textAlign: 'center',
    fontSize: 13,
  },
});

