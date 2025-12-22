import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Vehicle } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { getVehicle, saveVehicle, deleteVehicle, generateId } from '../utils/storage';
import { SelectModal } from '../components/SelectModal';
import {
  manufacturers,
  getManufacturerById,
  getBatteryCapacity,
  Manufacturer,
  VehicleModel,
} from '../utils/vehicleData';

type VehicleSettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VehicleSettings'
>;

interface VehicleSettingsScreenProps {
  navigation: VehicleSettingsScreenNavigationProp;
}

export const VehicleSettingsScreen: React.FC<VehicleSettingsScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const [existingVehicle, setExistingVehicle] = useState<Vehicle | null>(null);

  // 폼 state
  const [nickname, setNickname] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [modelName, setModelName] = useState('');
  const [batteryCapacity, setBatteryCapacity] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  // 모달 state
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);

  // 직접 입력 모드
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState('');

  useEffect(() => {
    loadVehicle();
  }, []);

  const loadVehicle = async () => {
    const vehicle = await getVehicle();
    if (vehicle) {
      setExistingVehicle(vehicle);
      setNickname(vehicle.nickname);
      setModelName(vehicle.modelName);
      setBatteryCapacity(vehicle.batteryCapacity.toString());
      setLicensePlate(vehicle.licensePlate);

      // 제조사 찾기
      const manufacturer = manufacturers.find((m) => m.name === vehicle.manufacturer);
      if (manufacturer) {
        setManufacturerId(manufacturer.id);
      }
    }
  };

  const handleManufacturerSelect = (id: string) => {
    setManufacturerId(id);
    setModelName('');
    setBatteryCapacity('');
    setIsCustomModel(false);
    setCustomModelName('');
  };

  const handleModelSelect = (name: string) => {
    setModelName(name);

    // "직접 입력" 선택 시
    if (name === '직접 입력') {
      setIsCustomModel(true);
      setBatteryCapacity('');
    } else {
      setIsCustomModel(false);
      // 배터리 용량 자동 설정
      const capacity = getBatteryCapacity(manufacturerId, name);
      if (capacity) {
        setBatteryCapacity(capacity.toString());
      }
    }
  };

  const handleSave = async () => {
    // 유효성 검사
    if (!nickname.trim()) {
      Alert.alert('알림', '차량 별명을 입력해주세요.');
      return;
    }

    if (!manufacturerId) {
      Alert.alert('알림', '제조사를 선택해주세요.');
      return;
    }

    const finalModelName = isCustomModel ? customModelName.trim() : modelName;

    if (!finalModelName) {
      Alert.alert('알림', '모델명을 입력해주세요.');
      return;
    }

    const capacity = parseFloat(batteryCapacity);
    if (isNaN(capacity) || capacity <= 0) {
      Alert.alert('알림', '배터리 용량을 올바르게 입력해주세요.');
      return;
    }

    try {
      const manufacturer = getManufacturerById(manufacturerId);
      if (!manufacturer) {
        Alert.alert('오류', '제조사 정보를 찾을 수 없습니다.');
        return;
      }

      const vehicle: Vehicle = {
        id: existingVehicle?.id || generateId(),
        manufacturer: manufacturer.name,
        nickname: nickname.trim(),
        modelName: finalModelName,
        batteryCapacity: capacity,
        licensePlate: licensePlate.trim(),
        createdAt: existingVehicle?.createdAt || new Date().toISOString(),
      };

      await saveVehicle(vehicle);
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '삭제 확인',
      '차량 정보를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle();
              navigation.goBack();
            } catch (error) {
              Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const selectedManufacturer = getManufacturerById(manufacturerId);
  const manufacturerOptions = manufacturers.map((m) => ({
    label: m.name,
    value: m.id,
  }));

  const modelOptions = selectedManufacturer
    ? selectedManufacturer.models.map((model) => ({
        label: model.name,
        value: model.name,
        subtitle:
          model.batteryCapacity > 0
            ? `배터리: ${model.batteryCapacity} kWh`
            : undefined,
      }))
    : [];

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingVehicle ? '차량 정보 수정' : '차량 등록'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* 차량 별명 */}
        <View style={styles.section}>
          <Text style={styles.label}>차량 별명 (필수)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 나의 아이오닉5"
            placeholderTextColor={colors.textTertiary}
            value={nickname}
            onChangeText={setNickname}
          />
        </View>

        {/* 제조사 선택 */}
        <View style={styles.section}>
          <Text style={styles.label}>제조사 (필수)</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowManufacturerModal(true)}
          >
            <Text
              style={[
                styles.selectButtonText,
                !selectedManufacturer && styles.selectButtonPlaceholder,
              ]}
            >
              {selectedManufacturer ? selectedManufacturer.name : '제조사를 선택하세요'}
            </Text>
            <Text style={styles.selectButtonIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* 모델명 선택 */}
        {selectedManufacturer && (
          <View style={styles.section}>
            <Text style={styles.label}>모델명 (필수)</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowModelModal(true)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !modelName && styles.selectButtonPlaceholder,
                ]}
              >
                {modelName || '모델을 선택하세요'}
              </Text>
              <Text style={styles.selectButtonIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 직접 입력 모드 */}
        {isCustomModel && (
          <View style={styles.section}>
            <Text style={styles.label}>모델명 입력</Text>
            <TextInput
              style={styles.input}
              placeholder="예: Model 3"
              placeholderTextColor={colors.textTertiary}
              value={customModelName}
              onChangeText={setCustomModelName}
            />
          </View>
        )}

        {/* 배터리 용량 */}
        <View style={styles.section}>
          <Text style={styles.label}>배터리 용량 (kWh, 필수)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 77.4"
            placeholderTextColor={colors.textTertiary}
            value={batteryCapacity}
            onChangeText={setBatteryCapacity}
            keyboardType="decimal-pad"
          />
        </View>

        {/* 차량 번호 */}
        <View style={styles.section}>
          <Text style={styles.label}>차량 번호 (선택)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 12가3456"
            placeholderTextColor={colors.textTertiary}
            value={licensePlate}
            onChangeText={setLicensePlate}
          />
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>💾 저장하기</Text>
        </TouchableOpacity>

        {/* 삭제 버튼 (수정 모드일 때만) */}
        {existingVehicle && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>차량 정보 삭제</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 제조사 선택 모달 */}
      <SelectModal
        visible={showManufacturerModal}
        title="제조사 선택"
        options={manufacturerOptions}
        selectedValue={manufacturerId}
        onSelect={handleManufacturerSelect}
        onClose={() => setShowManufacturerModal(false)}
      />

      {/* 모델 선택 모달 */}
      <SelectModal
        visible={showModelModal}
        title="모델 선택"
        options={modelOptions}
        selectedValue={modelName}
        onSelect={handleModelSelect}
        onClose={() => setShowModelModal(false)}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    fontSize: 28,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  selectButtonPlaceholder: {
    color: colors.textTertiary,
  },
  selectButtonIcon: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
