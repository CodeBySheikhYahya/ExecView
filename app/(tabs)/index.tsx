import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEnts } from '@/hooks/useEnts';
import { BarChart } from 'react-native-gifted-charts';

type RangeOption = 'Day' | 'Week' | 'Month';

const rangeOptions: RangeOption[] = ['Day', 'Week', 'Month'];

const metricCards = [
  { label: 'Total In', value: '1M' },
  { label: 'Bonus', value: '119k' },
  { label: 'Total Out', value: '689k' },
  { label: 'Bonus %', value: '11.81%' },
  { label: 'Avg In', value: '34,876' },
  { label: 'Holding %', value: '31.82%' },
];

export default function HomeScreen() {
  const [range, setRange] = useState<RangeOption>('Day');
  const [team, setTeam] = useState<string>('ALL');
  const { ents, loading: entsLoading } = useEnts();

  useEffect(() => {
    if (!entsLoading && ents.length > 0) {
      setTeam((prev) => (ents.includes(prev) ? prev : ents[0]));
    }
  }, [ents, entsLoading]);

  // Sample series for the chart; replace with API data when ready.
  const chartSeries = useMemo(
    () => [
      { label: 'Mon', inValue: 62000, outValue: 52000, totalCredits: 68000 },
      { label: 'Tue', inValue: 64000, outValue: 53000, totalCredits: 69000 },
      { label: 'Wed', inValue: 65500, outValue: 54000, totalCredits: 70000 },
      { label: 'Thu', inValue: 67000, outValue: 55000, totalCredits: 71000 },
      { label: 'Fri', inValue: 68500, outValue: 56500, totalCredits: 72000 },
      { label: 'Sat', inValue: 70000, outValue: 57500, totalCredits: 73000 },
      { label: 'Sun', inValue: 71500, outValue: 58500, totalCredits: 74000 },
    ],
    [range, team],
  );

  const barData = chartSeries.map((item) => ({
    label: item.label,
    value: item.inValue,
    frontColor: '#63d471',
    spacing: 12,
    labelTextStyle: styles.barLabel,
    sideBarValue: item.outValue,
  }));

  const secondaryBarData = chartSeries.map((item) => ({
    value: item.outValue,
    frontColor: '#f78fb3',
  }));

  const lineData = chartSeries.map((item) => ({
    value: item.totalCredits,
    dataPointText: '',
  }));

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="Dashboard" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topFilters}>
          <Dropdown
            label="Date"
            value={range}
            options={rangeOptions}
            onChange={(val) => setRange(val as RangeOption)}
          />
          <Dropdown
            label="Team"
            value={team}
            options={ents}
            onChange={(val) => setTeam(val)}
            loading={entsLoading}
          />
        </View>

        <View style={styles.cardsGrid}>
          {metricCards.map((card) => (
            <View key={card.label} style={styles.card}>
              <ThemedText style={styles.cardValue}>{card.value}</ThemedText>
              <ThemedText style={styles.cardLabel}>{card.label}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <ThemedText style={styles.chartTitle}>Daily In/Out with TCL</ThemedText>
            <View style={styles.legendRow}>
              <LegendDot color="#63d471" label="In" />
              <LegendDot color="#f78fb3" label="Out" />
              <LegendDot color="#f4b63f" label="Total_Credits_Loaded" />
            </View>
          </View>
          <BarChart
            barWidth={20}
            noOfSections={5}
            maxValue={80000}
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules
            barBorderRadius={8}
            data={barData}
            sideData={secondaryBarData}
            sideBySideBars
            spacing={18}
            initialSpacing={12}
            yAxisTextStyle={styles.yAxisText}
            lineConfig={{
              isAnimated: true,
              color: '#f4b63f',
              thickness: 3,
              curved: true,
              hideDataPoints: false,
              dataPointsHeight: 10,
              dataPointsWidth: 10,
            }}
            lineData={lineData}
            backgroundColor="#ffffff"
          />
        </View>
      </ScrollView>
      <AppFooter />
    </ThemedView>
  );
}

type DropdownProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  loading?: boolean;
};

function Dropdown({ label, value, options, onChange, loading }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdown}
        activeOpacity={0.85}
        onPress={() => {
          if (loading) return;
          setOpen(true);
        }}>
        <ThemedText style={styles.dropdownText}>{loading ? 'Loading...' : value}</ThemedText>
        <Ionicons name="chevron-down" size={18} color="#6b7280" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>{label}</ThemedText>
                </View>
                <ScrollView>
                  {options.map((opt) => {
                    const active = opt === value;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.modalItem, active && styles.modalItemActive]}
                        onPress={() => {
                          onChange(opt);
                          setOpen(false);
                        }}>
                        <ThemedText
                          style={[styles.modalItemText, active && styles.modalItemTextActive]}>
                          {opt}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                  {options.length === 0 && (
                    <View style={[styles.modalItem, { alignItems: 'center' }]}>
                      <ThemedText style={styles.modalItemText}>No teams</ThemedText>
                    </View>
                  )}
                </ScrollView>
                <TouchableOpacity style={styles.modalClose} onPress={() => setOpen(false)}>
                  <ThemedText style={styles.modalCloseText}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <ThemedText style={styles.legendText}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  topFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dropdownText: {
    fontWeight: '700',
    color: '#0b1a3a',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  card: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0b1a3a',
  },
  cardLabel: {
    marginTop: 6,
    color: '#6b7280',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0b1a3a',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  yAxisText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  barLabel: {
    color: '#6b7280',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    maxHeight: '55%',
  },
  modalHeader: {
    paddingBottom: 8,
  },
  modalTitle: {
    fontWeight: '800',
    color: '#0b1a3a',
    fontSize: 16,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalItemActive: {
    backgroundColor: '#f8fafc',
  },
  modalItemText: {
    fontWeight: '600',
    color: '#374151',
  },
  modalItemTextActive: {
    color: '#2563eb',
  },
  modalClose: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseText: {
    fontWeight: '700',
    color: '#6b7280',
  },
});
