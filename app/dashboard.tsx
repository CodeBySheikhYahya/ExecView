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
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Helper function to get daily date range (7am-7am window)
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
          
          {/* Filters Section */}
          <View style={styles.filtersCard}>
            <View style={styles.filtersHeader}>
              <Ionicons name="options-outline" size={20} color="#64748b" />
              <ThemedText style={styles.sectionTitle}>Filters</ThemedText>
            </View>
            
            <View style={styles.filterRow}>
              <View style={styles.filterCol}>
                <ThemedText style={styles.label}>Time Range</ThemedText>
                <View style={styles.rangeButtons}>
                  {(['Day', 'Week', 'Month'] as const).map((r) => (
                    <TouchableOpacity
                      key={r}
                      activeOpacity={0.7}
                      onPress={() => setRange(r)}
                      style={[styles.rangeButton, range === r && styles.rangeButtonActive]}>
                      {range === r && (
                        <LinearGradient
                          colors={['#2563eb', '#1d4ed8']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[StyleSheet.absoluteFill, { borderRadius: 10 }]}
                        />
                      )}
                      <ThemedText
                        style={[
                          styles.rangeButtonText,
                          range === r && styles.rangeButtonTextActive,
                        ]}>
                        {r}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.filterRow}>
              <View style={styles.filterCol}>
                <ThemedText style={styles.label}>ENT</ThemedText>
                <EntDropdown
                  ents={entsLoading ? ['ALL'] : ents}
                  selectedEnt={ent}
                  onEntChange={setEnt}
                />
              </View>
            </View>
            
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
            
            {/* Date Range Section - Commented out */}
            {/* <View style={styles.dateRangeContainer}>
              <View style={styles.dateRangeHeader}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <ThemedText style={styles.dateRangeLabel}>Date Range ({range})</ThemedText>
              </View>
              <ThemedText style={styles.dateRangeText}>{dateRangeText}</ThemedText>
            </View> */}
          </View>

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
    gap: 24,
  },
  filtersCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterCol: {
    flex: 1,
    gap: 8,
  },
  rangeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  rangeButtonActive: {
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    zIndex: 1,
  },
  rangeButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: 0.2,
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
    gap: 16,
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  cardGradient: {
    padding: 18,
    minHeight: 120,
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
});

