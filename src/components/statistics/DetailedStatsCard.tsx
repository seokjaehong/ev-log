import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DetailedStats, ThemeColors } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface DetailedStatsCardProps {
  stats: DetailedStats;
}

export const DetailedStatsCard: React.FC<DetailedStatsCardProps> = ({ stats }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>상세 통계</Text>

      {/* 총 지출액 (메인) */}
      <View style={styles.mainStatContainer}>
        <Text style={styles.label}>총 지출액</Text>
        <Text style={styles.mainValue}>
          {stats.totalSpent.toLocaleString('ko-KR')}원
        </Text>
      </View>

      {/* 충전 횟수 & 총 충전량 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>총 충전 횟수</Text>
          <Text style={styles.statValue}>{stats.totalChargeCount} 회</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>총 충전량</Text>
          <Text style={styles.statValue}>
            {stats.totalChargeAmount.toFixed(1)} kWh
          </Text>
        </View>
      </View>

      {/* 평균 충전 비용 & 월평균 비용 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>평균 충전비</Text>
          <Text style={styles.statValue}>
            {stats.averageChargeCost.toLocaleString('ko-KR', {
              maximumFractionDigits: 0,
            })}
            원
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>월평균 비용</Text>
          <Text style={styles.statValue}>
            {stats.monthlyAverageCost.toLocaleString('ko-KR', {
              maximumFractionDigits: 0,
            })}
            원
          </Text>
        </View>
      </View>

      {/* 가장 많이 이용한 충전소 */}
      <View style={styles.locationContainer}>
        <Text style={styles.statLabel}>가장 많이 이용한 충전소</Text>
        <Text style={styles.locationValue}>{stats.mostUsedLocation}</Text>
      </View>
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
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 16,
    },
    mainStatContainer: {
      marginBottom: 20,
    },
    label: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 4,
    },
    mainValue: {
      color: colors.text,
      fontSize: 32,
      fontWeight: 'bold',
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    statItem: {
      flex: 1,
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 4,
    },
    statValue: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
    },
    divider: {
      width: 1,
      height: 30,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    locationContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 16,
    },
    locationValue: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
      marginTop: 4,
    },
  });
