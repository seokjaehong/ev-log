import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChargeRecord, MonthlySummary, ThemeMode, Vehicle } from '../types';
import { supabase } from '../lib/supabase';
import {
  transformChargeRecordFromDB,
  transformChargeRecordToDB,
  transformVehicleFromDB,
  transformVehicleToDB,
} from './supabaseHelpers';

// AsyncStorage 키 (테마는 로컬 저장 유지)
const THEME_KEY = '@ev_log_theme';

// === 충전 기록 관련 함수 (Supabase 사용) ===

// 모든 충전 기록 가져오기
export const getChargeRecords = async (): Promise<ChargeRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('charge_records')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('[Storage] Error loading charge records:', error);
      throw error;
    }

    return data ? data.map(transformChargeRecordFromDB) : [];
  } catch (e) {
    console.error('[Storage] Error reading charge records:', e);
    throw e;
  }
};

// 충전 기록 저장하기
export const saveChargeRecord = async (record: ChargeRecord): Promise<void> => {
  try {

    // 현재 로그인한 사용자 ID 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const dbRecord = transformChargeRecordToDB(record);

    // ID가 UUID 형식인지 확인 (업데이트 vs 삽입)
    const isUpdate = record.id && record.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    if (isUpdate) {
      // 업데이트
      const { error } = await supabase
        .from('charge_records')
        .update(dbRecord)
        .eq('id', record.id);

      if (error) {
        console.error('[Storage] Error updating charge record:', error);
        throw error;
      }
    } else {
      // 삽입 - user_id 추가!
      const { error } = await supabase
        .from('charge_records')
        .insert([{
          ...dbRecord,
          user_id: user.id,  // 중요: user_id 명시적으로 추가!
        }]);

      if (error) {
        console.error('[Storage] Error inserting charge record:', error);
        throw error;
      }
    }

  } catch (e) {
    console.error('[Storage] Error saving charge record:', e);
    throw e;
  }
};

// 충전 기록 삭제하기
export const deleteChargeRecord = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('charge_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Storage] Error deleting charge record:', error);
      throw error;
    }

  } catch (e) {
    console.error('[Storage] Error deleting charge record:', e);
    throw e;
  }
};

// === 차량 정보 관련 함수 (Supabase 사용) ===

// 차량 정보 가져오기
export const getVehicle = async (): Promise<Vehicle | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('[Storage] Error loading vehicle:', error);
      throw error;
    }

    return data ? transformVehicleFromDB(data) : null;
  } catch (e: any) {
    if (e.code === 'PGRST116') {
      return null;
    }
    console.error('[Storage] Error reading vehicle:', e);
    throw e;
  }
};

// 차량 정보 저장하기
export const saveVehicle = async (vehicle: Vehicle): Promise<void> => {
  try {

    // 현재 로그인한 사용자 ID 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const dbVehicle = transformVehicleToDB(vehicle);

    // 기존 차량이 있는지 확인
    const existing = await getVehicle();

    if (existing) {
      // 업데이트
      const { error } = await supabase
        .from('vehicles')
        .update(dbVehicle)
        .eq('id', existing.id);

      if (error) {
        console.error('[Storage] Error updating vehicle:', error);
        throw error;
      }
    } else {
      // 삽입 - user_id 추가!
      const { error } = await supabase
        .from('vehicles')
        .insert([{
          ...dbVehicle,
          user_id: user.id,  // 중요: user_id 명시적으로 추가!
        }]);

      if (error) {
        console.error('[Storage] Error inserting vehicle:', error);
        throw error;
      }
    }

  } catch (e) {
    console.error('[Storage] Error saving vehicle:', e);
    throw e;
  }
};

// 차량 정보 삭제하기
export const deleteVehicle = async (): Promise<void> => {
  try {

    const existing = await getVehicle();
    if (!existing) {
      return;
    }

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', existing.id);

    if (error) {
      console.error('[Storage] Error deleting vehicle:', error);
      throw error;
    }

  } catch (e) {
    console.error('[Storage] Error deleting vehicle:', e);
    throw e;
  }
};

// === 테마 관련 함수 (AsyncStorage 유지 - 로컬 설정) ===

// 테마 가져오기
export const getTheme = async (): Promise<ThemeMode> => {
  try {
    const theme = await AsyncStorage.getItem(THEME_KEY);
    return (theme as ThemeMode) || 'dark';
  } catch (e) {
    console.error('Error reading theme:', e);
    return 'dark';
  }
};

// 테마 저장하기
export const saveTheme = async (theme: ThemeMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Error saving theme:', e);
    throw e;
  }
};

// === 유틸리티 함수 ===

// 월별 통계 계산 (클라이언트 측 계산)
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

// UUID 생성 (클라이언트 측 임시 ID - Supabase가 자동 생성)
export const generateId = (): string => {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
