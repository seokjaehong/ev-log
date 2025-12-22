import { ParsedReceipt, ChargerType } from '../types';

/**
 * OCR로 추출한 텍스트에서 충전 영수증 정보를 파싱
 */
export const parseReceipt = (text: string): ParsedReceipt => {
  const result: ParsedReceipt = {
    confidence: 0,
    rawText: text,
  };

  let foundCount = 0;
  const maxFields = 5; // 날짜, 장소, 충전량, 금액, 충전기타입

  // 1. 날짜 파싱
  const date = parseDate(text);
  if (date) {
    result.date = date;
    foundCount++;
  }

  // 2. 충전소 위치 파싱
  const location = parseLocation(text);
  if (location) {
    result.location = location;
    foundCount++;
  }

  // 3. 충전량 파싱 (kWh)
  const chargeAmount = parseChargeAmount(text);
  if (chargeAmount) {
    result.chargeAmount = chargeAmount;
    foundCount++;
  }

  // 4. 금액 파싱
  const totalCost = parseTotalCost(text);
  if (totalCost) {
    result.totalCost = totalCost;
    foundCount++;

    // 충전량과 금액이 모두 있으면 단가 계산
    if (chargeAmount && chargeAmount > 0) {
      result.unitPrice = Math.round(totalCost / chargeAmount);
    }
  }

  // 5. 충전기 타입 파싱
  const chargerType = parseChargerType(text);
  if (chargerType) {
    result.chargerType = chargerType;
    foundCount++;
  }

  // 신뢰도 계산 (찾은 필드 수 / 전체 필드 수)
  result.confidence = foundCount / maxFields;

  return result;
};

/**
 * 날짜 파싱
 * 지원 형식:
 * - 2023-10-25, 2023.10.25, 2023/10/25
 * - 2023년 10월 25일
 * - 10월 25일
 */
const parseDate = (text: string): Date | undefined => {
  // 패턴 1: 2023-10-25, 2023.10.25, 2023/10/25
  const pattern1 = /(\d{4})[-./년]\s*(\d{1,2})[-./월]\s*(\d{1,2})[일]?/;
  const match1 = text.match(pattern1);
  if (match1) {
    const year = parseInt(match1[1], 10);
    const month = parseInt(match1[2], 10);
    const day = parseInt(match1[3], 10);
    return new Date(year, month - 1, day);
  }

  // 패턴 2: 10월 25일 (현재 년도로 가정)
  const pattern2 = /(\d{1,2})월\s*(\d{1,2})일/;
  const match2 = text.match(pattern2);
  if (match2) {
    const currentYear = new Date().getFullYear();
    const month = parseInt(match2[1], 10);
    const day = parseInt(match2[2], 10);
    return new Date(currentYear, month - 1, day);
  }

  return undefined;
};

/**
 * 충전소 위치 파싱
 * 키워드: 슈퍼차저, 충전소, 충전기, 스테이션
 */
const parseLocation = (text: string): string | undefined => {
  const keywords = ['슈퍼차저', '충전소', '충전기', '스테이션', 'Supercharger', 'Station'];

  for (const keyword of keywords) {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes(keyword)) {
        // 키워드를 포함한 라인을 위치로 사용
        return line.trim();
      }
    }
  }

  // 키워드가 없으면 첫 번째 줄을 위치로 간주
  const firstLine = text.split('\n')[0]?.trim();
  if (firstLine && firstLine.length > 2 && firstLine.length < 50) {
    return firstLine;
  }

  return undefined;
};

/**
 * 충전량 파싱 (kWh)
 * 패턴: 40kWh, 40 kWh, 40.5kWh
 */
const parseChargeAmount = (text: string): number | undefined => {
  const pattern = /(\d+(?:\.\d+)?)\s*kWh/gi;
  const match = text.match(pattern);

  if (match && match.length > 0) {
    // 가장 큰 값을 충전량으로 선택 (여러 개가 있을 경우)
    const amounts = match.map((m) => {
      const num = parseFloat(m.replace(/kWh/gi, '').trim());
      return num;
    });
    return Math.max(...amounts);
  }

  return undefined;
};

/**
 * 총 금액 파싱 (원)
 * 패턴: 18,500원, 18500원, 18,500, ₩18,500
 */
const parseTotalCost = (text: string): number | undefined => {
  // 금액 관련 키워드 찾기
  const amountKeywords = ['금액', '합계', '총액', '총', '결제', '지불', '원', '₩'];

  // 패턴: 18,500원 또는 18500원 또는 ₩18,500
  const pattern = /[₩]?\s*(\d{1,3}(?:,\d{3})*)\s*원?/g;
  const matches = text.matchAll(pattern);

  const amounts: number[] = [];
  for (const match of matches) {
    const amountStr = match[1].replace(/,/g, '');
    const amount = parseInt(amountStr, 10);

    // 금액이 100원 이상 1,000,000원 이하인 경우만 (충전 요금 범위)
    if (amount >= 100 && amount <= 1000000) {
      amounts.push(amount);
    }
  }

  // 가장 큰 금액을 총액으로 선택
  if (amounts.length > 0) {
    return Math.max(...amounts);
  }

  return undefined;
};

/**
 * 충전기 타입 파싱
 */
const parseChargerType = (text: string): ChargerType | undefined => {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes('슈퍼차저') ||
    lowerText.includes('supercharger') ||
    lowerText.includes('super charger')
  ) {
    return '슈퍼차저';
  }

  if (
    lowerText.includes('급속') ||
    lowerText.includes('dc') ||
    lowerText.includes('fast')
  ) {
    return '급속';
  }

  if (
    lowerText.includes('완속') ||
    lowerText.includes('slow') ||
    lowerText.includes('ac')
  ) {
    return '완속';
  }

  return undefined;
};

/**
 * 파싱 결과의 신뢰도가 충분한지 확인
 */
export const isParsingReliable = (result: ParsedReceipt): boolean => {
  return result.confidence >= 0.4; // 최소 2개 이상의 필드가 파싱되어야 함
};

/**
 * 파싱 결과를 사용자가 읽기 쉬운 형식으로 포맷
 */
export const formatParsedResult = (result: ParsedReceipt): string => {
  const lines: string[] = [];

  if (result.date) {
    lines.push(`📅 날짜: ${result.date.toLocaleDateString('ko-KR')}`);
  }

  if (result.location) {
    lines.push(`📍 장소: ${result.location}`);
  }

  if (result.chargerType) {
    lines.push(`⚡ 충전기: ${result.chargerType}`);
  }

  if (result.chargeAmount) {
    lines.push(`🔋 충전량: ${result.chargeAmount.toFixed(1)} kWh`);
  }

  if (result.totalCost) {
    lines.push(`💰 금액: ${result.totalCost.toLocaleString('ko-KR')}원`);
  }

  if (result.unitPrice) {
    lines.push(`📊 단가: ${result.unitPrice}원/kWh`);
  }

  lines.push('');
  lines.push(`신뢰도: ${(result.confidence * 100).toFixed(0)}%`);

  return lines.join('\n');
};
