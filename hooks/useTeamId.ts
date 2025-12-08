import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

export function useTeamId(teamCode: string | null) {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTeamId() {
      if (!teamCode || teamCode === 'ALL') {
        setTeamId(null);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabaseRead
          .from('teams')
          .select('id')
          .eq('team_code', teamCode.toUpperCase())
          .single();

        if (error) {
          throw error;
        }

        setTeamId(data?.id || null);
      } catch (err) {
        setTeamId(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamId();
  }, [teamCode]);

  return { teamId, loading };
}

