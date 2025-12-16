import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

interface UseWeekRechargeRedeemSeriesParams {
  teamId: string | null; // NULL for all entities, or specific team_id
  enabled?: boolean;
}

export interface WeekSeriesPoint {
  bucketDate: string; // ISO date string for the day
  rechargeTotal: number;
  redeemTotal: number;
}

interface UseWeekRechargeRedeemSeriesResult {
  points: WeekSeriesPoint[];
  loading: boolean;
  error: Error | null;
}

// Match the 7am-aligned rolling 7-day window from the existing week hooks
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

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

export function useWeekRechargeRedeemSeries({
  teamId,
  enabled = true,
}: UseWeekRechargeRedeemSeriesParams): UseWeekRechargeRedeemSeriesResult {
  const [points, setPoints] = useState<WeekSeriesPoint[]>([]);
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

        const { startDate, endDate } = getWeekRange();

        // Derive day-by-day series by calling the existing daily RPCs
        const start = new Date(startDate);
        const end = new Date(endDate);

        const dayPromises: Promise<WeekSeriesPoint>[] = [];

        for (
          let d = new Date(start);
          d < end;
          d.setDate(d.getDate() + 1)
        ) {
          const dayStart = new Date(d);
          const dayEnd = new Date(d);
          dayEnd.setDate(dayEnd.getDate() + 1);

          const dayStartIso = dayStart.toISOString();
          const dayEndIso = dayEnd.toISOString();

          dayPromises.push(
            (async () => {
              const [{ data: rechargeData, error: rechargeErr }, { data: redeemData, error: redeemErr }] =
                await Promise.all([
                  supabaseRead.rpc('get_daily_recharge_total', {
                    start_date: dayStartIso,
                    end_date: dayEndIso,
                    p_team_id: teamId,
                  }),
                  supabaseRead.rpc('get_daily_redeem_total', {
                    start_date: dayStartIso,
                    end_date: dayEndIso,
                    p_team_id: teamId,
                  }),
                ]);

              if (rechargeErr) throw rechargeErr;
              if (redeemErr) throw redeemErr;

              return {
                bucketDate: dayStartIso,
                rechargeTotal: Number((rechargeData as number | null) ?? 0),
                redeemTotal: Number((redeemData as number | null) ?? 0),
              } as WeekSeriesPoint;
            })()
          );
        }

        const mapped = await Promise.all(dayPromises);

        if (!cancelled) {
          setPoints(mapped);
          // eslint-disable-next-line no-console
          console.log('[useWeekRechargeRedeemSeries] teamId:', teamId, 'points:', mapped);
        }
      } catch (err) {
        if (!cancelled) {
          const wrapped =
            err instanceof Error
              ? err
              : new Error('Failed to fetch week recharge/redeem series');
          setError(wrapped);
          setPoints([]);
          // eslint-disable-next-line no-console
          console.error('[useWeekRechargeRedeemSeries] Error:', wrapped);
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


