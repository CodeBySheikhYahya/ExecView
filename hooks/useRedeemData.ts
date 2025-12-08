import { RedeemProcessStatus } from '@/constants/constant';
import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

export interface RedeemRequest {
  id: string;
  redeem_id: string | null;
  player_id: string;
  team_id: string;
  game_id: string;
  player_platfrom_username_id: string | null;
  total_amount: number;
  amount_paid: number | null;
  amount_hold: number | null;
  amount_available: number | null;
  process_status: string | null;
  payment_methods_id: string[] | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  screenshots: any | null;
  target_id: string | null;
  operation_redeem_process_status: string | null;
  verification_redeem_process_status: string | null;
  finance_redeem_process_status: string | null;
  operation_redeem_process_by: string | null;
  operation_redeem_process_at: string | null;
  verification_redeem_process_by: string | null;
  verification_redeem_process_at: string | null;
  finance_redeem_process_by: string | null;
  finance_redeem_process_at: string | null;
  hold_status: string | null;
  temp_hold_amount: number | null;
  payment_methods_name: string[] | null;
  tip: string | null;
  rejectedreason: string | null;
  remarks: string | null;
  finance_redeem_processed_by: string | null;
  verification_redeem_processed_by: string | null;
  operation_redeem_processed_by: string | null;
  support_redeem_processed_by: string | null;
  created_by: string | null;
  lr_auto_attempted: boolean | null;
  lr_auto_success: boolean | null;
  lr_auto_message: string | null;
  // Joined data
  players?: {
    fullname: string | null;
    teams?: {
      team_code: string | null;
    } | null;
  } | null;
}

type TabStatus = 'Pending' | 'Completed' | 'Rejected';

export function useRedeemData(selectedTab: TabStatus, teamId: string | null = null) {
  const [data, setData] = useState<RedeemRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      console.log('[useRedeemData] Fetching data - selectedTab:', selectedTab, 'teamId:', teamId);
      try {
        setLoading(true);
        
        let query = supabaseRead
          .from('redeem_requests')
          .select(`
            *,
            players!player_id (
              fullname,
              teams!team_id (
                team_code
              )
            )
          `);

        if (selectedTab === 'Pending') {
          // Include all pending statuses
          const pendingStatuses = [
            RedeemProcessStatus.OPERATION, // "0"
            RedeemProcessStatus.VERIFICATION, // "1"
            RedeemProcessStatus.FINANCE, // "2"
            RedeemProcessStatus.FINANCE_PARTIALLY_PAID, // "4"
          ];
          console.log('[useRedeemData] Pending statuses:', pendingStatuses);
          query = query.in('process_status', pendingStatuses);
        } else if (selectedTab === 'Completed') {
          query = query.eq('process_status', RedeemProcessStatus.COMPLETED); // "5"
        } else {
          // Rejected: Include all rejected statuses
          const rejectedStatuses = [
            RedeemProcessStatus.OPERATIONREJECTED, // "-2"
            RedeemProcessStatus.OPERATIONFAILED, // "7"
            RedeemProcessStatus.VERIFICATIONFAILED, // "8"
            RedeemProcessStatus.FINANCEFAILED, // "9"
            RedeemProcessStatus.FINANCE_REJECTED, // "-10"
          ];
          query = query.in('process_status', rejectedStatuses);
        }

        if (teamId) {
          console.log('[useRedeemData] Applying team_id filter:', teamId);
          query = query.eq('team_id', teamId);
        } else {
          console.log('[useRedeemData] No team_id filter (showing all teams)');
        }

        const { data: redeemData, error: fetchError } = await query
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('[useRedeemData] Query error:', fetchError);
          throw fetchError;
        }

        const dataCount = redeemData?.length || 0;
        console.log('[useRedeemData] ===== REDEEM DATA COUNT =====');
        console.log('[useRedeemData] Total records fetched from DB:', dataCount);
        console.log('[useRedeemData] Status tab:', selectedTab);
        console.log('[useRedeemData] Team ID filter:', teamId || 'ALL (no filter)');
        console.log('[useRedeemData] ==============================');
        
        if (redeemData && redeemData.length > 0) {
          console.log('[useRedeemData] First record ID:', redeemData[0].id);
          console.log('[useRedeemData] Last record ID:', redeemData[redeemData.length - 1].id);
        }

        console.log('[useRedeemData] Setting data array with', dataCount, 'items');
        setData(redeemData || []);
        console.log('[useRedeemData] Data set complete');
      } catch (err) {
        console.error('[useRedeemData] Error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch redeem data'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedTab, teamId]);

  return { data, loading, error };
}

