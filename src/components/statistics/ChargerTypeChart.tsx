import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ChargerTypeDistribution, ThemeColors } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { ChartErrorBoundary } from './ErrorBoundary';

// 플랫폼별 조건부 import
const PieChart = Platform.OS === 'web'
  ? require('react-gifted-charts').PieChart
  : require('react-native-gifted-charts').PieChart;

interface ChargerTypeChartProps {
  data: ChargerTypeDistribution[];
}

export const ChargerTypeChart: React.FC<ChargerTypeChartProps> = ({ data }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // 데이터 변환 (차트 라이브러리 형식)
  const chartData = data.map((item) => ({
    value: item.count,
    color: item.color,
    text: `${item.percentage.toFixed(0)}%`,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>충전기 타입별 분포</Text>
      <Text style={styles.subtitle}>사용 현황</Text>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>충전 기록이 없습니다</Text>
        </View>
      ) : (
        <ChartErrorBoundary colors={colors}>
          {/* 파이 차트 */}
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              radius={Platform.OS === 'web' ? 80 : 70}
              innerRadius={Platform.OS === 'web' ? 40 : 35}
              donut
              showText
              textColor={colors.text}
              textSize={14}
              fontWeight="600"
              innerCircleColor={colors.surface}
              innerCircleBorderWidth={0}
              focusOnPress={false}
              sectionAutoFocus={false}
            />
          </View>

          {/* 범례 */}
          <View style={styles.legendContainer}>
            {data.map((item, index) => (
              <View key={index} style={styles.legendRow}>
                <View style={styles.legendLeft}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendType}>{item.type}</Text>
                </View>
                <View style={styles.legendRight}>
                  <Text style={styles.legendCount}>{item.count}회</Text>
                  <Text style={styles.legendPercentage}>
                    ({item.percentage.toFixed(1)}%)
                  </Text>
                </View>
              </View>
            ))}
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
      justifyContent: 'center',
      marginVertical: 20,
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
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    legendLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    legendType: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    legendRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendCount: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginRight: 4,
    },
    legendPercentage: {
      color: colors.textSecondary,
      fontSize: 12,
    },
  });
