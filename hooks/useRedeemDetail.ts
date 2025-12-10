import { useEffect, useState } from 'react';

import { getRedeemType } from '@/constants/constant';
import { supabaseRead } from '@/utils/supabase-read';

export interface RedeemDetail {
  id: string;
  redeem_id: string | null;
  player_id: string;
  team_id: string;
  game_id: string | null;
  player_platfrom_username_id: string | null;
  total_amount: number;
  amount_paid: number | null;
  amount_hold: number | null;
  amount_available: number | null;
  process_status: string | null;
  payment_methods_id: string[] | null;
  payment_methods_name: string[] | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  screenshots: any | null;
  target_id: string | null;
  hold_status: string | null;
  temp_hold_amount: number | null;
  tip: string | null;
  rejectedreason: string | null;
  remarks: string | null;
  finance_redeem_processed_by: string | null;
  verification_redeem_processed_by: string | null;
  operation_redeem_processed_by: string | null;
  support_redeem_processed_by: string | null;
  created_by: string | null;
  players?: {
    fullname: string | null;
    teams?: {
      team_code: string | null;
    } | null;
  } | null;
  games?: {
    game_name: string | null;
  } | null;
  player_platfrom_usernames?: {
    game_username: string | null;
  } | null;
  status?: string;
}

export function useRedeemDetail(id: string) {
  const [data, setData] = useState<RedeemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('[useRedeemDetail] Fetching redeem detail for ID:', id);

        const { data: redeemData, error: fetchError } = await supabaseRead
          .from('redeem_requests')
          .select(`
            *,
            players:player_id (
              fullname,
              teams:team_id (
                team_code
              )
            ),
            games:game_id (*),
            player_platfrom_usernames:player_platfrom_username_id (
              game_username
            ),
            created_by_user:created_by(
              name,
              employee_code
            ),
            support_redeem_processed_by_user:support_redeem_processed_by(
              name,
              employee_code
            ),
            finance_redeem_processed_by_user:finance_redeem_processed_by(
              name,
              employee_code
            ),
            verification_redeem_processed_by_user:verification_redeem_processed_by(
              name,
              employee_code
            ),
            operation_redeem_processed_by_user:operation_redeem_processed_by(
              name,
              employee_code
            )
          `)
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error('[useRedeemDetail] Query error:', fetchError);
          throw fetchError;
        }

        console.log('[useRedeemDetail] ===== REDEEM DETAIL =====');
        console.log('[useRedeemDetail] Full API Response:', JSON.stringify(redeemData, null, 2));
        console.log('[useRedeemDetail] ===========================');

        const dataWithStatus = {
          ...redeemData,
          status: getRedeemType(redeemData?.process_status || ''),
        };

        setData(dataWithStatus as any);
      } catch (err) {
        console.error('[useRedeemDetail] Error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch redeem detail'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  return { data, loading, error };
}


