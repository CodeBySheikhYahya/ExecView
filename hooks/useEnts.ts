import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

export function useEnts() {
  const [ents, setEnts] = useState<string[]>(['ALL']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEnts() {
      try {
        setLoading(true);
        
        const { data: teamsData, error: fetchError } = await supabaseRead
          .from('teams')
          .select('team_code, id')
          .order('created_at', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        const teamCodes = teamsData?.map((team) => team.team_code?.toUpperCase()).filter((code): code is string => !!code) || [];
        const allEnts = ['ALL', ...teamCodes];
        
        setEnts(allEnts);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch ENTs'));
      } finally {
        setLoading(false);
      }
    }

    fetchEnts();
  }, []);

  return { ents, loading, error };
}

