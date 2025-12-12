import { ResetPasswordRequestStatus } from '@/constants/constant';
import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

export interface ResetPasswordRequest {
  id: string;
  reset_id: string | null;
  player_id: string;
  game_platform: string | null;
  suggested_username: string | null;
  new_password: string | null;
  process_status: string | null;
  team_id: string | null;
  operation_reset_password_process_by: string | null;
  operation_reset_password_process_status: string | null;
  operation_reset_password_process_at: string | null;
  created_by: string | null;
  operation_reset_password_processed_by: string | null;
  lr_auto_attempted: boolean | null;
  lr_auto_success: boolean | null;
  lr_auto_message: string | null;
  created_at: string;
  updated_at: string | null;
  // Joined data
  players?: {
    fullname: string | null;
    teams?: {
      team_code: string | null;
    } | null;
  } | null;
  game_platform_data?: {
    game_name: string | null;
  } | null;
}

type TabStatus = 'Pending' | 'Completed';

export function useResetPasswordData(selectedTab: TabStatus, teamId: string | null = null) {
  const [data, setData] = useState<ResetPasswordRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        let statusFilter: string;
        if (selectedTab === 'Pending') {
          statusFilter = ResetPasswordRequestStatus.PENDING; // "0"
        } else {
          statusFilter = ResetPasswordRequestStatus.COMPLETED; // "1"
        }

        let query = supabaseRead
          .from('reset_password_requests')
          .select(`
            *,
            players!player_id (
              fullname,
              teams!team_id (
                team_code
              )
            ),
            game_platform_data:games!game_platform (
              game_name
            )
          `)
          .eq('process_status', statusFilter);

        if (teamId) {
          query = query.eq('team_id', teamId);
        }

        const { data: resetPasswordData, error: fetchError } = await query
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setData(resetPasswordData || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch reset password data'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedTab, teamId]);

  return { data, loading, error };
}

