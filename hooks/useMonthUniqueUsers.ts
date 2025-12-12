import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

interface UseMonthUniqueUsersParams {
  teamId: string | null; // null for ALL, specific team_id for ENT
}

interface UseMonthUniqueUsersResult {
  count: number | null;
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

export function useMonthUniqueUsers({ teamId }: UseMonthUniqueUsersParams): UseMonthUniqueUsersResult {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      setLoading(true);
      setError(null);
      try {
        const { startDate, endDate } = getMonthRange();

        // Use Supabase RPC for unique users
        const { data, error: rpcError } = await supabaseRead.rpc('get_unique_users', {
          start_date: startDate,
          end_date: endDate,
          p_team_id: teamId,
        });

        if (rpcError) throw rpcError;

        const uniqueCount = (data as number | null) ?? 0;

        if (!cancelled) {
          setCount(uniqueCount);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch month unique users'));
          setCount(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCount();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  return { count, loading, error };
}

