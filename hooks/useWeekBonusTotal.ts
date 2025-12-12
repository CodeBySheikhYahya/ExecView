import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

interface UseWeekBonusTotalParams {
  teamId: string | null; // null for ALL, specific team_id for ENT
}

interface UseWeekBonusTotalResult {
  total: number | null;
  loading: boolean;
  error: Error | null;
}

// Rolling last 7 days in 7am-7am windows:
// end = upcoming 7am (today 7am if already passed, else yesterday 7am + 1 day)
// start = end - 7 days
function getWeekRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const today7am = new Date(now);
  today7am.setHours(7, 0, 0, 0);
  if (now < today7am) {
    today7am.setDate(today7am.getDate() - 1);
  }
  const end = new Date(today7am);
  end.setDate(end.getDate() + 1); // next day 7am (exclusive)
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export function useWeekBonusTotal({ teamId }: UseWeekBonusTotalParams): UseWeekBonusTotalResult {
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchTotal() {
      setLoading(true);
      setError(null);
      try {
        const { startDate, endDate } = getWeekRange();

        // Use Supabase RPC for week totals (matches daily hook pattern)
        const { data, error: rpcError } = await supabaseRead.rpc('get_week_bonus_total', {
          start_date: startDate,
          end_date: endDate,
          p_team_id: teamId,
        });

        if (rpcError) throw rpcError;

        const sum = (data as number | null) ?? 0;

        if (!cancelled) {
          setTotal(sum);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch week bonus total'));
          setTotal(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTotal();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  return { total, loading, error };
}

