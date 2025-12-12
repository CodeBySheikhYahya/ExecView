import ActivityTypeDropdown from '@/components/ActivityTypeDropdown';
import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import EntDropdown from '@/components/EntDropdown';
import NewAccountList from '@/components/NewAccountList';
import RedeemList from '@/components/RedeemList';
import RequestList from '@/components/RequestList';
import ResetPasswordList from '@/components/ResetPasswordList';
import StatusTabs from '@/components/StatusTabs';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TransferList from '@/components/TransferList';
import { useDailyRechargeTotal } from '@/hooks/useDailyRechargeTotal';
import { useDailyRedeemTotal } from '@/hooks/useDailyRedeemTotal';
import { useEnts } from '@/hooks/useEnts';
import { useNewAccountData } from '@/hooks/useNewAccountData';
import { usePendingCount } from '@/hooks/usePendingCount';
import { useRechargeData } from '@/hooks/useRechargeData';
import { useRedeemData } from '@/hooks/useRedeemData';
import { useResetPasswordData } from '@/hooks/useResetPasswordData';
import { useTransferData } from '@/hooks/useTransferData';
import { getTeamId } from '@/utils/team-helper';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

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
      setTeamIdLoading(true);
      try {
        if (selectedEnt === 'ALL') {
          setTeamId(null);
        } else {
          const id = await getTeamId(selectedEnt);
          setTeamId(id);
        }
      } catch (error) {
        setTeamId(null);
      } finally {
        setTeamIdLoading(false);
      }
    }
    updateTeamId();
  }, [selectedEnt]);
  
  // Fetch pending count for current activity type
  const { count: pendingCount, loading: pendingCountLoading } = usePendingCount(selectedTab, selectedEnt);
  
  // Fetch data based on selected tab
  const rechargeData = useRechargeData(selectedStatus, teamId);
  
  // Fetch daily recharge total (only when Recharge tab is selected)
  const dailyRechargeTotal = useDailyRechargeTotal({ teamId });
  
  // Fetch daily redeem total (only when Redeem tab is selected)
  const dailyRedeemTotal = useDailyRedeemTotal({ teamId });
  
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
      return (
        <View style={styles.rechargeContainer}>
          {/* Daily Recharge Total Display */}
          <View style={styles.totalContainer}>
            <ThemedText style={styles.totalLabel}>
              {selectedEnt === 'ALL' ? 'RECHARGE (ALL ENT)' : `RECHARGE (${selectedEnt})`}
            </ThemedText>
            {dailyRechargeTotal.loading ? (
              <ActivityIndicator size="small" style={styles.totalLoading} />
            ) : dailyRechargeTotal.error ? (
              <ThemedText style={styles.totalError}>Error loading total</ThemedText>
            ) : (
              <ThemedText style={styles.totalAmount}>
                {dailyRechargeTotal.total !== null 
                  ? `$${dailyRechargeTotal.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '$0.00'}
              </ThemedText>
            )}
          </View>
          
          <RequestList
            data={rechargeData.data}
            showStatus={selectedStatus === 'Pending' || selectedStatus === 'Rejected'}
            showCompletedTime={selectedStatus === 'Completed'}
          />
        </View>
      );
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
      return (
        <View style={styles.rechargeContainer}>
          {/* Daily Redeem Total Display */}
          <View style={styles.totalContainer}>
            <ThemedText style={styles.totalLabel}>
              {selectedEnt === 'ALL' ? 'REDEEM (ALL ENT)' : `REDEEM (${selectedEnt})`}
            </ThemedText>
            {dailyRedeemTotal.loading ? (
              <ActivityIndicator size="small" style={styles.totalLoading} />
            ) : dailyRedeemTotal.error ? (
              <ThemedText style={styles.totalError}>Error loading total</ThemedText>
            ) : (
              <ThemedText style={styles.totalAmount}>
                {dailyRedeemTotal.total !== null 
                  ? `$${dailyRedeemTotal.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '$0.00'}
              </ThemedText>
            )}
          </View>
          
          <RedeemList data={redeemData.data} />
        </View>
      );
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
      <AppHeader title="Activity" />
      <View style={styles.content}>
        <View style={styles.dropdownsContainer}>
          {!entsLoading && ents.length > 0 && (
            <View style={styles.dropdownWrapper}>
              <EntDropdown ents={ents} selectedEnt={selectedEnt} onEntChange={setSelectedEnt} />
            </View>
          )}
          <View style={styles.dropdownWrapper}>
            <ActivityTypeDropdown selectedTab={selectedTab} onTabChange={setSelectedTab} />
          </View>
        </View>

        <StatusTabs
          selectedTab={getCurrentStatus() as StatusTabType}
          onTabChange={handleStatusChange}
          hideRejected={selectedTab === 'Reset Password' || selectedTab === 'New Account'}
          pendingCount={pendingCount}
        />
        {renderContent()}
      </View>
      <AppFooter />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  dropdownsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  rechargeContainer: {
    flex: 1,
  },
  totalContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  totalLoading: {
    marginTop: 8,
  },
  totalError: {
    fontSize: 14,
    color: 'red',
    marginTop: 8,
  },
});

