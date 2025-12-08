import { SUPABASE_ANON_KEY } from '@/constants/supabase-credentials';
import { createClient } from '@supabase/supabase-js';

// Read replica REST API URL (converted from PostgreSQL connection string)
const READ_REPLICA_URL = 'https://qrjaavsmkbhzmxnylwfx-rr-us-east-2-boedb.supabase.co';

// No-op storage adapter that works in SSR and browser (doesn't use window or AsyncStorage)
const noOpStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

// Shared read replica client for read-only operations
// Use no-op storage to avoid AsyncStorage/window issues during SSR
export const supabaseRead = createClient(READ_REPLICA_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: noOpStorage,
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});


