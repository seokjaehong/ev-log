import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MonthlySummary as MonthlySummaryType, ThemeColors } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface MonthlySummaryProps {
  summary: MonthlySummaryType;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ summary }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>이번 달 요약</Text>

      <View style={styles.mainCostContainer}>
        <Text style={styles.label}>총 충전비</Text>
        <Text style={styles.mainCost}>
          {summary.totalCost.toLocaleString('ko-KR')}원
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>총 충전량</Text>
          <Text style={styles.statValue}>
            {summary.totalCharge.toFixed(1)} kWh
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>충전 횟수</Text>
          <Text style={styles.statValue}>{summary.chargeCount} 회</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
  mainCostContainer: {
    marginBottom: 20,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  mainCost: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
