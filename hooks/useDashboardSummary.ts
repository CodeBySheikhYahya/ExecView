import { useEffect, useState } from 'react';

import { supabaseRead } from '@/utils/supabase-read';

export type DashboardRange = 'Day' | 'Week' | 'Month';

export type DashboardRow = {
  teamCode: string;
  inAmount: number;
  outAmount: number;
  totalCredits: number;
  bonus: number;
  bonusPct: number;
  holdingPct: number;
};

type Params = {
  range: DashboardRange;
  teamCodes: string[] | null;
};

type State = {
  data: DashboardRow[];
  loading: boolean;
  error: string | null;
};

export function useDashboardSummary({ range, teamCodes }: Params): State {
  const [state, setState] = useState<State>({ data: [], loading: true, error: null });

  useEffect(() => {
    const { startDate, endDate } = computeDateRange(range);

    if (teamCodes === null) {
      // Wait until teams are available to avoid sending null to the RPC
      setState((prev) => ({ ...prev, loading: true, error: null }));
      return;
    }

    let isMounted = true;
    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        // Expect a Postgres function `dashboard_summary(team_codes text[], start_date date, end_date date)`
        const { data, error } = await supabaseRead.rpc('dashboard_summary', {
          team_codes: teamCodes,
          start_date: startDate,
          end_date: endDate,
        });

        if (error) throw error;
        const normalized = (data as any[] | null)?.map(normalizeRow) ?? [];
        if (isMounted) setState({ data: normalized, loading: false, error: null });
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setState({ data: [], loading: false, error: message });
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [range, teamCodes]);

  return state;
}

function computeDateRange(range: DashboardRange) {
  const end = new Date();
  const start = new Date(end);
  if (range === 'Week') {
    start.setDate(end.getDate() - 6);
  } else if (range === 'Month') {
    start.setDate(end.getDate() - 29);
  }
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);
  return { startDate, endDate };
}

function normalizeRow(row: any): DashboardRow {
  return {
    teamCode: row?.Team_Code ?? row?.team_code ?? 'Unknown',
    inAmount: toNumber(row?.In ?? row?.in),
    outAmount: toNumber(row?.Out ?? row?.out),
    totalCredits: toNumber(row?.Total_Credits_Loaded ?? row?.total_credits_loaded),
    bonus: toNumber(row?.Bonus ?? row?.bonus),
    bonusPct: toNumber(row?.['Bonus_%'] ?? row?.bonus_pct ?? row?.bonus_percent),
    holdingPct: toNumber(row?.['Holding_%'] ?? row?.holding_pct ?? row?.holding_percent),
  };
}

function toNumber(val: any): number {
  const num = typeof val === 'string' ? Number(val) : (val as number);
  return Number.isFinite(num) ? num : 0;
}

