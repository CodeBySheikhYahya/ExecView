import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/supabase-credentials';
import { createClient } from '@supabase/supabase-js';

// No-op storage adapter that works in SSR and browser (doesn't use window or AsyncStorage)
const noOpStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

// Check if we're in SSR (Node.js environment without window)
const isSSR = typeof window === 'undefined';

// Create Supabase client
// Use no-op storage to avoid AsyncStorage/window issues during SSR
// In React Native mobile app, sessions won't persist, but auth will still work
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: noOpStorage,
    autoRefreshToken: !isSSR,
    persistSession: !isSSR,
    detectSessionInUrl: false,
  },
});

