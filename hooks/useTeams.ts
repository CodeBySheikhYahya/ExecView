import { useEffect, useState } from 'react';

import { supabaseRead } from '@/utils/supabase-read';

type State = {
  teams: string[];
  loading: boolean;
  error: string | null;
};

export function useTeams(): State {
  const [state, setState] = useState<State>({ teams: ['ALL'], loading: true, error: null });

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data, error } = await supabaseRead
          .from('teams')
          .select('team_code')
          .order('created_at', { ascending: true });

        if (error) throw error;
        const codes =
          data?.map((row) => row.team_code?.toUpperCase()).filter((c): c is string => !!c) || [];
        const uniqueCodes = Array.from(new Set(codes));
        if (isMounted) setState({ teams: ['ALL', ...uniqueCodes], loading: false, error: null });
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Failed to load teams';
        setState({ teams: ['ALL'], loading: false, error: message });
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}




