import {
  ChargeRecord,
  MonthlyTrendData,
  ChargerTypeDistribution,
  WeekdayPatternData,
  DetailedStats,
} from '../types';

/**
 * 월별 추세 데이터 계산 (최근 N개월)
 */
export const calculateMonthlyTrend = (
  records: ChargeRecord[],
  monthCount: number = 6
): MonthlyTrendData[] => {
  if (records.length === 0) {
    return [];
  }

  // 현재 날짜 기준으로 N개월 전까지의 월 목록 생성
  const now = new Date();
  const months: MonthlyTrendData[] = [];

  for (let i = monthCount - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

    months.push({
      month: monthKey,
      monthLabel: `${month}월`,
      totalCost: 0,
      totalCharge: 0,
      chargeCount: 0,
    });
  }

  // 각 기록을 해당 월에 집계
  records.forEach((record) => {
    const recordDate = new Date(record.date);
    const year = recordDate.getFullYear();
    const month = recordDate.getMonth() + 1;
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

    const monthData = months.find((m) => m.month === monthKey);
    if (monthData) {
      monthData.totalCost += record.totalCost;
      monthData.totalCharge += record.chargeAmount;
      monthData.chargeCount += 1;
    }
  });

  return months;
};

/**
 * 충전기 타입별 분포 계산
 */
export const calculateChargerTypeDistribution = (
  records: ChargeRecord[]
): ChargerTypeDistribution[] => {
  if (records.length === 0) {
    return [];
  }

  // 타입별 집계
  const counts: { [key: string]: number } = {
    완속: 0,
    급속: 0,
    슈퍼차저: 0,
  };

  records.forEach((record) => {
    counts[record.chargerType] += 1;
  });

  const total = records.length;

  // 색상 매핑
  const colorMap: { [key: string]: string } = {
    완속: '#4CAF50',    // 녹색
    급속: '#FFC107',    // 노란색
    슈퍼차저: '#FF5722', // 빨간색
  };

  // 결과 배열 생성
  const distribution: ChargerTypeDistribution[] = Object.keys(counts)
    .filter((type) => counts[type] > 0)
    .map((type) => ({
      type: type as '완속' | '급속' | '슈퍼차저',
      count: counts[type],
      percentage: (counts[type] / total) * 100,
      color: colorMap[type],
    }))
    .sort((a, b) => b.count - a.count); // 많은 순으로 정렬

  return distribution;
};

/**
 * 요일별 충전 패턴 계산
 */
export const calculateWeekdayPattern = (
  records: ChargeRecord[]
): WeekdayPatternData[] => {
  if (records.length === 0) {
    return [];
  }

  // 요일별 집계 (0=일요일, 6=토요일)
  const weekdayCounts: number[] = [0, 0, 0, 0, 0, 0, 0];

  // 각 기록의 날짜와 요일 출력
  const weekdayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  console.log('  충전 기록 상세:');
  records.forEach((record) => {
    const date = new Date(record.date);
    const weekday = date.getDay();
    console.log(`    - ${record.date} (${weekdayNames[weekday]})`);
    weekdayCounts[weekday] += 1;
  });

  // 주 단위 수 계산 (데이터 범위 / 7일)
  const dates = records.map((r) => new Date(r.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);
  const weekCount = Math.max(daysDiff / 7, 1); // 최소 1주로 설정

  // 디버깅 정보 출력
  console.log('[요일별 패턴] 디버깅 정보:');
  console.log('  총 기록 수:', records.length);
  console.log('  첫 기록 날짜:', new Date(minDate).toLocaleDateString());
  console.log('  마지막 기록 날짜:', new Date(maxDate).toLocaleDateString());
  console.log('  기간 (일):', daysDiff.toFixed(1));
  console.log('  주 수:', weekCount.toFixed(2));
  console.log('  요일별 집계 (일~토):', weekdayCounts);

  // 요일 라벨
  const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'];

  // 결과 배열 생성 (월요일부터 시작하도록 재배열)
  const result: WeekdayPatternData[] = [];

  for (let i = 1; i <= 7; i++) {
    const weekday = i % 7; // 1(월) -> 1, 2(화) -> 2, ..., 7(일) -> 0
    result.push({
      weekday,
      weekdayLabel: weekdayLabels[weekday],
      totalCount: weekdayCounts[weekday],
      averageCount: weekdayCounts[weekday] / weekCount,
    });
  }

  console.log('  계산 결과 (월~일):', result.map(r =>
    `${r.weekdayLabel}: ${r.totalCount}회 (평균 ${r.averageCount.toFixed(1)})`
  ));

  return result;
};

/**
 * 상세 통계 계산
 */
export const calculateDetailedStats = (
  records: ChargeRecord[]
): DetailedStats => {
  if (records.length === 0) {
    return {
      totalChargeCount: 0,
      averageChargeCost: 0,
      mostUsedLocation: '-',
      monthlyAverageCost: 0,
      totalSpent: 0,
      totalChargeAmount: 0,
    };
  }

  // 총 비용, 총 충전량
  const totalSpent = records.reduce((sum, r) => sum + r.totalCost, 0);
  const totalChargeAmount = records.reduce((sum, r) => sum + r.chargeAmount, 0);

  // 평균 충전 비용
  const averageChargeCost = totalSpent / records.length;

  // 가장 많이 사용한 충전소
  const locationCounts: { [key: string]: number } = {};
  records.forEach((r) => {
    locationCounts[r.location] = (locationCounts[r.location] || 0) + 1;
  });

  const mostUsedLocation = Object.keys(locationCounts).reduce((a, b) =>
    locationCounts[a] > locationCounts[b] ? a : b
  );

  // 월평균 비용 계산 (데이터 범위 기준)
  const dates = records.map((r) => new Date(r.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);
  const monthCount = Math.max(daysDiff / 30, 1); // 최소 1개월로 설정
  const monthlyAverageCost = totalSpent / monthCount;

  return {
    totalChargeCount: records.length,
    averageChargeCost,
    mostUsedLocation,
    monthlyAverageCost,
    totalSpent,
    totalChargeAmount,
  };
};
