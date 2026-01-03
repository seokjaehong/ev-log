import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MonthlyTrendData, ThemeColors } from '../../types';

interface SimpleLineChartProps {
  data: MonthlyTrendData[];
  colors: ThemeColors;
  yAxisLabelTexts: string[];
  yAxisMax: number;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  colors,
  yAxisLabelTexts,
  yAxisMax,
}) => {
  if (data.length === 0) return null;

  const chartWidth = 300;
  const chartHeight = 200;
  const padding = { left: 50, right: 20, top: 20, bottom: 30 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // 데이터 포인트 계산
  const points = data.map((item, index) => {
    const x = padding.left + (plotWidth / (data.length - 1)) * index;
    const y = padding.top + plotHeight - (item.totalCost / yAxisMax) * plotHeight;
    return { x, y, value: item.totalCost, label: item.monthLabel };
  });

  // SVG 경로 생성
  const linePath = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    })
    .join(' ');

  // Area fill 경로
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${padding.top + plotHeight}` +
    ` L ${points[0].x} ${padding.top + plotHeight} Z`;

  return (
    <View style={styles.container}>
      <svg width={chartWidth} height={chartHeight}>
        {/* Y축 그리드 라인 */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding.top + (plotHeight / 4) * i;
          return (
            <line
              key={`grid-${i}`}
              x1={padding.left}
              y1={y}
              x2={chartWidth - padding.right}
              y2={y}
              stroke={colors.border}
              strokeWidth="0.5"
              opacity="0.5"
            />
          );
        })}

        {/* Y축 라벨 */}
        {yAxisLabelTexts.map((label, i) => {
          const y = padding.top + (plotHeight / 4) * (4 - i);
          return (
            <text
              key={`ylabel-${i}`}
              x={padding.left - 10}
              y={y + 4}
              fill={colors.textSecondary}
              fontSize="11"
              textAnchor="end"
            >
              {label}
            </text>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={colors.primary} opacity="0.2" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={colors.primary}
          strokeWidth="3"
        />

        {/* 데이터 포인트 */}
        {points.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="5"
            fill={colors.primary}
          />
        ))}

        {/* X축 라벨 */}
        {points.map((point, index) => (
          <text
            key={`xlabel-${index}`}
            x={point.x}
            y={padding.top + plotHeight + 20}
            fill={colors.textSecondary}
            fontSize="11"
            textAnchor="middle"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
