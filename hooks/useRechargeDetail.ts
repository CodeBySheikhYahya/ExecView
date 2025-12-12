import { RechargeRequest } from '@/hooks/useRechargeData';
import { supabaseRead } from '@/utils/supabase-read';
import { useEffect, useState } from 'react';

// Recharge Process Status enum (matching web app)
enum RechargeProcessStatus {
  FINANCE = "0",
  SUPPORT = "1",
  VERIFICATION = "2",
  OPERATION = "3",
  COMPLETED = "4",
  CANCELLED = "-1",
  FINANCE_CONFIRMED = "5",
  FINANCE_REJECTED = "6",
  VERIFICATIONREJECTED = "16",
  OPERATIONREJECTED = "-2",
  BLOCKED = "-3",
}

// Convert process_status to readable status text (matching web app)
export function getRechargeType(process_status: string): string {
  if (process_status === RechargeProcessStatus.FINANCE) {
    return "Assignment Pending";
  } else if (process_status === RechargeProcessStatus.SUPPORT) {
    return "Assigned";
  } else if (process_status === RechargeProcessStatus.VERIFICATION) {
    return "Screenshots Submitted";
  } else if (process_status === RechargeProcessStatus.OPERATION) {
    return "Under Operation";
  } else if (process_status === RechargeProcessStatus.COMPLETED) {
    return "Completed";
  } else if (process_status === RechargeProcessStatus.CANCELLED) {
    return "Operation Cancelled";
  } else if (process_status === RechargeProcessStatus.OPERATIONREJECTED) {
    return "Operation Rejected";
  } else if (process_status === RechargeProcessStatus.FINANCE_CONFIRMED) {
    return "SC Confirmation Pending";
  } else if (process_status === RechargeProcessStatus.VERIFICATIONREJECTED) {
    return "Verification Rejected";
  } else if (process_status === RechargeProcessStatus.FINANCE_REJECTED) {
    return "Finance Rejected";
  } else if (process_status === RechargeProcessStatus.BLOCKED) {
    return "Blocked";
  }
  return "Unknown";
}

export function useRechargeDetail(id: string) {
  const [data, setData] = useState<RechargeRequest | null>(null);
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

        const { data: rechargeData, error: fetchError } = await supabaseRead
          .from('recharge_requests')
          .select(`
            *,
            players:player_id (
              fullname
            ),
            teams:team_id (*),
            games:game_id (*),
            payment_methods:payment_method_id (
              payment_method,
              payment_icon
            ),
            player_platfrom_usernames:player_platfrom_username_id (
              game_username
            ),
            created_by_user:created_by(
              name,
              employee_code
            ),
            tag_assigned_by_user:tag_assigned_by(
              name,
              employee_code
            ),
            support_processed_by_user:support_recharge_processed_by(
              name,
              employee_code
            ),
            finance_processed_by_user:finance_recharge_processed_by(
              name,
              employee_code
            ),
            verification_processed_by_user:verification_recharge_processed_by(
              name,
              employee_code
            ),
            operation_processed_by_user:operation_recharge_processed_by(
              name,
              employee_code
            )
          `)
          .eq('id', id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        // Add readable status to the data
        const dataWithStatus = {
          ...rechargeData,
          status: getRechargeType(rechargeData?.process_status || ""),
        };

        setData(dataWithStatus as any);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch recharge detail'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  return { data, loading, error };
}