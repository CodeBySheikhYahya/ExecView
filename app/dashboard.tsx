import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import EntDropdown from '@/components/EntDropdown';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDailyRechargeTotal } from '@/hooks/useDailyRechargeTotal';
import { useDailyRedeemTotal } from '@/hooks/useDailyRedeemTotal';
import { useEnts } from '@/hooks/useEnts';
import { useMonthRechargeTotal } from '@/hooks/useMonthRechargeTotal';
import { useMonthRedeemTotal } from '@/hooks/useMonthRedeemTotal';
import { useWeekRechargeTotal } from '@/hooks/useWeekRechargeTotal';
import { useWeekRedeemTotal } from '@/hooks/useWeekRedeemTotal';
import { getTeamId } from '@/utils/team-helper';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

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
  const weekRechargeTotal = useWeekRechargeTotal({ teamId });
  const weekRedeemTotal = useWeekRedeemTotal({ teamId });
  const monthRechargeTotal = useMonthRechargeTotal({ teamId });
  const monthRedeemTotal = useMonthRedeemTotal({ teamId });

  const currentTotals =
    range === 'Day'
      ? { recharge: dailyRechargeTotal, redeem: dailyRedeemTotal }
      : range === 'Week'
      ? { recharge: weekRechargeTotal, redeem: weekRedeemTotal }
      : { recharge: monthRechargeTotal, redeem: monthRedeemTotal };

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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.filtersCard}>
            <ThemedText style={styles.sectionTitle}>Filters</ThemedText>
            <View style={styles.filterRow}>
              <View style={styles.filterCol}>
                <ThemedText style={styles.label}>Range</ThemedText>
                <View style={styles.rangeButtons}>
                  {(['Day', 'Week', 'Month'] as const).map((r) => (
                    <View
                      key={r}
                      style={[styles.rangeButton, range === r && styles.rangeButtonActive]}>
                      <ThemedText
                        style={[
                          styles.rangeButtonText,
                          range === r && styles.rangeButtonTextActive,
                        ]}
                        onPress={() => setRange(r)}>
                        {r}
                      </ThemedText>
                    </View>
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
              <ThemedText style={styles.rangeHelper}>Resolving team...</ThemedText>
            )}
            {teamError && (
              <ThemedText style={styles.cardError}>Team error: {teamError}</ThemedText>
            )}
            <View style={styles.dateRangeContainer}>
              <ThemedText style={styles.dateRangeLabel}>Date Range ({range}):</ThemedText>
              <ThemedText style={styles.dateRangeText}>{dateRangeText}</ThemedText>
            </View>
          </View>

          <View style={styles.cardsRow}>
            <View style={styles.card}>
              <ThemedText style={styles.cardLabel}>
                {ent === 'ALL' ? 'RECHARGE (ALL ENT)' : `RECHARGE (${ent})`}
              </ThemedText>
              {currentTotals.recharge.loading ? (
                <ActivityIndicator size="small" />
              ) : currentTotals.recharge.error ? (
                <ThemedText style={styles.cardError}>Error</ThemedText>
              ) : (
                <ThemedText style={styles.cardValue}>
                  {formatCurrency(currentTotals.recharge.total || 0)}
                </ThemedText>
              )}
            </View>

            <View style={styles.card}>
              <ThemedText style={styles.cardLabel}>
                {ent === 'ALL' ? 'REDEEM (ALL ENT)' : `REDEEM (${ent})`}
              </ThemedText>
              {currentTotals.redeem.loading ? (
                <ActivityIndicator size="small" />
              ) : currentTotals.redeem.error ? (
                <ThemedText style={styles.cardError}>Error</ThemedText>
              ) : (
                <ThemedText style={styles.cardValue}>
                  {formatCurrency(currentTotals.redeem.total || 0)}
                </ThemedText>
              )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  filtersCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
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
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  rangeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  rangeButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  filterColButton: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#0f172a',
  },
  applyButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  rangeHelper: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  dateRangeContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 4,
  },
  dateRangeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  dateRangeText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: 'monospace',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563eb',
  },
  cardError: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
});

