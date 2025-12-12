import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

interface UseDailyHourlyAvgRechargeParams {
  teamId: string | null; // NULL for all entities, or specific team_id
}

interface UseDailyHourlyAvgRechargeResult {
  hourlyAvg: number | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Calculates the date range for daily hourly average recharge
 * - Start: 7am of the current day (or previous day if before 7am)
 * - End: Current time (NOW) - to calculate hours actually passed since 7am
 * This allows us to divide by actual hours passed, not 24 hours
 */
function getDailyDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Create date at 7:00 AM today
  const today7am = new Date(now);
  today7am.setHours(7, 0, 0, 0);
  
  let startDate: Date;
  
  if (currentHour < 7 || (currentHour === 7 && currentMinute < 0)) {
    // Before 7am: use 7am yesterday as start
    startDate = new Date(today7am);
    startDate.setDate(startDate.getDate() - 1);
  } else {
    // At or after 7am: use 7am today as start
    startDate = today7am;
  }
  
  // End date is always NOW (current time) to calculate actual hours passed
  const endDate = now;
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

export function useDailyHourlyAvgRecharge({ teamId }: UseDailyHourlyAvgRechargeParams): UseDailyHourlyAvgRechargeResult {
  const [hourlyAvg, setHourlyAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchHourlyAvg() {
      try {
        setLoading(true);
        setError(null);
        
        // Calculate date range (7am to NOW - to get actual hours passed)
        const { startDate, endDate } = getDailyDateRange();
        
        // Call RPC function
        const { data, error: rpcError } = await supabaseRead.rpc('get_daily_hourly_avg_recharge', {
          start_date: startDate,
          end_date: endDate,
          p_team_id: teamId,
        });
        
        if (rpcError) {
          throw rpcError;
        }
        
        const avgAmount = data || 0;
        setHourlyAvg(avgAmount);
      } catch (err) {
        console.error('[useDailyHourlyAvgRecharge] Error fetching daily hourly average recharge:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch daily hourly average recharge'));
        setHourlyAvg(null);
      } finally {
        setLoading(false);
      }
    }

    fetchHourlyAvg();
  }, [teamId]);

  return { hourlyAvg, loading, error };
}

