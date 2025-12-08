import { NewAccountProcessStatus, RechargeProcessStatus, RedeemProcessStatus, ResetPasswordRequestStatus, TransferRequestStatus } from '@/constants/constant';
import { supabaseRead } from '@/utils/supabase-read';
import { getTeamId } from '@/utils/team-helper';
import { useEffect, useState } from 'react';

type ActivityType = 'Recharge' | 'Redeem' | 'Transfer' | 'Reset Password' | 'New Account';

export function usePendingCount(activityType: ActivityType, selectedEnt: string = 'ALL') {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      try {
        setLoading(true);
        console.log('[usePendingCount] Fetching count for:', activityType, 'ENT:', selectedEnt);
        
        const teamId = selectedEnt === 'ALL' ? null : await getTeamId(selectedEnt);
        console.log('[usePendingCount] Team ID:', teamId);
        
        let query;
        
        let dataCount = 0;
        
        if (activityType === 'Recharge') {
          const pendingStatuses = [
            RechargeProcessStatus.FINANCE,
            RechargeProcessStatus.SUPPORT,
            RechargeProcessStatus.VERIFICATION,
            RechargeProcessStatus.OPERATION,
            RechargeProcessStatus.FINANCE_CONFIRMED,
          ];
          query = supabaseRead
            .from('recharge_requests')
            .select('id', { count: 'exact' })
            .in('process_status', pendingStatuses);
          
          if (teamId) {
            query = query.eq('team_id', teamId);
          }
        } else if (activityType === 'Redeem') {
          const pendingStatuses = [
            RedeemProcessStatus.OPERATION,
            RedeemProcessStatus.VERIFICATION,
            RedeemProcessStatus.FINANCE,
            RedeemProcessStatus.FINANCE_PARTIALLY_PAID,
          ];
          query = supabaseRead
            .from('redeem_requests')
            .select('id', { count: 'exact' })
            .in('process_status', pendingStatuses);
          
          if (teamId) {
            query = query.eq('team_id', teamId);
          }
        } else if (activityType === 'Transfer') {
          query = supabaseRead
            .from('transfer_requests')
            .select('id', { count: 'exact' })
            .eq('process_status', TransferRequestStatus.PENDING);
          
          if (teamId) {
            query = query.eq('team_id', teamId);
          }
        } else if (activityType === 'Reset Password') {
          query = supabaseRead
            .from('reset_password_requests')
            .select('id', { count: 'exact' })
            .eq('process_status', ResetPasswordRequestStatus.PENDING);
          
          if (teamId) {
            query = query.eq('team_id', teamId);
          }
        } else if (activityType === 'New Account') {
          query = supabaseRead
            .from('player_platfrom_usernames')
            .select('id', { count: 'exact' })
            .eq('process_status', NewAccountProcessStatus.PENDING);
          
          if (teamId) {
            query = query.eq('team_id', teamId);
          }
        } else {
          setCount(0);
          setLoading(false);
          return;
        }

        const response = await query;
        
        console.log('[usePendingCount] ===== FULL QUERY RESPONSE =====');
        console.log('[usePendingCount] Response:', response);
        console.log('[usePendingCount] Response count:', response.count);
        console.log('[usePendingCount] Response error:', response.error);
        console.log('[usePendingCount] Response data length:', response.data?.length);
        console.log('[usePendingCount] ================================');

        if (response.error) {
          console.error('[usePendingCount] Query error:', response.error);
          // Fallback: count the data array if count is not available
          if (response.data) {
            dataCount = response.data.length;
            console.log('[usePendingCount] Using fallback count from data array:', dataCount);
          } else {
            dataCount = 0;
          }
        } else {
          // Use count if available, otherwise count data array
          dataCount = response.count ?? (response.data?.length || 0);
          console.log('[usePendingCount] Success! Count:', dataCount);
        }

        console.log('[usePendingCount] Final count to set:', dataCount);
        setCount(dataCount);
        console.log('[usePendingCount] Count state set complete');
      } catch (err) {
        console.error('[usePendingCount] Exception:', err);
        setCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchCount();
  }, [activityType, selectedEnt]);

  useEffect(() => {
    console.log('[usePendingCount] ===== STATE UPDATE =====');
    console.log('[usePendingCount] Current count state:', count);
    console.log('[usePendingCount] Current loading state:', loading);
    console.log('[usePendingCount] ========================');
  }, [count, loading]);

  return { count, loading };
}

