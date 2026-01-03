/**
 * 차트 데이터 처리 함수 테스트
 */

// 테스트용 충전 기록 데이터
const testRecords = [
  {
    id: '1',
    date: '2025-12-15T10:30:00.000Z',
    location: '서울 강남 충전소',
    chargerType: '급속',
    chargeAmount: 45.5,
    unitPrice: 300,
    totalCost: 13650,
    batteryPercent: 80,
  },
  {
    id: '2',
    date: '2025-12-20T14:20:00.000Z',
    location: '서울 강남 충전소',
    chargerType: '완속',
    chargeAmount: 35.0,
    unitPrice: 200,
    totalCost: 7000,
    batteryPercent: 70,
  },
  {
    id: '3',
    date: '2025-12-25T09:15:00.000Z',
    location: '인천 송도 충전소',
    chargerType: '슈퍼차저',
    chargeAmount: 60.0,
    unitPrice: 400,
    totalCost: 24000,
    batteryPercent: 95,
  },
  {
    id: '4',
    date: '2026-01-05T16:45:00.000Z',
    location: '서울 강남 충전소',
    chargerType: '급속',
    chargeAmount: 40.0,
    unitPrice: 300,
    totalCost: 12000,
    batteryPercent: 75,
  },
  {
    id: '5',
    date: '2026-01-10T11:30:00.000Z',
    location: '부산 해운대 충전소',
    chargerType: '완속',
    chargeAmount: 38.5,
    unitPrice: 200,
    totalCost: 7700,
    batteryPercent: 72,
  },
];

// chartDataProcessor 함수들 import (CommonJS 방식)
const {
  calculateMonthlyTrend,
  calculateChargerTypeDistribution,
  calculateWeekdayPattern,
  calculateDetailedStats,
} = require('./src/utils/chartDataProcessor.ts');

console.log('🧪 차트 데이터 처리 테스트 시작\n');

// 1. 월별 추세 테스트
console.log('1️⃣ 월별 추세 데이터 (최근 6개월):');
try {
  const monthlyTrend = calculateMonthlyTrend(testRecords, 6);
  console.log(JSON.stringify(monthlyTrend, null, 2));
  console.log('✅ 월별 추세 계산 성공\n');
} catch (error) {
  console.error('❌ 월별 추세 계산 실패:', error.message);
}

// 2. 충전기 타입별 분포 테스트
console.log('2️⃣ 충전기 타입별 분포:');
try {
  const chargerTypeDistribution = calculateChargerTypeDistribution(testRecords);
  console.log(JSON.stringify(chargerTypeDistribution, null, 2));
  console.log('✅ 충전기 타입 분포 계산 성공\n');
} catch (error) {
  console.error('❌ 충전기 타입 분포 계산 실패:', error.message);
}

// 3. 요일별 패턴 테스트
console.log('3️⃣ 요일별 충전 패턴:');
try {
  const weekdayPattern = calculateWeekdayPattern(testRecords);
  console.log(JSON.stringify(weekdayPattern, null, 2));
  console.log('✅ 요일별 패턴 계산 성공\n');
} catch (error) {
  console.error('❌ 요일별 패턴 계산 실패:', error.message);
}

// 4. 상세 통계 테스트
console.log('4️⃣ 상세 통계:');
try {
  const detailedStats = calculateDetailedStats(testRecords);
  console.log(JSON.stringify(detailedStats, null, 2));
  console.log('✅ 상세 통계 계산 성공\n');
} catch (error) {
  console.error('❌ 상세 통계 계산 실패:', error.message);
}

// 5. 빈 데이터 테스트
console.log('5️⃣ 빈 데이터 처리 테스트:');
try {
  const emptyStats = calculateDetailedStats([]);
  console.log('빈 데이터 통계:', JSON.stringify(emptyStats, null, 2));
  console.log('✅ 빈 데이터 처리 성공\n');
} catch (error) {
  console.error('❌ 빈 데이터 처리 실패:', error.message);
}

console.log('🎉 모든 테스트 완료!');
