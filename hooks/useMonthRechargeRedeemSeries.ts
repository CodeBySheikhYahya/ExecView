import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

interface UseMonthRechargeRedeemSeriesParams {
  teamId: string | null; // NULL for all entities, or specific team_id
  enabled?: boolean;
}

export interface MonthSeriesPoint {
  bucketStart: string;
  bucketEnd: string;
  rechargeTotal: number;
  redeemTotal: number;
}

interface UseMonthRechargeRedeemSeriesResult {
  points: MonthSeriesPoint[];
  loading: boolean;
  error: Error | null;
}

// Rolling last 4 weeks (28 days): end = now, start = now - 28 days
// Actual bucket alignment (Monday 7am) is handled inside the SQL function.
function getFourWeekRange(): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 28);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

export function useMonthRechargeRedeemSeries({
  teamId,
  enabled = true,
}: UseMonthRechargeRedeemSeriesParams): UseMonthRechargeRedeemSeriesResult {
  const [points, setPoints] = useState<MonthSeriesPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setPoints([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchSeries() {
      try {
        setLoading(true);
        setError(null);

        const { startDate, endDate } = getFourWeekRange();

        const { data, error: rpcError } = await supabaseRead.rpc(
          'get_4week_recharge_redeem_series',
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

        const mapped: MonthSeriesPoint[] = rows.map((row) => ({
          bucketStart: row.bucket_start,
          bucketEnd: row.bucket_end,
          rechargeTotal: Number(row.recharge_total ?? 0),
          redeemTotal: Number(row.redeem_total ?? 0),
        }));

        if (!cancelled) {
          setPoints(mapped);
          // eslint-disable-next-line no-console
          console.log('[useMonthRechargeRedeemSeries] teamId:', teamId, 'points:', mapped);
        }
      } catch (err) {
        if (!cancelled) {
          const wrapped =
            err instanceof Error
              ? err
              : new Error('Failed to fetch month (4-week) recharge/redeem series');
          setError(wrapped);
          setPoints([]);
          // eslint-disable-next-line no-console
          console.error('[useMonthRechargeRedeemSeries] Error:', wrapped);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSeries();

    return () => {
      cancelled = true;
    };
  }, [teamId, enabled]);

  return { points, loading, error };
}


