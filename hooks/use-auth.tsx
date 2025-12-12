import { supabase } from '@/utils/supabase-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for existing session
    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Store access token for API calls (always update on session change)
        if (session.access_token) {
          await AsyncStorage.setItem('auth_token', session.access_token);
        }
        setAuthState({
          user: session.user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      } else {
        // Only clear tokens on explicit sign out events, not on initialization or token refresh
        if (event === 'SIGNED_OUT') {
          await AsyncStorage.removeItem('session_id');
          await AsyncStorage.removeItem('auth_token');
        }
        setAuthState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setAuthState({
          user: null,
          loading: false,
          error: error.message,
          isAuthenticated: false,
        });
        return;
      }

      if (session) {
        // Store access token for API calls
        if (session.access_token) {
          await AsyncStorage.setItem('auth_token', session.access_token);
        }
        setAuthState({
          user: session.user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
    } catch (error: any) {
      setAuthState({
        user: null,
        loading: false,
        error: error?.message || 'Failed to check session',
        isAuthenticated: false,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      // Normalize email
      let normalizedEmail = email.trim();
      if (!normalizedEmail.includes('@')) {
        normalizedEmail = `${normalizedEmail}@techmilesolutions.co`;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (error) {
        setAuthState({
          user: null,
          loading: false,
          error: error.message,
          isAuthenticated: false,
        });
        return { success: false, error: error.message };
      }

      if (data.session && data.user) {
        // Restrict access to Admin only
        const department = (data.user.user_metadata?.department || '').toLowerCase();
        if (department !== 'admin') {
          await supabase.auth.signOut();
          setAuthState({
            user: null,
            loading: false,
            error: 'Access restricted to Admin only.',
            isAuthenticated: false,
          });
          return { success: false, error: 'Access restricted to Admin only.' };
        }

        // Store access token for API calls (save immediately after successful login)
        if (data.session.access_token) {
          await AsyncStorage.setItem('auth_token', data.session.access_token);
        }

        // Generate session ID (format: SESS-{digit}{3 letters})
        const sessionId = generateSessionId();
        await AsyncStorage.setItem('session_id', sessionId);

        // Optionally update users table if it exists
        try {
          const { error: updateError } = await supabase
            .from('users')
            .update({ session_id: sessionId })
            .eq('id', data.user.id);
          // Silently fail if users table doesn't exist
        } catch (e) {
          // Ignore errors
        }

        setAuthState({
          user: data.user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });

        return { success: true, user: data.user };
      }

      return { success: false, error: 'Failed to create session' };
    } catch (error: any) {
      const errorMessage = error?.message || 'Login failed';
      setAuthState({
        user: null,
        loading: false,
        error: errorMessage,
        isAuthenticated: false,
      });
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('session_id');
      await AsyncStorage.removeItem('auth_token');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setAuthState((prev) => ({ ...prev, error: error.message }));
        return { success: false, error: error.message };
      }

      // Clear any remaining stored data for safety
      await AsyncStorage.clear();

      setAuthState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || 'Logout failed';
      setAuthState((prev) => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const getSessionId = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('session_id');
    } catch {
      return null;
    }
  };

  return {
    ...authState,
    signIn,
    signOut,
    getSessionId,
  };
}

// Generate session ID: SESS-{digit}{3 letters}
function generateSessionId(): string {
  const digit = Math.floor(Math.random() * 10);
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  return `SESS-${digit}${letters}`;
}

