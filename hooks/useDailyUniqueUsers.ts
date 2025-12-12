import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

interface UseDailyUniqueUsersParams {
  teamId: string | null; // NULL for all entities, or specific team_id
}

interface UseDailyUniqueUsersResult {
  count: number | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Calculates the date range for daily unique users (7am to 7am window)
 * - If current time < 7am: use 7am yesterday to 7am today
 * - If current time >= 7am: use 7am today to 7am tomorrow
 */
function getDailyDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Create date at 7:00 AM today
  const today7am = new Date(now);
  today7am.setHours(7, 0, 0, 0);
  
  let startDate: Date;
  let endDate: Date;
  
  if (currentHour < 7 || (currentHour === 7 && currentMinute < 0)) {
    // Before 7am: use 7am yesterday to 7am today
    startDate = new Date(today7am);
    startDate.setDate(startDate.getDate() - 1);
    endDate = today7am;
  } else {
    // At or after 7am: use 7am today to 7am tomorrow
    startDate = today7am;
    endDate = new Date(today7am);
    endDate.setDate(endDate.getDate() + 1);
  }
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

export function useDailyUniqueUsers({ teamId }: UseDailyUniqueUsersParams): UseDailyUniqueUsersResult {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCount() {
      try {
        setLoading(true);
        setError(null);
        
        // Calculate date range (7am to 7am window)
        const { startDate, endDate } = getDailyDateRange();
        
        // Call RPC function
        const { data, error: rpcError } = await supabaseRead.rpc('get_unique_users', {
          start_date: startDate,
          end_date: endDate,
          p_team_id: teamId,
        });
        
        if (rpcError) {
          throw rpcError;
        }
        
        const uniqueCount = (data as number | null) ?? 0;
        setCount(uniqueCount);
      } catch (err) {
        console.error('[useDailyUniqueUsers] Error fetching daily unique users:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch daily unique users'));
        setCount(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCount();
  }, [teamId]);

  return { count, loading, error };
}

