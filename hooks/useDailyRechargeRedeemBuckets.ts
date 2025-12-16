import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

interface UseDailyRechargeRedeemBucketsParams {
  teamId: string | null; // NULL for all entities, or specific team_id
  intervalHours?: number; // defaults to 3
  enabled?: boolean; // allow caller to opt out
}

export interface DailyBucket {
  bucketStart: string;
  bucketEnd: string;
  rechargeTotal: number;
  redeemTotal: number;
}

interface UseDailyRechargeRedeemBucketsResult {
  buckets: DailyBucket[];
  loading: boolean;
  error: Error | null;
}

/**
 * Dynamic "since 7am" window:
 * - If current time is >= today 7:00, show [today 7:00, now)
 * - If current time is < today 7:00, show [yesterday 7:00, now)
 */
function getDailyDateRange(): { startDate: string; endDate: string } {
  const now = new Date();

  const todayAt7 = new Date(now);
  todayAt7.setHours(7, 0, 0, 0);

  let windowStart = new Date(todayAt7);
  let windowEnd = new Date(now);

  if (now < todayAt7) {
    // Before today's 7am: start from yesterday 7am up to now
    windowStart.setDate(windowStart.getDate() - 1);
  }

  return {
    startDate: windowStart.toISOString(),
    endDate: windowEnd.toISOString(),
  };
}

export function useDailyRechargeRedeemBuckets({
  teamId,
  intervalHours = 3,
  enabled = true,
}: UseDailyRechargeRedeemBucketsParams): UseDailyRechargeRedeemBucketsResult {
  const [buckets, setBuckets] = useState<DailyBucket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setBuckets([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchBuckets() {
      try {
        setLoading(true);
        setError(null);

        const { startDate, endDate } = getDailyDateRange();

        // Use hourly RPC; intervalHours is currently 1 in the dashboard,
        // but you can later extend the SQL function to accept a custom interval.
        const { data, error: rpcError } = await supabaseRead.rpc(
          'get_hourly_recharge_redeem',
          {
            start_date: startDate,
            end_date: endDate,
            p_team_id: teamId,
          }
        );

        if (rpcError) {
          throw rpcError;
        }

        const rows = (data as any[] | null) ?? [];

        const mapped: DailyBucket[] = rows.map((row) => ({
          bucketStart: row.bucket_start,
          bucketEnd: row.bucket_end,
          rechargeTotal: Number(row.recharge_total ?? 0),
          redeemTotal: Number(row.redeem_total ?? 0),
        }));

        if (!cancelled) {
          setBuckets(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          const wrapped =
            err instanceof Error
              ? err
              : new Error('Failed to fetch daily interval recharge/redeem buckets');
          setError(wrapped);
          setBuckets([]);
          // eslint-disable-next-line no-console
          console.error('[useDailyRechargeRedeemBuckets] Error:', wrapped);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBuckets();

    return () => {
      cancelled = true;
    };
  }, [teamId, intervalHours, enabled]);

  return { buckets, loading, error };
}


