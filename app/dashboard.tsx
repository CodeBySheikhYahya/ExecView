import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import EntDropdown from '@/components/EntDropdown';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDailyBonusTotal } from '@/hooks/useDailyBonusTotal';
import { useDailyHourlyAvgRecharge } from '@/hooks/useDailyHourlyAvgRecharge';
import { useDailyRechargeTotal } from '@/hooks/useDailyRechargeTotal';
import { useDailyRedeemTotal } from '@/hooks/useDailyRedeemTotal';
import { useDailyUniqueUsers } from '@/hooks/useDailyUniqueUsers';
import { useEnts } from '@/hooks/useEnts';
import { useMonthBonusTotal } from '@/hooks/useMonthBonusTotal';
import { useMonthHourlyAvgRecharge } from '@/hooks/useMonthHourlyAvgRecharge';
import { useMonthRechargeTotal } from '@/hooks/useMonthRechargeTotal';
import { useMonthRedeemTotal } from '@/hooks/useMonthRedeemTotal';
import { useMonthUniqueUsers } from '@/hooks/useMonthUniqueUsers';
import { useWeekBonusTotal } from '@/hooks/useWeekBonusTotal';
import { useWeekHourlyAvgRecharge } from '@/hooks/useWeekHourlyAvgRecharge';
import { useWeekRechargeTotal } from '@/hooks/useWeekRechargeTotal';
import { useWeekRedeemTotal } from '@/hooks/useWeekRedeemTotal';
import { useWeekUniqueUsers } from '@/hooks/useWeekUniqueUsers';
import { getTeamId } from '@/utils/team-helper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
// Helper function to get daily date range (7am-7am window)
type RangeOption = 'Day' | 'Week' | 'Month';

function getDailyDateRange(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Create date at 7:00 AM today
  const today7am = new Date(now);
  today7am.setHours(7, 0, 0, 0);
  
  let startDate: Date;
  let endDate: Date;
  
  if (currentHour < 7 || (currentHour === 7 && currentMinute < 0)) {
    // Before 7am: use 7am yesterday to 7am today
    startDate = new Date(today7am);
    startDate.setDate(startDate.getDate() - 1);
    endDate = today7am;
  } else {
    // At or after 7am: use 7am today to 7am tomorrow
    startDate = today7am;
    endDate = new Date(today7am);
    endDate.setDate(endDate.getDate() + 1);
  }
  
  return { startDate, endDate };
}

// Helper function to get week date range (rolling 7 days, 7am-aligned)
function getWeekDateRange(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const today7am = new Date(now);
  today7am.setHours(7, 0, 0, 0);
  if (now < today7am) {
    today7am.setDate(today7am.getDate() - 1);
  }
  const end = new Date(today7am);
  end.setDate(end.getDate() + 1); // next day 7am (exclusive)
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  return { startDate: start, endDate: end };
}

// Helper function to get month date range (rolling 30 days, 7am-aligned)
function getMonthDateRange(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const today7am = new Date(now);
  today7am.setHours(7, 0, 0, 0);
  if (now < today7am) {
    today7am.setDate(today7am.getDate() - 1);
  }
  const end = new Date(today7am);
  end.setDate(end.getDate() + 1); // next day 7am (exclusive)
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return { startDate: start, endDate: end };
}

