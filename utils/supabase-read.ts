import { SUPABASE_ANON_KEY } from '@/constants/supabase-credentials';
import { createClient } from '@supabase/supabase-js';

// Read replica REST API URL (converted from PostgreSQL connection string)
const READ_REPLICA_URL = 'https://qrjaavsmkbhzmxnylwfx-rr-us-east-2-boedb.supabase.co';

// Shared read replica client for read-only operations
export const supabaseRead = createClient(READ_REPLICA_URL, SUPABASE_ANON_KEY);

