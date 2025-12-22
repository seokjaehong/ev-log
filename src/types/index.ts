// 충전기 타입
export type ChargerType = '완속' | '급속' | '슈퍼차저';

// 충전 기록 인터페이스
export interface ChargeRecord {
  id: string;
  date: string; // ISO 8601 format
  location: string;
  chargerType: ChargerType;
  chargeAmount: number; // kWh
  unitPrice: number; // 원/kWh
  totalCost: number; // 원
  batteryPercent?: number; // 충전 후 배터리 %
}

// 월별 통계 인터페이스
export interface MonthlySummary {
  totalCost: number;
  totalCharge: number; // kWh
  chargeCount: number;
}

// 테마 타입
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;      // 메인 배경
  surface: string;         // 카드/섹션 배경
  card: string;            // 리스트 아이템 배경
  text: string;            // 주요 텍스트
  textSecondary: string;   // 보조 텍스트
  textTertiary: string;    // 힌트 텍스트
  primary: string;         // 액센트 색상
  accent: string;          // 강조 색상
  border: string;          // 테두리
  error: string;           // 에러 색상
  statusBarStyle: 'light-content' | 'dark-content';
}

// 차량 정보 인터페이스
export interface Vehicle {
  id: string;
  manufacturer: string;    // "현대", "기아", "테슬라" 등
  nickname: string;        // "나의 아이오닉5"
  modelName: string;       // "아이오닉5"
  batteryCapacity: number; // 77.4 (kWh)
  licensePlate: string;    // "12가3456"
  createdAt: string;       // ISO 8601 format
}

// OCR 관련 타입
export interface OCRResult {
  fullText: string;       // 전체 인식된 텍스트
  confidence?: number;    // 인식 신뢰도 (0-1)
}

export interface ParsedReceipt {
  date?: Date;            // 파싱된 날짜
  location?: string;      // 충전소 위치
  chargeAmount?: number;  // 충전량 (kWh)
  unitPrice?: number;     // 단가 (원/kWh)
  totalCost?: number;     // 총 금액 (원)
  chargerType?: ChargerType;  // 충전기 타입
  confidence: number;     // 전체 파싱 신뢰도
  rawText: string;        // 원본 텍스트
}

// 네비게이션 파라미터 타입
export type RootStackParamList = {
  Home: undefined;
  AddCharge: { editRecord?: ChargeRecord };
  Settings: undefined;
  VehicleSettings: undefined;
};
