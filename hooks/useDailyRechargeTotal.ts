import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

interface UseDailyRechargeTotalParams {
  teamId: string | null; // NULL for all entities, or specific team_id
}

interface UseDailyRechargeTotalResult {
  total: number | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Calculates the date range for daily recharge (7am to 7am window)
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

export function useDailyRechargeTotal({ teamId }: UseDailyRechargeTotalParams): UseDailyRechargeTotalResult {
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTotal() {
      try {
        setLoading(true);
        setError(null);
        
        // Calculate date range (7am to 7am window)
        const { startDate, endDate } = getDailyDateRange();
        
        // Call RPC function
        const { data, error: rpcError } = await supabaseRead.rpc('get_daily_recharge_total', {
          start_date: startDate,
          end_date: endDate,
          p_team_id: teamId,
        });
        
        if (rpcError) {
          throw rpcError;
        }
        
        const totalAmount = data || 0;
        setTotal(totalAmount);
      } catch (err) {
        console.error('[useDailyRechargeTotal] Error fetching daily recharge total:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch daily recharge total'));
        setTotal(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTotal();
  }, [teamId]);

  return { total, loading, error };
}

