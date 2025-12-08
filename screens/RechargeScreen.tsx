import ActivityTypeDropdown from '@/components/ActivityTypeDropdown';
import EntDropdown from '@/components/EntDropdown';
import NewAccountList from '@/components/NewAccountList';
import RedeemList from '@/components/RedeemList';
import RequestList from '@/components/RequestList';
import ResetPasswordList from '@/components/ResetPasswordList';
import StatusTabs from '@/components/StatusTabs';
import TransferList from '@/components/TransferList';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEnts } from '@/hooks/useEnts';
import { useNewAccountData } from '@/hooks/useNewAccountData';
import { usePendingCount } from '@/hooks/usePendingCount';
import { useRechargeData } from '@/hooks/useRechargeData';
import { useRedeemData } from '@/hooks/useRedeemData';
import { useResetPasswordData } from '@/hooks/useResetPasswordData';
import { useTransferData } from '@/hooks/useTransferData';
import { getTeamId } from '@/utils/team-helper';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

type ActivityTabType = 'Recharge' | 'Redeem' | 'Transfer' | 'Reset Password' | 'New Account';
type StatusTabType = 'Pending' | 'Completed' | 'Rejected';
type ResetPasswordStatusType = 'Pending' | 'Completed';
type NewAccountStatusType = 'Pending' | 'Completed';

