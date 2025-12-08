import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

export function useEnts() {
  const [ents, setEnts] = useState<string[]>(['ALL']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEnts() {
      console.log('[useEnts] Fetching ENTs from database...');
      try {
        setLoading(true);
        
        const { data: teamsData, error: fetchError } = await supabaseRead
          .from('teams')
          .select('team_code, id')
          .order('created_at', { ascending: true });

        if (fetchError) {
          console.error('[useEnts] Error fetching teams:', fetchError);
          throw fetchError;
        }

        console.log('[useEnts] Raw teams data:', teamsData);
        const teamCodes = teamsData?.map((team) => team.team_code?.toUpperCase()).filter((code): code is string => !!code) || [];
        const allEnts = ['ALL', ...teamCodes];
        
        console.log('[useEnts] Processed ENTs:', allEnts);
        setEnts(allEnts);
      } catch (err) {
        console.error('[useEnts] Error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch ENTs'));
      } finally {
        setLoading(false);
      }
    }

    fetchEnts();
  }, []);

  return { ents, loading, error };
}

