import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MonthlyTrendData, ThemeColors } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { ChartErrorBoundary } from './ErrorBoundary';
import { SimpleLineChart } from './SimpleLineChart';

// 플랫폼별 조건부 import (모바일용만)
const LineChart = Platform.OS !== 'web'
  ? require('react-native-gifted-charts').LineChart
  : null;

interface MonthlyTrendChartProps {
  data: MonthlyTrendData[];
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // 금액 포맷팅 함수
  const formatAmount = (value: number): string => {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}만`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}천`;
    }
    return `${value}`;
  };

  // 데이터 변환 (차트 라이브러리 형식)
  const chartData = data.map((item) => ({
    value: item.totalCost,
    label: item.monthLabel,
  }));

  // 최댓값 계산 (y축 범위)
  const maxValue = Math.max(...data.map((d) => d.totalCost), 1);
  const yAxisMax = Math.ceil(maxValue * 1.15); // 15% 여유

  // Y축 라벨 생성 (4개 섹션)
  const yAxisLabelTexts = [];
  for (let i = 0; i <= 4; i++) {
    const value = (yAxisMax / 4) * i;
    yAxisLabelTexts.push(formatAmount(value));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>월별 충전비 추세</Text>
      <Text style={styles.subtitle}>최근 6개월</Text>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>충전 기록이 없습니다</Text>
        </View>
      ) : (
        <ChartErrorBoundary colors={colors}>
          <View style={styles.chartContainer}>
            {Platform.OS === 'web' ? (
              // 웹: 커스텀 SVG 차트 사용
              <>
                <SimpleLineChart
                  data={data}
                  colors={colors}
                  yAxisLabelTexts={yAxisLabelTexts}
                  yAxisMax={yAxisMax}
                />
                <Text style={styles.yAxisLabel}>금액 (원)</Text>
              </>
            ) : (
              // 모바일: react-native-gifted-charts 사용
              <>
                <LineChart
                  data={chartData}
                  width={280}
                  height={220}
                  maxValue={yAxisMax}
                  noOfSections={4}
                  yAxisLabelTexts={yAxisLabelTexts}
                  yAxisLabelWidth={40}
                  color={colors.primary}
                  thickness={3}
                  startFillColor={colors.primary}
                  endFillColor={colors.background}
                  startOpacity={0.3}
                  endOpacity={0.1}
                  areaChart
                  curved
                  hideDataPoints={false}
                  dataPointsColor={colors.primary}
                  dataPointsRadius={5}
                  textColor={colors.textSecondary}
                  textFontSize={10}
                  xAxisColor={colors.border}
                  yAxisColor={colors.border}
                  yAxisTextStyle={{ color: colors.textSecondary, fontSize: 11 }}
                  xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 11 }}
                  showVerticalLines
                  verticalLinesColor={colors.border}
                  verticalLinesThickness={0.5}
                  rulesColor={colors.border}
                  rulesThickness={0.5}
                  spacing={38}
                  initialSpacing={10}
                  endSpacing={10}
                  animateOnDataChange
                  animationDuration={800}
                />
                <Text style={styles.yAxisLabel}>금액 (원)</Text>
              </>
            )}
          </View>
        </ChartErrorBoundary>
      )}

      {/* 범례 */}
      {data.length > 0 && (
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>월별 총 충전비</Text>
          </View>
        </View>
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
      position: 'relative',
    },
    yAxisLabel: {
      position: 'absolute',
      top: -8,
      left: 0,
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '500',
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
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    legendText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
  });