export default function RechargeScreen() {
  const [selectedTab, setSelectedTab] = useState<ActivityTabType>('Recharge');
  const [selectedStatus, setSelectedStatus] = useState<StatusTabType>('Pending');
  const [selectedResetPasswordStatus, setSelectedResetPasswordStatus] = useState<ResetPasswordStatusType>('Pending');
  const [selectedNewAccountStatus, setSelectedNewAccountStatus] = useState<NewAccountStatusType>('Pending');
  const [selectedEnt, setSelectedEnt] = useState<string>('ALL');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamIdLoading, setTeamIdLoading] = useState(false);
  
  // Fetch ENTs
  const { ents, loading: entsLoading } = useEnts();
  
  // Convert ENT to team_id when ENT changes
  useEffect(() => {
    async function updateTeamId() {
      console.log('[RechargeScreen] ENT changed:', selectedEnt);
      setTeamIdLoading(true);
      try {
        if (selectedEnt === 'ALL') {
          console.log('[RechargeScreen] Setting teamId to null (ALL selected)');
          setTeamId(null);
        } else {
          console.log('[RechargeScreen] Fetching teamId for ENT:', selectedEnt);
          const id = await getTeamId(selectedEnt);
          console.log('[RechargeScreen] Received teamId:', id);
          setTeamId(id);
        }
      } catch (error) {
        console.error('[RechargeScreen] Error fetching team ID:', error);
        setTeamId(null);
      } finally {
        setTeamIdLoading(false);
      }
    }
    updateTeamId();
  }, [selectedEnt]);

  // Log when teamId changes
  useEffect(() => {
    console.log('[RechargeScreen] teamId state updated:', teamId);
  }, [teamId]);
  
  // Fetch pending count for current activity type
  const { count: pendingCount, loading: pendingCountLoading } = usePendingCount(selectedTab, selectedEnt);
  
  useEffect(() => {
    console.log('[RechargeScreen] ===== PENDING COUNT UPDATE =====');
    console.log('[RechargeScreen] pendingCount:', pendingCount);
    console.log('[RechargeScreen] pendingCountLoading:', pendingCountLoading);
    console.log('[RechargeScreen] selectedTab:', selectedTab);
    console.log('[RechargeScreen] selectedEnt:', selectedEnt);
    console.log('[RechargeScreen] ==================================');
  }, [pendingCount, pendingCountLoading, selectedTab, selectedEnt]);
  
  // Fetch data based on selected tab
  const rechargeData = useRechargeData(selectedStatus, teamId);
  const redeemData = useRedeemData(selectedStatus, teamId);
  const transferData = useTransferData(selectedStatus, teamId);
  const resetPasswordData = useResetPasswordData(selectedResetPasswordStatus, teamId);
  const newAccountData = useNewAccountData(selectedNewAccountStatus, teamId);

  const renderContent = () => {
    // Show loading while teamId is being fetched
    if (teamIdLoading) {
      return (
        <ThemedView style={styles.centerContent}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </ThemedView>
      );
    }

    if (selectedTab === 'Recharge') {
      if (rechargeData.loading) {
        return (
          <ThemedView style={styles.centerContent}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>Loading...</ThemedText>
          </ThemedView>
        );
      }
      if (rechargeData.error) {
        return (
          <ThemedView style={styles.centerContent}>
            <ThemedText style={styles.errorText}>Error: {rechargeData.error.message}</ThemedText>
          </ThemedView>
        );
      }
      return <RequestList data={rechargeData.data} />;
    }

    if (selectedTab === 'Redeem') {
      if (redeemData.loading) {
        return (
          <ThemedView style={styles.centerContent}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>Loading...</ThemedText>
          </ThemedView>
        );
      }
      if (redeemData.error) {
        return (
          <ThemedView style={styles.centerContent}>
            <ThemedText style={styles.errorText}>Error: {redeemData.error.message}</ThemedText>
          </ThemedView>
        );
      }
      return <RedeemList data={redeemData.data} />;
    }

    if (selectedTab === 'Transfer') {
      if (transferData.loading) {
        return (
          <ThemedView style={styles.centerContent}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>Loading...</ThemedText>
          </ThemedView>
        );
      }
      if (transferData.error) {
        return (
          <ThemedView style={styles.centerContent}>
            <ThemedText style={styles.errorText}>Error: {transferData.error.message}</ThemedText>
          </ThemedView>
        );
      }
      return <TransferList data={transferData.data} />;
    }

    if (selectedTab === 'Reset Password') {
      if (resetPasswordData.loading) {
        return (
          <ThemedView style={styles.centerContent}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>Loading...</ThemedText>
          </ThemedView>
        );
      }
      if (resetPasswordData.error) {
        return (
          <ThemedView style={styles.centerContent}>
            <ThemedText style={styles.errorText}>Error: {resetPasswordData.error.message}</ThemedText>
          </ThemedView>
        );
      }
      return <ResetPasswordList data={resetPasswordData.data} />;
    }

    if (selectedTab === 'New Account') {
      if (newAccountData.loading) {
        return (
          <ThemedView style={styles.centerContent}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>Loading...</ThemedText>
          </ThemedView>
        );
      }
      if (newAccountData.error) {
        return (
          <ThemedView style={styles.centerContent}>
            <ThemedText style={styles.errorText}>Error: {newAccountData.error.message}</ThemedText>
          </ThemedView>
        );
      }
      return <NewAccountList data={newAccountData.data} isCompleted={selectedNewAccountStatus === 'Completed'} />;
    }

    return null;
  };

  const handleStatusChange = (status: StatusTabType) => {
    if (selectedTab === 'Reset Password') {
      // Only allow Pending or Completed for Reset Password
      if (status === 'Pending' || status === 'Completed') {
        setSelectedResetPasswordStatus(status);
      }
    } else if (selectedTab === 'New Account') {
      // Only allow Pending or Completed for New Account
      if (status === 'Pending' || status === 'Completed') {
        setSelectedNewAccountStatus(status);
      }
    } else {
      setSelectedStatus(status);
    }
  };

  const getCurrentStatus = (): StatusTabType => {
    if (selectedTab === 'Reset Password') {
      return selectedResetPasswordStatus as StatusTabType;
    }
    if (selectedTab === 'New Account') {
      return selectedNewAccountStatus as StatusTabType;
    }
    return selectedStatus;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerText}>User Activity</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.dropdownsContainer}>
        {!entsLoading && ents.length > 0 && (
          <ThemedView style={styles.dropdownWrapper}>
            <EntDropdown ents={ents} selectedEnt={selectedEnt} onEntChange={setSelectedEnt} />
          </ThemedView>
        )}
        <ThemedView style={styles.dropdownWrapper}>
          <ActivityTypeDropdown selectedTab={selectedTab} onTabChange={setSelectedTab} />
        </ThemedView>
      </ThemedView>

      <StatusTabs 
        selectedTab={getCurrentStatus() as StatusTabType} 
        onTabChange={handleStatusChange}
        hideRejected={selectedTab === 'Reset Password' || selectedTab === 'New Account'}
        pendingCount={pendingCount}
      />
      {/* Debug info */}
      {__DEV__ && (
        <ThemedView style={{ padding: 10, backgroundColor: '#f0f0f0' }}>
          <ThemedText style={{ fontSize: 12 }}>Debug: pendingCount = {pendingCount}</ThemedText>
        </ThemedView>
      )}
      {renderContent()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  dropdownsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    justifyContent: 'space-between',
  },
  dropdownWrapper: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

