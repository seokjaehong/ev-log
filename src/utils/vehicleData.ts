/**
 * 전기차 제조사 및 모델 데이터
 */

export interface VehicleModel {
  name: string;
  batteryCapacity: number; // kWh
}

export interface Manufacturer {
  id: string;
  name: string;
  models: VehicleModel[];
}

export const manufacturers: Manufacturer[] = [
  {
    id: 'hyundai',
    name: '현대',
    models: [
      { name: '아이오닉5', batteryCapacity: 77.4 },
      { name: '아이오닉5 (스탠다드)', batteryCapacity: 58 },
      { name: '아이오닉6', batteryCapacity: 77.4 },
      { name: '아이오닉6 (스탠다드)', batteryCapacity: 53 },
      { name: '코나 일렉트릭', batteryCapacity: 64 },
      { name: '코나 일렉트릭 (스탠다드)', batteryCapacity: 39.2 },
      { name: '캐스퍼 일렉트릭', batteryCapacity: 49 },
    ],
  },
  {
    id: 'kia',
    name: '기아',
    models: [
      { name: 'EV6', batteryCapacity: 77.4 },
      { name: 'EV6 (스탠다드)', batteryCapacity: 58 },
      { name: 'EV9', batteryCapacity: 99.8 },
      { name: 'EV9 (스탠다드)', batteryCapacity: 76.1 },
      { name: '니로 EV', batteryCapacity: 64.8 },
      { name: '니로 EV (스탠다드)', batteryCapacity: 39.2 },
      { name: 'EV3', batteryCapacity: 81.4 },
    ],
  },
  {
    id: 'tesla',
    name: '테슬라',
    models: [
      { name: 'Model 3 롱레인지', batteryCapacity: 82 },
      { name: 'Model 3 퍼포먼스', batteryCapacity: 82 },
      { name: 'Model Y 롱레인지', batteryCapacity: 82 },
      { name: 'Model Y 퍼포먼스', batteryCapacity: 82 },
      { name: 'Model S', batteryCapacity: 100 },
      { name: 'Model X', batteryCapacity: 100 },
    ],
  },
  {
    id: 'bmw',
    name: 'BMW',
    models: [
      { name: 'i4 eDrive40', batteryCapacity: 83.9 },
      { name: 'i4 M50', batteryCapacity: 83.9 },
      { name: 'iX xDrive40', batteryCapacity: 76.6 },
      { name: 'iX xDrive50', batteryCapacity: 111.5 },
      { name: 'i5 eDrive40', batteryCapacity: 84.3 },
      { name: 'i7 xDrive60', batteryCapacity: 101.7 },
    ],
  },
  {
    id: 'mercedes',
    name: '메르세데스-벤츠',
    models: [
      { name: 'EQE 350', batteryCapacity: 90.6 },
      { name: 'EQE SUV', batteryCapacity: 90.6 },
      { name: 'EQS 450', batteryCapacity: 107.8 },
      { name: 'EQS SUV', batteryCapacity: 107.8 },
      { name: 'EQA 250', batteryCapacity: 66.5 },
      { name: 'EQB 300', batteryCapacity: 66.5 },
    ],
  },
  {
    id: 'genesis',
    name: '제네시스',
    models: [
      { name: 'GV60 스탠다드', batteryCapacity: 77.4 },
      { name: 'GV60 퍼포먼스', batteryCapacity: 77.4 },
      { name: 'G80 전동화', batteryCapacity: 87.2 },
      { name: 'GV70 전동화', batteryCapacity: 77.4 },
      { name: 'Electrified GV70', batteryCapacity: 77.4 },
    ],
  },
  {
    id: 'volvo',
    name: '볼보',
    models: [
      { name: 'C40 리차지', batteryCapacity: 78 },
      { name: 'XC40 리차지', batteryCapacity: 78 },
      { name: 'EX30', batteryCapacity: 69 },
      { name: 'EX90', batteryCapacity: 111 },
    ],
  },
  {
    id: 'polestar',
    name: '폴스타',
    models: [
      { name: 'Polestar 2 싱글 모터', batteryCapacity: 69 },
      { name: 'Polestar 2 듀얼 모터', batteryCapacity: 78 },
      { name: 'Polestar 3', batteryCapacity: 111 },
      { name: 'Polestar 4', batteryCapacity: 94 },
    ],
  },
  {
    id: 'other',
    name: '기타',
    models: [
      { name: '직접 입력', batteryCapacity: 0 },
    ],
  },
];

/**
 * 제조사 ID로 제조사 찾기
 */
export const getManufacturerById = (id: string): Manufacturer | undefined => {
  return manufacturers.find((m) => m.id === id);
};

/**
 * 제조사명으로 제조사 찾기
 */
export const getManufacturerByName = (name: string): Manufacturer | undefined => {
  return manufacturers.find((m) => m.name === name);
};

/**
 * 모델명으로 배터리 용량 찾기
 */
export const getBatteryCapacity = (
  manufacturerId: string,
  modelName: string
): number | undefined => {
  const manufacturer = getManufacturerById(manufacturerId);
  if (!manufacturer) return undefined;

  const model = manufacturer.models.find((m) => m.name === modelName);
  return model?.batteryCapacity;
};