// Format date for display
function formatDateRange(startDate: Date, endDate: Date): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export default function DashboardScreen() {
  const { ents, loading: entsLoading } = useEnts();

  const [ent, setEnt] = useState<string>('ALL');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [range, setRange] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [teamLoading, setTeamLoading] = useState<boolean>(false);
  const [teamError, setTeamError] = useState<string | null>(null);

  // Daily totals (7am-7am) same as Activity page
  const dailyRechargeTotal = useDailyRechargeTotal({ teamId });
  const dailyRedeemTotal = useDailyRedeemTotal({ teamId });
  const dailyBonusTotal = useDailyBonusTotal({ teamId });
  const dailyUniqueUsers = useDailyUniqueUsers({ teamId });
  const dailyHourlyAvgRecharge = useDailyHourlyAvgRecharge({ teamId });
  const weekRechargeTotal = useWeekRechargeTotal({ teamId });
  const weekRedeemTotal = useWeekRedeemTotal({ teamId });
  const weekBonusTotal = useWeekBonusTotal({ teamId });
  const weekUniqueUsers = useWeekUniqueUsers({ teamId });
  const weekHourlyAvgRecharge = useWeekHourlyAvgRecharge({ teamId });
  const monthRechargeTotal = useMonthRechargeTotal({ teamId });
  const monthRedeemTotal = useMonthRedeemTotal({ teamId });
  const monthBonusTotal = useMonthBonusTotal({ teamId });
  const monthUniqueUsers = useMonthUniqueUsers({ teamId });
  const monthHourlyAvgRecharge = useMonthHourlyAvgRecharge({ teamId });

  const currentTotals =
    range === 'Day'
      ? { recharge: dailyRechargeTotal, redeem: dailyRedeemTotal, bonus: dailyBonusTotal, uniqueUsers: dailyUniqueUsers, hourlyAvgRecharge: dailyHourlyAvgRecharge }
      : range === 'Week'
      ? { recharge: weekRechargeTotal, redeem: weekRedeemTotal, bonus: weekBonusTotal, uniqueUsers: weekUniqueUsers, hourlyAvgRecharge: weekHourlyAvgRecharge }
      : { recharge: monthRechargeTotal, redeem: monthRedeemTotal, bonus: monthBonusTotal, uniqueUsers: monthUniqueUsers, hourlyAvgRecharge: monthHourlyAvgRecharge };

  // Temporary mock data to mirror the “balance” style chart until backend exposes per-month series.
  const monthlyPillData = useMemo(
    () => [
      { month: 'Jan', redeem: 52, recharge: 62 },
      { month: 'Feb', redeem: 35, recharge: 58 },
      { month: 'Mar', redeem: 48, recharge: 44 },
      { month: 'Apr', redeem: 28, recharge: 60 },
      { month: 'May', redeem: 40, recharge: 50 },
      { month: 'Jun', redeem: 18, recharge: 72 },
      { month: 'Jul', redeem: 30, recharge: 48 },
      { month: 'Aug', redeem: 24, recharge: 66 },
      { month: 'Sep', redeem: 42, recharge: 54 },
    ],
    []
  );

  const weeklyBarData = useMemo(() => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const rechargeHeights = [6, 9, 5, 8, 7, 10, 6];
    const redeemHeights = [4, 6, 3, 5, 4, 7, 3];

    const bars: { value: number; label: string; frontColor: string }[] = [];
    labels.forEach((label, idx) => {
      bars.push({ value: rechargeHeights[idx], label, frontColor: '#0f4f9e' });
      bars.push({ value: redeemHeights[idx], label: '', frontColor: '#0ea5e9' });
    });
    return bars;
  }, []);


  // Calculate and format date range for display
  const dateRangeText = useMemo(() => {
    let dateRange;
    if (range === 'Day') {
      dateRange = getDailyDateRange();
    } else if (range === 'Week') {
      dateRange = getWeekDateRange();
    } else {
      dateRange = getMonthDateRange();
    }
    return formatDateRange(dateRange.startDate, dateRange.endDate);
  }, [range]);

  useEffect(() => {
    async function resolveTeam() {
      setTeamError(null);
      setTeamLoading(true);
      try {
        if (ent === 'ALL') {
          setTeamId(null);
        } else {
          const id = await getTeamId(ent);
          setTeamId(id);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to resolve team';
        setTeamError(message);
        setTeamId(null);
      } finally {
        setTeamLoading(false);
      }
    }
    resolveTeam();
  }, [ent]);

  return (
    <>
      <ThemedView style={styles.container}>
        <AppHeader title="Dashboard" />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Range tabs and ENT selector */}
          <View style={styles.topTabsRow}>
            {(['Day', 'Week', 'Month'] as RangeOption[]).map((r) => {
              const isActive = range === r;
              return (
                <TouchableOpacity
                  key={r}
                  activeOpacity={0.85}
                  onPress={() => setRange(r)}
                  style={styles.topTabTouchable}>
                  {isActive ? (
                    <LinearGradient
                      colors={['#c084fc', '#6366f1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.topTabActive}>
                      <ThemedText style={[styles.topTabText, styles.topTabTextActive]}>
                        {r}
                      </ThemedText>
                    </LinearGradient>
                  ) : (
                    <View style={styles.topTab}>
                      <ThemedText style={styles.topTabText}>{r}</ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.entRow}>
            <View style={styles.dropdownWrapper}>
              <EntDropdown
                ents={entsLoading ? ['ALL'] : ents}
                selectedEnt={ent}
                onEntChange={setEnt}
              />
            </View>
          </View>
          
          {/* Status for ENT resolution */}
          {teamLoading && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color="#2563eb" />
              <ThemedText style={styles.rangeHelper}>Resolving team...</ThemedText>
            </View>
          )}
          {teamError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
              <ThemedText style={styles.cardError}>Team error: {teamError}</ThemedText>
            </View>
          )}

          {/* Weekly Recharge vs Redeem (1 week) */}
          {/* <View style={styles.weekBarCard}>
            <View style={styles.weekBarHeader}>
              <ThemedText style={styles.weekBarTitle}>Weekly Recharge vs Redeem</ThemedText>
              <ThemedText style={styles.weekBarSubtitle}>Last 7 days</ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weekBarScroll}
            >
              <View style={styles.weekBarChartWrap}>
                <BarChart
                  data={weeklyBarData}
                  barWidth={12}
                  spacing={10}
                  roundedTop
                  barBorderRadius={10}
                  frontColor="#0f4f9e"
                  yAxisThickness={0.5}
                  xAxisThickness={0.5}
                  xAxisLabelTextStyle={styles.weekBarAxisText}
                  yAxisTextStyle={styles.weekBarAxisText}
                  maxValue={12}
                  yAxisLabelWidth={20}
                  noOfSections={4}
                />
              </View>
            </ScrollView>
            <View style={styles.weekBarLegend}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#0f4f9e' }]} />
                <ThemedText style={styles.legendLabel}>Recharge</ThemedText>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#0ea5e9' }]} />
                <ThemedText style={styles.legendLabel}>Redeem</ThemedText>
              </View>
            </View>
          </View> */}

          {/* Monthly Balance (Redeem vs Recharge) */}
           {/* <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <ThemedText style={styles.balanceTitle}>Balance</ThemedText>
              <View style={styles.balanceLegend}>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                  <ThemedText style={styles.legendLabel}>Expenses</ThemedText>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                  <ThemedText style={styles.legendLabel}>Income</ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.pillChart}>
              {monthlyPillData.map((item) => {
                const maxHeight = 84;
                const rechargeHeight = Math.max((item.recharge / 80) * maxHeight, 14);
                const redeemHeight = Math.max((item.redeem / 80) * maxHeight, 14);
                return (
                  <View key={item.month} style={styles.pillColumn}>
                    <View style={[styles.pillBarWrapper, { height: maxHeight }]}>
                      <View style={[styles.pillBar, { height: rechargeHeight, backgroundColor: '#f59e0b' }]} />
                    </View>
                    <View style={[styles.pillBarWrapper, { height: maxHeight }]}>
                      <View style={[styles.pillBar, { height: redeemHeight, backgroundColor: '#ef4444' }]} />
                    </View>
                    <ThemedText style={styles.pillMonth}>{item.month}</ThemedText>
                  </View>
                );
              })}
            </View>
          </View> */}

          {/* Metrics Cards */}
          <View style={styles.metricsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="stats-chart-outline" size={20} color="#0f172a" />
              <ThemedText style={styles.sectionTitle}>Key Metrics</ThemedText>
            </View>

            {/* Recharge Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={['#f0f9ff', '#e0f2fe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#3b82f6' }]}>
                    <Ionicons name="arrow-down-circle" size={20} color="#ffffff" />
                  </View>
                  <ThemedText style={styles.cardLabel}>
                    {ent === 'ALL' ? 'RECHARGE' : `RECHARGE (${ent})`}
                  </ThemedText>
                </View>
                {currentTotals.recharge.loading ? (
                  <ActivityIndicator size="small" color="#2563eb" style={styles.loader} />
                ) : currentTotals.recharge.error ? (
                  <ThemedText style={styles.cardError}>Error</ThemedText>
                ) : (
                  <ThemedText style={styles.cardValue}>
                    {formatCurrency(currentTotals.recharge.total || 0)}
                  </ThemedText>
                )}
              </LinearGradient>
            </View>

            {/* Redeem Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={['#fef2f2', '#fee2e2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#ef4444' }]}>
                    <Ionicons name="arrow-up-circle" size={20} color="#ffffff" />
                  </View>
                  <ThemedText style={styles.cardLabel}>
                    {ent === 'ALL' ? 'REDEEM' : `REDEEM (${ent})`}
                  </ThemedText>
                </View>
                {currentTotals.redeem.loading ? (
                  <ActivityIndicator size="small" color="#ef4444" style={styles.loader} />
                ) : currentTotals.redeem.error ? (
                  <ThemedText style={styles.cardError}>Error</ThemedText>
                ) : (
                  <ThemedText style={[styles.cardValue, { color: '#dc2626' }]}>
                    {formatCurrency(currentTotals.redeem.total || 0)}
                  </ThemedText>
                )}
              </LinearGradient>
            </View>

            {/* Holding % Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={['#f0fdf4', '#dcfce7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#22c55e' }]}>
                    <Ionicons name="trending-up" size={20} color="#ffffff" />
                  </View>
                  <ThemedText style={styles.cardLabel}>
                    {ent === 'ALL' ? 'HOLDING %' : `HOLDING % (${ent})`}
                  </ThemedText>
                </View>
                {currentTotals.recharge.loading || currentTotals.redeem.loading ? (
                  <ActivityIndicator size="small" color="#22c55e" style={styles.loader} />
                ) : currentTotals.recharge.error || currentTotals.redeem.error ? (
                  <ThemedText style={styles.cardError}>Error</ThemedText>
                ) : (
                  <ThemedText style={[styles.cardValue, { color: '#16a34a' }]}>
                    {formatPercentage(
                      calculateHoldingPercentage(
                        currentTotals.recharge.total || 0,
                        currentTotals.redeem.total || 0
                      )
                    )}
                  </ThemedText>
                )}
              </LinearGradient>
            </View>

            {/* Bonus % Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={['#fefce8', '#fef9c3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#eab308' }]}>
                    <Ionicons name="gift" size={20} color="#ffffff" />
                  </View>
                  <ThemedText style={styles.cardLabel}>
                    {ent === 'ALL' ? 'BONUS %' : `BONUS % (${ent})`}
                  </ThemedText>
                </View>
                {currentTotals.bonus.loading || currentTotals.recharge.loading ? (
                  <ActivityIndicator size="small" color="#eab308" style={styles.loader} />
                ) : currentTotals.bonus.error || currentTotals.recharge.error ? (
                  <ThemedText style={styles.cardError}>Error</ThemedText>
                ) : (
                  <ThemedText style={[styles.cardValue, { color: '#ca8a04' }]}>
                    {formatPercentage(
                      calculateBonusPercentage(
                        currentTotals.bonus.total || 0,
                        currentTotals.recharge.total || 0
                      )
                    )}
                  </ThemedText>
                )}
              </LinearGradient>
            </View>

            {/* Unique Users Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={['#f5f3ff', '#ede9fe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#8b5cf6' }]}>
                    <Ionicons name="people" size={20} color="#ffffff" />
                  </View>
                  <ThemedText style={styles.cardLabel}>
                    {ent === 'ALL' ? 'UNIQUE USERS' : `UNIQUE USERS (${ent})`}
                  </ThemedText>
                </View>
                {currentTotals.uniqueUsers.loading ? (
                  <ActivityIndicator size="small" color="#8b5cf6" style={styles.loader} />
                ) : currentTotals.uniqueUsers.error ? (
                  <ThemedText style={styles.cardError}>Error</ThemedText>
                ) : (
                  <ThemedText style={[styles.cardValue, { color: '#7c3aed' }]}>
                    {formatNumber(currentTotals.uniqueUsers.count || 0)}
                  </ThemedText>
                )}
              </LinearGradient>
            </View>

            {/* Hourly Avg Card */}
            <View style={styles.card}>
              <LinearGradient
                colors={['#ecfeff', '#cffafe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#06b6d4' }]}>
                    <Ionicons name="time-outline" size={20} color="#ffffff" />
                  </View>
                  <ThemedText style={styles.cardLabel}>
                    {ent === 'ALL' ? 'HOURLY AVG' : `HOURLY AVG (${ent})`}
                  </ThemedText>
                </View>
                {currentTotals.hourlyAvgRecharge.loading ? (
                  <ActivityIndicator size="small" color="#06b6d4" style={styles.loader} />
                ) : currentTotals.hourlyAvgRecharge.error ? (
                  <ThemedText style={styles.cardError}>Error</ThemedText>
                ) : (
                  <ThemedText style={[styles.cardValue, { color: '#0891b2' }]}>
                    {formatCurrency(currentTotals.hourlyAvgRecharge.hourlyAvg || 0)}
                  </ThemedText>
                )}
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
      <AppFooter />
    </>
  );
}

function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '$0.00';
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calculateHoldingPercentage(recharge: number, redeem: number): number {
  if (!Number.isFinite(recharge) || recharge === 0) return 0;
  const holding = recharge - redeem;
  return (holding / recharge) * 100;
}

function calculateBonusPercentage(bonus: number, recharge: number): number {
  if (!Number.isFinite(recharge) || recharge === 0) return 0;
  return (bonus / recharge) * 100;
}

function formatPercentage(percentage: number): string {
  if (!Number.isFinite(percentage)) return '0.00%';
  return `${percentage.toFixed(2)}%`;
}

function formatNumber(count: number): string {
  if (!Number.isFinite(count)) return '0';
  return count.toLocaleString('en-US');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
    gap: 10,
  },
  topTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 10,
  },
  topTabTouchable: {
    flex: 1,
  },
  topTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTabActive: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#6366f1',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  topTabTextActive: {
    color: '#ffffff',
  },
  entRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  dropdownWrapper: {
    flex: 1,
  },
  filtersCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterCol: {
    flex: 1,
    gap: 6,
  },
  rangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f7f9fc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    minHeight: 44,
  },
  rangeButtonActive: {
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  rangeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    zIndex: 1,
  },
  rangeButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rangeHelper: {
    fontSize: 13,
    color: '#64748b',
  },
  dateRangeContainer: {
    marginTop: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 6,
  },
  dateRangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateRangeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dateRangeText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  metricsSection: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 14,
  },
  cardGradient: {
    padding: 18,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
    flexWrap: 'wrap',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563eb',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  loader: {
    marginTop: 8,
  },
  cardError: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
    marginTop: 8,
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  balanceLegend: {
    flexDirection: 'row',
    gap: 12,
  },
  pillChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
    gap: 8,
  },
  pillColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pillBarWrapper: {
    width: 18,
    borderRadius: 9,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
    paddingVertical: 2,
    marginBottom: 2,
  },
  pillBar: {
    width: 10,
    borderRadius: 999,
  },
  pillMonth: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    marginTop: -2,
  },
  weekBarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  weekBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  weekBarSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  weekBarAxisText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  weekBarScroll: {
    paddingHorizontal: 4,
  },
  weekBarChartWrap: {
    minWidth: 460,
    paddingRight: 8,
  },
  weekBarLegend: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  legendValue: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
});

