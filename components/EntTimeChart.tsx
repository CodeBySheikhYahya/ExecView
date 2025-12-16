import { ThemedText } from '@/components/themed-text';
import { DailyBucket } from '@/hooks/useDailyRechargeRedeemBuckets';
import { MonthSeriesPoint } from '@/hooks/useMonthRechargeRedeemSeries';
import { WeekSeriesPoint } from '@/hooks/useWeekRechargeRedeemSeries';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';

type RangeOption = 'Day' | 'Week' | 'Month';

interface EntTimeChartProps {
  ents: string[];
  selectedEnt: string;
  range: RangeOption;
  buckets?: DailyBucket[]; // hourly (Day)
  weekPoints?: WeekSeriesPoint[]; // daily (Week)
  monthPoints?: MonthSeriesPoint[]; // 4-week series (Month)
}

export default function EntTimeChart({
  ents,
  selectedEnt,
  range,
  buckets,
  weekPoints,
  monthPoints,
}: EntTimeChartProps) {
  const allEnts = useMemo(() => {
    const base = [...ents];
    if (!base.includes('ALL')) {
      base.unshift('ALL');
    }
    return base;
  }, [ents]);

  const { barData, maxValue } = useMemo(() => {
    const bars: { value: number; label: string; frontColor: string }[] = [];
    let max = 0;

    if (range === 'Week' && weekPoints && weekPoints.length > 0) {
      // Real week data: two bars per day (Recharge / Redeem)
      weekPoints.forEach((point) => {
        const d = new Date(point.bucketDate);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });

        max = Math.max(max, point.rechargeTotal, point.redeemTotal);

        // Recharge (blue)
        bars.push({
          value: point.rechargeTotal,
          label,
          frontColor: '#2563eb',
        });
        // Redeem (red)
        bars.push({
          value: point.redeemTotal,
          label: '',
          frontColor: '#dc2626',
        });
      });
    } else if (range === 'Month' && monthPoints && monthPoints.length > 0) {
      // Real month (4-week) data: two bars per week
      monthPoints.forEach((point, index) => {
        const label = `Week-${index + 1}`;

        // use the max of both recharge and redeem so bars/line share same scale
        max = Math.max(max, point.rechargeTotal, point.redeemTotal);

        // Recharge (blue)
        bars.push({
          value: point.rechargeTotal,
          label,
          frontColor: '#2563eb',
        });
        // Redeem (red)
        bars.push({
          value: point.redeemTotal,
          label: '',
          frontColor: '#dc2626',
        });
      });
    }

    return {
      barData: bars,
      maxValue: max || 1,
    };
  }, [range, weekPoints, monthPoints]);

  const { lineDataRecharge, lineDataRedeem, lineMax } = useMemo(() => {
    const recharge: { value: number; label: string }[] = [];
    const redeem: { value: number; label: string }[] = [];
    let max = 0;

    if (range === 'Day' && buckets && buckets.length > 0) {
      const now = new Date();
      const pastBuckets = buckets.filter((bucket) => {
        const end = new Date(bucket.bucketEnd);
        return end <= now;
      });

      pastBuckets.forEach((bucket, index) => {
        const start = new Date(bucket.bucketStart);
        const label = start.toLocaleTimeString('en-US', {
          hour: 'numeric',
          hour12: true,
        });
        max = Math.max(max, bucket.rechargeTotal, bucket.redeemTotal);
        recharge.push({ value: bucket.rechargeTotal, label });
        redeem.push({ value: bucket.redeemTotal, label: index % 2 === 0 ? label : '' });
      });
    } else if (range === 'Week' && weekPoints && weekPoints.length > 0) {
      weekPoints.forEach((point, index) => {
        const d = new Date(point.bucketDate);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        max = Math.max(max, point.rechargeTotal, point.redeemTotal);
        recharge.push({ value: point.rechargeTotal, label });
        redeem.push({ value: point.redeemTotal, label: index % 2 === 0 ? label : '' });
      });
    } else if (range === 'Month' && monthPoints && monthPoints.length > 0) {
      monthPoints.forEach((point, index) => {
        const label = `Week-${index + 1}`;
        max = Math.max(max, point.rechargeTotal, point.redeemTotal);
        recharge.push({ value: point.rechargeTotal, label });
        redeem.push({ value: point.redeemTotal, label: index % 2 === 0 ? label : '' });
      });
    }

    if (recharge.length === 0 || redeem.length === 0) {
      return { lineDataRecharge: [], lineDataRedeem: [], lineMax: 0 };
    }

    return { lineDataRecharge: recharge, lineDataRedeem: redeem, lineMax: max || 1 };
  }, [buckets, weekPoints, monthPoints, range]);

  const [showRecharge, setShowRecharge] = useState(true);
  const [showRedeem, setShowRedeem] = useState(true);

  const combinedMax = useMemo(() => {
    const candidates = [lineMax, maxValue].filter((n) => Number.isFinite(n) && n > 0) as number[];
    return candidates.length ? Math.max(...candidates) : 1;
  }, [lineMax, maxValue]);

  const lineDataForChart = useMemo(() => {
    if (lineDataRecharge.length === 0) {
      return { main: [], second: [] };
    }

    const baseLabels = lineDataRecharge.map((d) => d.label);
    const emptySeries = baseLabels.map((label) => ({ value: 0, label }));

    const main = showRecharge ? lineDataRecharge : emptySeries;
    const second = showRedeem ? lineDataRedeem : emptySeries;

    return { main, second };
  }, [lineDataRecharge, lineDataRedeem, showRecharge, showRedeem]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Recharge vs Redeem</ThemedText>
        <ThemedText style={styles.subtitle}>
          {range === 'Day' && '7am to now (hourly)'}
          {range === 'Week' && 'Last 7 days (daily bars)'}
          {range === 'Month' && 'Last 30 days (4 buckets)'}
        </ThemedText>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, showRecharge && styles.toggleButtonActive]}
          activeOpacity={0.8}
          onPress={() => setShowRecharge((prev) => !prev)}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#2563eb',
              marginRight: 4,
            }}
          />
          <ThemedText style={styles.toggleText}>Recharge</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, showRedeem && styles.toggleButtonActive]}
          activeOpacity={0.8}
          onPress={() => setShowRedeem((prev) => !prev)}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#dc2626',
              marginRight: 4,
            }}
          />
          <ThemedText style={styles.toggleText}>Redeem</ThemedText>
        </TouchableOpacity>
      </View>

      {range === 'Day' ? (
        lineDataRecharge.length > 0 && lineDataRedeem.length > 0 && (
          <View style={styles.chartWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chartWrapperInner}>
                <LineChart
                  data={lineDataForChart.main}
                  data2={lineDataForChart.second}
                  areaChart
                  curved
                  thickness={2}
                  color="#2563eb"
                  color2="#dc2626"
                  startFillColor="#dbeafe"
                  endFillColor="#eff6ff"
                  startOpacity={0.7}
                  endOpacity={0.05}
                  noOfSections={4}
                  maxValue={combinedMax}
                  yAxisThickness={0.5}
                  xAxisThickness={0.5}
                  xAxisLabelTextStyle={styles.axisLabel}
                  yAxisTextStyle={styles.axisLabel}
                  yAxisLabelWidth={28}
                  hideDataPoints={false}
                  hideDataPoints2={false}
                  dataPointsColor="#2563eb"
                  dataPointsColor2="#dc2626"
                  initialSpacing={0}
                  endSpacing={0}
                />
              </View>
            </ScrollView>
          </View>
        )
      ) : (
        <View style={[styles.chartWrapperNoScroll, range === 'Month' && { paddingLeft: 10 }]}>
          <BarChart
            data={barData.map((b) => {
              const isRecharge = b.frontColor === '#2563eb';
              const isRedeem = b.frontColor === '#dc2626';
              if (!showRecharge && isRecharge) return { ...b, value: 0 };
              if (!showRedeem && isRedeem) return { ...b, value: 0 };
              return b;
            })}
            barWidth={18}
            spacing={range === 'Month' ? 16 : 2}
            initialSpacing={0}
            endSpacing={0}
            roundedTop
            barBorderRadius={10}
            maxValue={maxValue}
            noOfSections={4}
            yAxisThickness={0.5}
            xAxisThickness={0.5}
            xAxisLabelTextStyle={styles.axisLabel}
            yAxisTextStyle={styles.axisLabel}
            yAxisLabelWidth={26}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  entLabelInline: {
    marginTop: 2,
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  chartWrapper: {
    width: '100%',
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 4,
  },
  chartWrapperNoScroll: {
    width: '100%',
    paddingLeft: 2,
    paddingRight: 0,
    paddingTop: 8,
    paddingBottom: 4,
    overflow: 'hidden',
  },
  chartWrapperInner: {
    width: 360,
    paddingHorizontal: 4,
  },
  axisLabel: {
    fontSize: 10,
    color: '#94a3b8',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  toggleButtonActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 4,
  },
});


