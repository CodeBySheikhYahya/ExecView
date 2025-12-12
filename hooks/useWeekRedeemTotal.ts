import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

interface UseWeekRedeemTotalParams {
  teamId: string | null; // null for ALL, specific team_id for ENT
}

interface UseWeekRedeemTotalResult {
  total: number | null;
  loading: boolean;
  error: Error | null;
}

// Rolling last 7 days in 7am-7am windows:
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

export function useWeekRedeemTotal({ teamId }: UseWeekRedeemTotalParams): UseWeekRedeemTotalResult {
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

        // Use Supabase RPC for week redeem total (7am-aligned window)
        const { data, error: rpcError } = await supabaseRead.rpc('get_week_redeem_total', {
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
          setError(err instanceof Error ? err : new Error('Failed to fetch week redeem total'));
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

