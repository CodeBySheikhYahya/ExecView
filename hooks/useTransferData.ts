import { TransferRequestStatus } from '@/constants/constant';
import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

export interface TransferRequest {
  id: string;
  transfer_id: string | null;
  player_id: string | null;
  from_platform: string | null;
  to_platform: string | null;
  amount: number | null;
  process_status: string | null;
  from_username: string | null;
  to_username: string | null;
  team_id: string | null;
  operation_transfer_process_by: string | null;
  operation_transfer_process_at: string | null;
  operation_transfer_process_status: string | null;
  created_by: string | null;
  operation_transfer_processed_by: string | null;
  rejectedreason: string | null;
  created_at: string;
  updated_at: string | null;
  // Joined data
  players?: {
    fullname: string | null;
    teams?: {
      team_code: string | null;
    } | null;
  } | null;
  from_platform_game?: {
    game_name: string | null;
  } | null;
  to_platform_game?: {
    game_name: string | null;
  } | null;
  from_username_data?: {
    game_username: string | null;
  } | null;
  to_username_data?: {
    game_username: string | null;
  } | null;
}

type TabStatus = 'Pending' | 'Completed' | 'Rejected';

export function useTransferData(selectedTab: TabStatus, teamId: string | null = null) {
  const [data, setData] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        let statusFilter: string;
        if (selectedTab === 'Pending') {
          statusFilter = TransferRequestStatus.PENDING; // "1"
        } else if (selectedTab === 'Completed') {
          statusFilter = TransferRequestStatus.COMPLETED; // "2"
        } else {
          statusFilter = TransferRequestStatus.CANCELLED; // "3"
        }

        let query = supabaseRead
          .from('transfer_requests')
          .select(`
            *,
            players!player_id (
              fullname,
              teams!team_id (
                team_code
              )
            ),
            from_platform_game:games!from_platform (
              game_name
            ),
            to_platform_game:games!to_platform (
              game_name
            ),
            from_username_data:player_platfrom_usernames!from_username (
              game_username
            ),
            to_username_data:player_platfrom_usernames!to_username (
              game_username
            )
          `)
          .eq('process_status', statusFilter);

        if (teamId) {
          query = query.eq('team_id', teamId);
        }

        const { data: transferData, error: fetchError } = await query
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setData(transferData || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch transfer data'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedTab, teamId]);

  return { data, loading, error };
}

