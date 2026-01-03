import { ChargeRecord, LocationStats, FavoriteLocation } from '../types';

/**
 * 충전소별 통계 계산
 * 모든 충전 기록에서 장소별로 데이터를 집계합니다.
 */
export function calculateLocationStats(records: ChargeRecord[]): LocationStats[] {
  if (records.length === 0) {
    return [];
  }

  // 장소별로 기록 그룹화
  const grouped = records.reduce((acc, record) => {
    const key = record.location.trim();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(record);
    return acc;
  }, {} as { [key: string]: ChargeRecord[] });

  // 각 장소의 통계 계산
  const stats: LocationStats[] = Object.entries(grouped).map(([location, locationRecords]) => {
    const visitCount = locationRecords.length;
    const totalCost = locationRecords.reduce((sum, r) => sum + r.totalCost, 0);
    const totalCharge = locationRecords.reduce((sum, r) => sum + r.chargeAmount, 0);
    const averageUnitPrice = Math.round(
      locationRecords.reduce((sum, r) => sum + r.unitPrice, 0) / visitCount
    );

    // 최근 방문 날짜 (날짜순 정렬 후 첫 번째)
    const sortedByDate = [...locationRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastVisit = sortedByDate[0].date;

    return {
      location,
      visitCount,
      averageUnitPrice,
      lastVisit,
      isFavorite: visitCount >= 3, // 3회 이상 방문 시 즐겨찾기
      totalCost,
      totalCharge,
    };
  });

  // 방문 횟수순으로 정렬 (내림차순)
  return stats.sort((a, b) => b.visitCount - a.visitCount);
}

/**
 * 즐겨찾기 충전소 목록 가져오기 (3회 이상 방문)
 */
export function getFavoriteLocations(records: ChargeRecord[]): FavoriteLocation[] {
  const stats = calculateLocationStats(records);
  const now = new Date();

  return stats
    .filter((stat) => stat.isFavorite)
    .map((stat) => {
      const lastVisitDate = new Date(stat.lastVisit);
      const daysDiff = Math.floor(
        (now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        location: stat.location,
        visitCount: stat.visitCount,
        averageUnitPrice: stat.averageUnitPrice,
        lastVisit: stat.lastVisit,
        daysSinceLastVisit: daysDiff,
      };
    });
}

/**
 * 최근 방문 충전소 목록 (1-2회 방문)
 */
export function getRecentLocations(records: ChargeRecord[]): FavoriteLocation[] {
  const stats = calculateLocationStats(records);
  const now = new Date();

  return stats
    .filter((stat) => stat.visitCount >= 1 && stat.visitCount < 3)
    .map((stat) => {
      const lastVisitDate = new Date(stat.lastVisit);
      const daysDiff = Math.floor(
        (now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        location: stat.location,
        visitCount: stat.visitCount,
        averageUnitPrice: stat.averageUnitPrice,
        lastVisit: stat.lastVisit,
        daysSinceLastVisit: daysDiff,
      };
    })
    .slice(0, 5); // 최대 5개만 표시
}

/**
 * 가장 경제적인 충전소 찾기 (평균 단가 기준)
 */
export function getCheapestLocation(records: ChargeRecord[]): LocationStats | null {
  const stats = calculateLocationStats(records);

  if (stats.length === 0) {
    return null;
  }

  // 최소 3회 이상 방문한 충전소 중에서 찾기
  const eligibleStats = stats.filter((stat) => stat.visitCount >= 3);

  if (eligibleStats.length === 0) {
    return null;
  }

  return eligibleStats.reduce((cheapest, current) =>
    current.averageUnitPrice < cheapest.averageUnitPrice ? current : cheapest
  );
}

/**
 * 검색어로 충전소 필터링
 */
export function searchLocations(
  locations: FavoriteLocation[],
  query: string
): FavoriteLocation[] {
  if (!query.trim()) {
    return locations;
  }

  const lowerQuery = query.toLowerCase().trim();
  return locations.filter((loc) =>
    loc.location.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 상대 시간 포맷팅 (예: "2일 전", "1주 전")
 */
export function formatRelativeTime(days: number): string {
  if (days === 0) {
    return '오늘';
  } else if (days === 1) {
    return '어제';
  } else if (days < 7) {
    return `${days}일 전`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks}주 전`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months}개월 전`;
  } else {
    const years = Math.floor(days / 365);
    return `${years}년 전`;
  }
}
