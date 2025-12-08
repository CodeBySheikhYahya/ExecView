import { NewAccountProcessStatus } from '@/constants/constant';
import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

export interface NewAccountRequest {
  id: string;
  account_id: string | null;
  game_username: string | null;
  new_password: string | null;
  remarks: string | null;
  process_status: string | null;
  player_id: string | null;
  game_id: string | null;
  team_id: string | null;
  operation_new_account_process_at: string | null;
  created_at: string;
  // Joined data
  players?: {
    fullname: string | null;
    teams?: {
      team_code: string | null;
    } | null;
  } | null;
  games?: {
    game_name: string | null;
  } | null;
}

type TabStatus = 'Pending' | 'Completed';

export function useNewAccountData(selectedTab: TabStatus, teamId: string | null = null) {
  const [data, setData] = useState<NewAccountRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      console.log('[useNewAccountData] Fetching data - selectedTab:', selectedTab, 'teamId:', teamId);
      try {
        setLoading(true);
        
        let statusFilter: string;
        if (selectedTab === 'Pending') {
          statusFilter = NewAccountProcessStatus.PENDING; // "0"
        } else {
          statusFilter = NewAccountProcessStatus.APPROVED; // "1"
        }

        let query = supabaseRead
          .from('player_platfrom_usernames')
          .select(`
            *,
            players!player_id (
              fullname,
              teams!team_id (
                team_code
              )
            ),
            games!game_id (
              game_name
            )
          `)
          .eq('process_status', statusFilter);

        if (teamId) {
          console.log('[useNewAccountData] Applying team_id filter:', teamId);
          query = query.eq('team_id', teamId);
        } else {
          console.log('[useNewAccountData] No team_id filter (showing all teams)');
        }

        const { data: newAccountData, error: fetchError } = await query
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('[useNewAccountData] Query error:', fetchError);
          throw fetchError;
        }

        console.log('[useNewAccountData] Fetched', newAccountData?.length || 0, 'records');
        setData(newAccountData || []);
      } catch (err) {
        console.error('[useNewAccountData] Error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch new account data'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedTab, teamId]);

  return { data, loading, error };
}

