import { ChargeRecord, Vehicle } from '../types';

// DB에서 가져온 충전 기록을 앱 타입으로 변환
export const transformChargeRecordFromDB = (dbRecord: any): ChargeRecord => {
  return {
    id: dbRecord.id,
    date: dbRecord.date,
    location: dbRecord.location,
    chargerType: dbRecord.charger_type,
    chargeAmount: parseFloat(dbRecord.charge_amount),
    unitPrice: parseFloat(dbRecord.unit_price),
    totalCost: parseFloat(dbRecord.total_cost),
    batteryPercent: dbRecord.battery_percent,
  };
};

// 앱 데이터를 DB 형식으로 변환 (충전 기록)
export const transformChargeRecordToDB = (record: Partial<ChargeRecord>) => {
  return {
    date: record.date,
    location: record.location,
    charger_type: record.chargerType,
    charge_amount: record.chargeAmount,
    unit_price: record.unitPrice,
    total_cost: record.totalCost,
    battery_percent: record.batteryPercent,
  };
};

// DB에서 가져온 차량 정보를 앱 타입으로 변환
export const transformVehicleFromDB = (dbVehicle: any): Vehicle => {
  return {
    id: dbVehicle.id,
    manufacturer: dbVehicle.manufacturer,
    nickname: dbVehicle.nickname,
    modelName: dbVehicle.model_name,
    batteryCapacity: parseFloat(dbVehicle.battery_capacity),
    licensePlate: dbVehicle.license_plate || '',
    createdAt: dbVehicle.created_at,
  };
};

// 앱 데이터를 DB 형식으로 변환 (차량 정보)
export const transformVehicleToDB = (vehicle: Partial<Vehicle>) => {
  return {
    manufacturer: vehicle.manufacturer,
    nickname: vehicle.nickname,
    model_name: vehicle.modelName,
    battery_capacity: vehicle.batteryCapacity,
    license_plate: vehicle.licensePlate,
  };
};
