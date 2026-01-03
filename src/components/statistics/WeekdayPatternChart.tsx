import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WeekdayPatternData, ThemeColors } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { ChartErrorBoundary } from './ErrorBoundary';

// 플랫폼별 조건부 import
const BarChart = Platform.OS === 'web'
  ? require('react-gifted-charts').BarChart
  : require('react-native-gifted-charts').BarChart;

interface WeekdayPatternChartProps {
  data: WeekdayPatternData[];
}

export const WeekdayPatternChart: React.FC<WeekdayPatternChartProps> = ({ data }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // 주중/주말 색상 구분
  const getBarColor = (weekday: number): string => {
    // 0(일요일) 또는 6(토요일)이면 주말
    if (weekday === 0 || weekday === 6) {
      return '#FF9800'; // 주황색 (주말)
    }
    return colors.primary; // 청록색 (주중)
  };

  // 데이터 변환 (차트 라이브러리 형식)
  const chartData = data.map((item) => ({
    value: item.averageCount,
    label: item.weekdayLabel,
    frontColor: getBarColor(item.weekday),
    topLabelComponent: () => (
      <Text style={{ color: colors.textSecondary, fontSize: 10 }}>
        {item.averageCount.toFixed(1)}
      </Text>
    ),
  }));

  // 최댓값 계산
  const maxValue = Math.max(...data.map((d) => d.averageCount), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>요일별 충전 패턴</Text>
      <Text style={styles.subtitle}>주별 평균 충전 횟수</Text>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>충전 기록이 없습니다</Text>
        </View>
      ) : (
        <ChartErrorBoundary colors={colors}>
          {/* 바 차트 */}
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              width={Platform.OS === 'web' ? 280 : 260}
              height={180}
              maxValue={maxValue * 1.2}
              noOfSections={4}
              barWidth={Platform.OS === 'web' ? 32 : 28}
              spacing={Platform.OS === 'web' ? 24 : 20}
              initialSpacing={20}
              endSpacing={20}
              roundedTop
              roundedBottom
              xAxisColor={colors.border}
              yAxisColor={colors.border}
              yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 11 }}
              showGradient={false}
              hideRules={false}
              rulesColor={colors.border}
              rulesThickness={0.5}
              showYAxisIndices={false}
              showXAxisIndices={false}
              disablePress={true}
              isAnimated={Platform.OS !== 'web'}
            />
          </View>

          {/* 범례 */}
          <View style={styles.legendContainer}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>주중 (월-금)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.legendText}>주말 (토-일)</Text>
              </View>
            </View>
          </View>
        </ChartErrorBoundary>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    },
    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 20,
    },
    chartContainer: {
      alignItems: 'center',
      marginVertical: 10,
    },
    emptyContainer: {
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    legendContainer: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    legendRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 24,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 6,
    },
    legendText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
  });
