import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/supabase-credentials';
import { createClient } from '@supabase/supabase-js';

// No-op storage adapter that works in SSR and browser (doesn't use window or AsyncStorage)
const noOpStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

// Shared read replica client for read-only operations
// Use no-op storage to avoid AsyncStorage/window issues during SSR
export const supabaseRead = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: noOpStorage,
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});


