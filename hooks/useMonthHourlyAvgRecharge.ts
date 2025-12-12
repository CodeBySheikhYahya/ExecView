import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

interface UseMonthHourlyAvgRechargeParams {
  teamId: string | null; // null for ALL, specific team_id for ENT
}

interface UseMonthHourlyAvgRechargeResult {
  hourlyAvg: number | null;
  loading: boolean;
  error: Error | null;
}

// Rolling last 30 days in 7am-7am windows:
// end = upcoming 7am (today 7am if already passed, else yesterday 7am + 1 day)
// start = end - 30 days
function getMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const today7am = new Date(now);
  today7am.setHours(7, 0, 0, 0);
  if (now < today7am) {
    today7am.setDate(today7am.getDate() - 1);
  }
  const end = new Date(today7am);
  end.setDate(end.getDate() + 1); // next day 7am (exclusive)
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export function useMonthHourlyAvgRecharge({ teamId }: UseMonthHourlyAvgRechargeParams): UseMonthHourlyAvgRechargeResult {
  const [hourlyAvg, setHourlyAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchHourlyAvg() {
      setLoading(true);
      setError(null);
      try {
        const { startDate, endDate } = getMonthRange();

        // Use Supabase RPC for month hourly average (matches daily/week hook pattern)
        const { data, error: rpcError } = await supabaseRead.rpc('get_month_hourly_avg_recharge', {
          start_date: startDate,
          end_date: endDate,
          p_team_id: teamId,
        });

        if (rpcError) throw rpcError;

        const avg = (data as number | null) ?? 0;

        if (!cancelled) {
          setHourlyAvg(avg);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch month hourly average recharge'));
          setHourlyAvg(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHourlyAvg();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  return { hourlyAvg, loading, error };
}

