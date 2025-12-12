import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

interface UseDailyRedeemTotalParams {
  teamId: string | null; // NULL for all entities, or specific team_id
}

interface UseDailyRedeemTotalResult {
  total: number | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Calculates the date range for daily redeem (7am to 7am window)
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

export function useDailyRedeemTotal({ teamId }: UseDailyRedeemTotalParams): UseDailyRedeemTotalResult {
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
        const { data, error: rpcError } = await supabaseRead.rpc('get_daily_redeem_total', {
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
        console.error('[useDailyRedeemTotal] Error fetching daily redeem total:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch daily redeem total'));
        setTotal(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTotal();
  }, [teamId]);

  return { total, loading, error };
}

