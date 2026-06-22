import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../hooks/use-theme';
import { Spacing, BottomTabInset } from '../constants/theme';
import { useWaterStore } from '../store/waterStore';
import { getTodayTotal, getLast7Days } from '../utils/calculateProgress';

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen() {
  const colors = useTheme();
  const { records, dailyGoal } = useWaterStore();

  const todayTotal = getTodayTotal(records);
  const last7Days = getLast7Days(records);

  const filledDays = last7Days.filter(d => d.total > 0).length;
  const average = filledDays > 0
    ? Math.round(last7Days.reduce((sum, d) => sum + d.total, 0) / filledDays)
    : 0;

  const chartLabels = last7Days.map(d => {
    const [, month, day] = d.date.split('-');
    return `${parseInt(month)}/${parseInt(day)}`;
  });

  const chartData = last7Days.map(d => d.total);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }]}>통계</Text>

        {/* 요약 카드 */}
        <View style={styles.cards}>
          <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>오늘 섭취량</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{todayTotal}<Text style={[styles.cardUnit, { color: colors.textSecondary }]}>ml</Text></Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>7일 평균</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{average}<Text style={[styles.cardUnit, { color: colors.textSecondary }]}>ml</Text></Text>
          </View>
        </View>

        {/* 바 차트 */}
        <View style={[styles.chartBox, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>최근 7일</Text>
          <BarChart
            data={{
              labels: chartLabels,
              datasets: [{ data: chartData.map(v => v === 0 ? 0.1 : v) }],
            }}
            width={screenWidth - Spacing.three * 2 - Spacing.three * 2}
            height={200}
            yAxisLabel=""
            yAxisSuffix="ml"
            fromZero
            showValuesOnTopOfBars={false}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: colors.backgroundElement,
              backgroundGradientTo: colors.backgroundElement,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: () => colors.textSecondary,
              propsForBackgroundLines: { stroke: colors.backgroundSelected },
            }}
            style={{ borderRadius: 8 }}
          />
          {/* 목표선 표시 텍스트 */}
          <Text style={[styles.goalNote, { color: colors.textSecondary }]}>목표: {dailyGoal}ml</Text>
        </View>

        {/* 7일 상세 */}
        <View style={styles.detailSection}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>날짜별 기록</Text>
          {[...last7Days].reverse().map(d => {
            const pct = dailyGoal > 0 ? Math.min(100, Math.round((d.total / dailyGoal) * 100)) : 0;
            return (
              <View key={d.date} style={[styles.dayRow, { backgroundColor: colors.backgroundElement }]}>
                <Text style={[styles.dayDate, { color: colors.textSecondary }]}>{d.date.slice(5)}</Text>
                <View style={[styles.dayBar, { backgroundColor: colors.backgroundSelected }]}>
                  <View style={[styles.dayBarFill, { width: `${pct}%`, backgroundColor: pct >= 100 ? '#34C759' : '#007AFF' }]} />
                </View>
                <Text style={[styles.dayAmount, { color: colors.text }]}>{d.total}ml</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: BottomTabInset }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.three },
  title: { fontSize: 28, fontWeight: '700', marginBottom: Spacing.four },
  cards: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  cardLabel: { fontSize: 12, fontWeight: '500' },
  cardValue: { fontSize: 28, fontWeight: '700' },
  cardUnit: { fontSize: 14, fontWeight: '400' },
  chartBox: {
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  chartTitle: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.two },
  goalNote: { fontSize: 12, textAlign: 'right', marginTop: Spacing.one },
  detailSection: { gap: Spacing.two },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  dayDate: { fontSize: 13, width: 44 },
  dayBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  dayBarFill: { height: '100%', borderRadius: 4 },
  dayAmount: { fontSize: 13, fontWeight: '600', width: 56, textAlign: 'right' },
});
