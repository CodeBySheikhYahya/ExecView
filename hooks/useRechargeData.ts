import { RechargeProcessStatus } from '@/constants/constant';
import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

export interface RechargeRequest {
  id: string;
  recharge_id: string | null;
  player_id: string;
  team_id: string | null;
  game_id: string | null;
  player_platfrom_username_id: string | null;
  amount: number;
  process_status: string | null;
  payment_method_id: string | null;
  screenshot_url: any | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  identifier: string | null;
  target_id: string | null;
  operation_recharge_process_status: string | null;
  verification_recharge_process_status: string | null;
  finance_recharge_process_status: string | null;
  ct_type: string | null;
  operation_recharge_process_by: string | null;
  operation_recharge_process_at: string | null;
  verification_recharge_process_by: string | null;
  verification_recharge_process_at: string | null;
  support_recharge_process_status: string | null;
  support_recharge_process_by: string | null;
  support_recharge_process_at: string | null;
  finance_recharge_process_by: string | null;
  finance_recharge_process_at: string | null;
  bonus_amount: number | null;
  remarks: string | null;
  rejectedreason: string | null;
  bonus_type: string | null;
  bonus_percentage: number | null;
  is_split: boolean | null;
  finance_recharge_processed_by: string | null;
  verification_recharge_processed_by: string | null;
  operation_recharge_processed_by: string | null;
  support_recharge_processed_by: string | null;
  created_by: string | null;
  tag_assigned_by: string | null;
  lr_auto_attempted: boolean | null;
  lr_auto_success: boolean | null;
  lr_auto_message: string | null;
  finance_confirmed_sc_at: string | null;
  // Joined data
  players?: {
    fullname: string | null;
    teams?: {
      team_code: string | null;
    } | null;
  } | null;
  payment_methods?: {
    payment_method: string | null;
    payment_icon: string | null;
  } | null;
}

type TabStatus = 'Pending' | 'Completed' | 'Rejected';

export function useRechargeData(selectedTab: TabStatus, teamId: string | null = null) {
  const [data, setData] = useState<RechargeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      console.log('[useRechargeData] Fetching data - selectedTab:', selectedTab, 'teamId:', teamId);
      try {
        setLoading(true);
        
        let query = supabaseRead
          .from('recharge_requests')
          .select(`
            *,
            players!player_id (
              fullname,
              teams!team_id (
                team_code
              )
            ),
            payment_methods:payment_method_id (
              payment_method,
              payment_icon
            )
          `);

        if (selectedTab === 'Pending') {
          // Include all pending statuses
          const pendingStatuses = [
            RechargeProcessStatus.FINANCE, // "0"
            RechargeProcessStatus.SUPPORT, // "1"
            RechargeProcessStatus.VERIFICATION, // "2"
            RechargeProcessStatus.OPERATION, // "3"
            RechargeProcessStatus.FINANCE_CONFIRMED, // "5"
          ];
          console.log('[useRechargeData] Pending statuses:', pendingStatuses);
          query = query.in('process_status', pendingStatuses);
        } else if (selectedTab === 'Completed') {
          query = query.eq('process_status', RechargeProcessStatus.COMPLETED); // "4"
        } else {
          query = query.eq('process_status', RechargeProcessStatus.FINANCE_REJECTED); // "6"
        }

        if (teamId) {
          console.log('[useRechargeData] Applying team_id filter:', teamId);
          query = query.eq('team_id', teamId);
        } else {
          console.log('[useRechargeData] No team_id filter (showing all teams)');
        }

        const { data: rechargeData, error: fetchError } = await query
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('[useRechargeData] Query error:', fetchError);
          throw fetchError;
        }

        const dataCount = rechargeData?.length || 0;
        console.log('[useRechargeData] ===== RECHARGE DATA COUNT =====');
        console.log('[useRechargeData] Total records fetched from DB:', dataCount);
        console.log('[useRechargeData] Status tab:', selectedTab);
        console.log('[useRechargeData] Team ID filter:', teamId || 'ALL (no filter)');
        console.log('[useRechargeData] =================================');
        
        if (rechargeData && rechargeData.length > 0) {
          console.log('[useRechargeData] Sample record team_id:', rechargeData[0].team_id);
          console.log('[useRechargeData] Sample record team_code:', rechargeData[0].players?.teams?.team_code);
          console.log('[useRechargeData] First record ID:', rechargeData[0].id);
          console.log('[useRechargeData] Last record ID:', rechargeData[rechargeData.length - 1].id);
        }

        console.log('[useRechargeData] Setting data array with', dataCount, 'items');
        setData(rechargeData || []);
        console.log('[useRechargeData] Data set complete');
      } catch (err) {
        console.error('[useRechargeData] Error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch recharge data'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedTab, teamId]);

  return { data, loading, error };
}

