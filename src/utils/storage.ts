import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChargeRecord, MonthlySummary, ThemeMode, Vehicle } from '../types';

const STORAGE_KEY = '@ev_log_charges';
const THEME_KEY = '@ev_log_theme';
const VEHICLE_KEY = '@ev_log_vehicle';

// 모든 충전 기록 가져오기
export const getChargeRecords = async (): Promise<ChargeRecord[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading charge records:', e);
    return [];
  }
};

// 충전 기록 저장하기
export const saveChargeRecord = async (record: ChargeRecord): Promise<void> => {
  try {
    console.log('[Storage] 저장 시작...');
    const records = await getChargeRecords();
    console.log('[Storage] 기존 기록 개수:', records.length);

    const existingIndex = records.findIndex((r) => r.id === record.id);

    if (existingIndex >= 0) {
      console.log('[Storage] 기존 기록 업데이트 (index:', existingIndex, ')');
      records[existingIndex] = record;
    } else {
      console.log('[Storage] 새 기록 추가');
      records.push(record);
    }

    // 날짜 역순으로 정렬 (최신순)
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.log('[Storage] 정렬 완료, 총', records.length, '개');

    const jsonValue = JSON.stringify(records);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    console.log('[Storage] AsyncStorage에 저장 완료');
    console.log('[Storage] 저장된 데이터 크기:', jsonValue.length, 'bytes');
  } catch (e) {
    console.error('[Storage] Error saving charge record:', e);
    throw e;
  }
};

// 충전 기록 삭제하기
export const deleteChargeRecord = async (id: string): Promise<void> => {
  try {
    const records = await getChargeRecords();
    const filteredRecords = records.filter((r) => r.id !== id);
    const jsonValue = JSON.stringify(filteredRecords);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error deleting charge record:', e);
    throw e;
  }
};

// 월별 통계 계산
export const calculateMonthlySummary = (
  records: ChargeRecord[],
  year: number,
  month: number
): MonthlySummary => {
  const filteredRecords = records.filter((record) => {
    const recordDate = new Date(record.date);
    return (
      recordDate.getFullYear() === year &&
      recordDate.getMonth() === month - 1
    );
  });

  const totalCost = filteredRecords.reduce((sum, r) => sum + r.totalCost, 0);
  const totalCharge = filteredRecords.reduce((sum, r) => sum + r.chargeAmount, 0);
  const chargeCount = filteredRecords.length;

  return {
    totalCost,
    totalCharge,
    chargeCount,
  };
};

// UUID 생성 (간단한 버전)
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 테마 관련 함수
export const getTheme = async (): Promise<ThemeMode> => {
  try {
    const theme = await AsyncStorage.getItem(THEME_KEY);
    return (theme as ThemeMode) || 'dark';
  } catch (e) {
    console.error('Error reading theme:', e);
    return 'dark';
  }
};

export const saveTheme = async (theme: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Error saving theme:', e);
    throw e;
  }
};

// 차량 정보 관련 함수
export const getVehicle = async (): Promise<Vehicle | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(VEHICLE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error reading vehicle:', e);
    return null;
  }
};

export const saveVehicle = async (vehicle: Vehicle): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(vehicle);
    await AsyncStorage.setItem(VEHICLE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving vehicle:', e);
    throw e;
  }
};

export const deleteVehicle = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(VEHICLE_KEY);
  } catch (e) {
    console.error('Error deleting vehicle:', e);
    throw e;
  }
};
