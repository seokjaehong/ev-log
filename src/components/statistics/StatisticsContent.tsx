import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ChargeRecord, ThemeColors } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import {
  calculateMonthlyTrend,
  calculateChargerTypeDistribution,
  calculateWeekdayPattern,
  calculateDetailedStats,
} from '../../utils/chartDataProcessor';
import { DetailedStatsCard } from './DetailedStatsCard';
import { MonthlyTrendChart } from './MonthlyTrendChart';
import { ChargerTypeChart } from './ChargerTypeChart';
import { WeekdayPatternChart } from './WeekdayPatternChart';

interface StatisticsContentProps {
  records: ChargeRecord[];
}

export const StatisticsContent: React.FC<StatisticsContentProps> = ({ records }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // 데이터 계산 (useMemo로 성능 최적화)
  const monthlyTrend = useMemo(() => calculateMonthlyTrend(records, 6), [records]);
  const chargerTypeDistribution = useMemo(
    () => calculateChargerTypeDistribution(records),
    [records]
  );
  const weekdayPattern = useMemo(() => calculateWeekdayPattern(records), [records]);
  const detailedStats = useMemo(() => calculateDetailedStats(records), [records]);

  // 빈 데이터 처리
  if (records.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>통계를 표시할 데이터가 없습니다</Text>
        <Text style={styles.emptyDescription}>
          충전 기록을 추가하면{'\n'}다양한 통계와 차트를 확인할 수 있습니다
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 상세 통계 카드 */}
      <DetailedStatsCard stats={detailedStats} />

      {/* 월별 추세 차트 */}
      <MonthlyTrendChart data={monthlyTrend} />

      {/* 충전기 타입 분포 */}
      <ChargerTypeChart data={chargerTypeDistribution} />

      {/* 요일별 패턴 */}
      <WeekdayPatternChart data={weekdayPattern} />

      {/* 하단 여백 */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      backgroundColor: colors.background,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    bottomSpacer: {
      height: 20,
    },
  });
