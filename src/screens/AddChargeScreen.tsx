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
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, ChargerType, ThemeColors, ParsedReceipt, ChargeRecordAnalysis } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import {
  saveChargeRecord,
  deleteChargeRecord,
  generateId,
} from '../utils/storage';
import { pickImageFromCamera, pickImageFromLibrary } from '../utils/imagePickerUtils';
import { performOCR } from '../services/ocrService';
import { parseReceipt } from '../utils/receiptParser';
import { analyzeChargingReceipt } from '../services/visionService';
import { ScanResultModal } from '../components/ScanResultModal';

type AddChargeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddCharge'
>;

type AddChargeScreenRouteProp = RouteProp<RootStackParamList, 'AddCharge'>;

interface AddChargeScreenProps {
  navigation: AddChargeScreenNavigationProp;
  route: AddChargeScreenRouteProp;
}

export const AddChargeScreen: React.FC<AddChargeScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors } = useTheme();
  const editRecord = route.params?.editRecord;
  const isEditing = !!editRecord;

  const [date, setDate] = useState<Date>(
    editRecord ? new Date(editRecord.date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState(editRecord?.location || '');
  const [chargerType, setChargerType] = useState<ChargerType>(
    editRecord?.chargerType || '급속'
  );
  const [chargeAmount, setChargeAmount] = useState(
    editRecord?.chargeAmount || 40
  );
  const [unitPrice, setUnitPrice] = useState(editRecord?.unitPrice || 300);
  const [batteryPercent, setBatteryPercent] = useState(
    editRecord?.batteryPercent?.toString() || ''
  );

  // OCR 관련 state
  const [isScanning, setIsScanning] = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
  const [visionAnalysis, setVisionAnalysis] = useState<ChargeRecordAnalysis | null>(null);

  const totalCost = Math.round(chargeAmount * unitPrice);
  const styles = createStyles(colors);

  const handleSave = async () => {
    if (!location.trim()) {
      if (Platform.OS === 'web') {
        window.alert('장소를 입력해주세요.');
      } else {
        Alert.alert('알림', '장소를 입력해주세요.');
      }
      return;
    }

    try {
      const record = {
        id: editRecord?.id || generateId(),
        date: date.toISOString(),
        location: location.trim(),
        chargerType,
        chargeAmount,
        unitPrice,
        totalCost,
        batteryPercent: batteryPercent ? parseInt(batteryPercent, 10) : undefined,
      };

      await saveChargeRecord(record);

      navigation.goBack();
    } catch (error) {
      console.error('❌ 저장 오류:', error);
      if (Platform.OS === 'web') {
        window.alert('저장 중 오류가 발생했습니다: ' + (error as Error).message);
      } else {
        Alert.alert('오류', '저장 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '삭제 확인',
      '이 충전 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              if (editRecord) {
                await deleteChargeRecord(editRecord.id);
                navigation.goBack();
              }
            } catch (error) {
              Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // OCR 스캔 시작
  const handleScanReceipt = () => {
    // 웹에서는 Alert.alert가 여러 버튼을 지원하지 않으므로 바로 파일 선택
    if (Platform.OS === 'web') {
      handleImagePick('library');
      return;
    }

    Alert.alert('영수증 스캔', '이미지를 가져올 방법을 선택하세요', [
      {
        text: '사진 촬영',
        onPress: () => handleImagePick('camera'),
      },
      {
        text: '앨범에서 선택',
        onPress: () => handleImagePick('library'),
      },
      { text: '취소', style: 'cancel' },
    ]);
  };

  // 이미지 선택 및 OCR 처리
  const handleImagePick = async (source: 'camera' | 'library') => {
    setIsScanning(true);

    try {
      // 1. 이미지 선택
      let imageUri: string | null = null;

      if (source === 'camera') {
        imageUri = await pickImageFromCamera();
      } else {
        imageUri = await pickImageFromLibrary();
      }

      if (!imageUri) {
        setIsScanning(false);
        return;
      }

      setScannedImageUri(imageUri);

      // 2. Gemini Vision API로 이미지 분석
      const analysis = await analyzeChargingReceipt(imageUri);
      setVisionAnalysis(analysis);

      // 3. 이미지 유효성 검사
      if (!analysis.isValid) {
        if (Platform.OS === 'web') {
          window.alert(
            `유효하지 않은 이미지입니다\n\n${analysis.reasoning}\n\n충전기 화면이나 충전 영수증 이미지를 선택해주세요.`
          );
        } else {
          Alert.alert(
            '유효하지 않은 이미지',
            `${analysis.reasoning}\n\n충전기 화면이나 충전 영수증 이미지를 선택해주세요.`
          );
        }
        return;
      }

      // 4. 충전 상태 확인
      if (analysis.chargingStatus === 'in_progress') {
        if (Platform.OS === 'web') {
          window.alert(
            `충전이 아직 진행 중입니다\n\n${analysis.reasoning}\n\n충전이 완료된 후 다시 촬영해주세요.`
          );
        } else {
          Alert.alert(
            '충전 진행 중',
            `${analysis.reasoning}\n\n충전이 완료된 후 다시 촬영해주세요.`
          );
        }
        return;
      }

      // 5. 날짜 정보 확인 및 사용자 확인
      let finalDate: Date | undefined = undefined;

      if (analysis.date) {
        // 영수증에 날짜 정보가 있는 경우 - 사용자에게 확인
        const extractedDate = new Date(analysis.date);
        const dateString = extractedDate.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        // 사용자에게 날짜 확인
        const confirmDate = await new Promise<boolean>((resolve) => {
          if (Platform.OS === 'web') {
            const result = window.confirm(
              `영수증에서 다음 날짜를 인식했습니다:\n\n📅 ${dateString}\n\n이 날짜가 맞나요?\n\n"취소"를 선택하면 직접 수정할 수 있습니다.`
            );
            resolve(result);
          } else {
            Alert.alert(
              '날짜 확인',
              `영수증에서 다음 날짜를 인식했습니다:\n\n${dateString}\n\n이 날짜가 맞나요?`,
              [
                {
                  text: '직접 수정',
                  style: 'cancel',
                  onPress: () => resolve(false),
                },
                {
                  text: '확인',
                  onPress: () => resolve(true),
                },
              ]
            );
          }
        });

        if (confirmDate) {
          finalDate = extractedDate;
        }
        // confirmDate가 false이면 finalDate는 undefined로 남겨서 사용자가 직접 입력하게 함
      } else {
        // 날짜 정보가 없는 경우 - 사용자에게 확인

        const useCurrentDate = await new Promise<boolean>((resolve) => {
          if (Platform.OS === 'web') {
            const result = window.confirm(
              '영수증에서 날짜 정보를 찾을 수 없습니다.\n\n현재 날짜를 사용하시겠습니까?\n\n"취소"를 선택하면 직접 입력할 수 있습니다.'
            );
            resolve(result);
          } else {
            Alert.alert(
              '날짜 정보 없음',
              '영수증에서 날짜 정보를 찾을 수 없습니다.\n\n현재 날짜를 사용하시겠습니까?',
              [
                {
                  text: '직접 입력',
                  style: 'cancel',
                  onPress: () => resolve(false),
                },
                {
                  text: '현재 날짜 사용',
                  onPress: () => resolve(true),
                },
              ]
            );
          }
        });

        if (useCurrentDate) {
          finalDate = new Date();
        }
        // useCurrentDate가 false이면 finalDate는 undefined로 남겨서 사용자가 직접 입력하게 함
      }

      // 6. Vision 분석 결과를 ParsedReceipt 형식으로 변환 (모달 호환성)
      const parsedFromVision: ParsedReceipt = {
        date: finalDate,
        location: analysis.location,
        chargeAmount: analysis.chargeAmount,
        unitPrice: analysis.unitPrice,
        totalCost: analysis.totalCost,
        chargerType: analysis.chargerType !== 'unknown' ? analysis.chargerType : undefined,
        confidence: analysis.confidence,
        rawText: analysis.reasoning, // 분석 이유를 rawText로 표시
      };
      setParsedData(parsedFromVision);

      // 7. 결과 모달 표시
      setShowScanResult(true);
    } catch (error: any) {
      console.error('OCR 오류:', error);

      const errorMessage = error.message || '영수증 인식에 실패했습니다. 다시 시도해주세요.';

      if (Platform.OS === 'web') {
        window.alert(`오류: ${errorMessage}`);
      } else {
        Alert.alert('오류', errorMessage);
      }
    } finally {
      setIsScanning(false);
    }
  };

  // 파싱 결과 적용
  const handleApplyParsedData = () => {
    if (!parsedData) return;

    if (parsedData.date) {
      setDate(parsedData.date);
    }

    if (parsedData.location) {
      setLocation(parsedData.location);
    }

    if (parsedData.chargerType) {
      setChargerType(parsedData.chargerType);
    }

    if (parsedData.chargeAmount) {
      setChargeAmount(parsedData.chargeAmount);
    }

    if (parsedData.unitPrice) {
      setUnitPrice(parsedData.unitPrice);
    }

    // Vision 분석에서 배터리 퍼센트가 있으면 적용
    if (visionAnalysis?.batteryPercent) {
      setBatteryPercent(visionAnalysis.batteryPercent.toString());
    }

    setShowScanResult(false);

    if (Platform.OS === 'web') {
      window.alert('스캔한 정보가 적용되었습니다.');
    } else {
      Alert.alert('완료', '스캔한 정보가 적용되었습니다.');
    }
  };

  // 다시 촬영
  const handleRetryScan = () => {
    setShowScanResult(false);
    setParsedData(null);
    setVisionAnalysis(null);
    setScannedImageUri(null);
    handleScanReceipt();
  };

  // 모달 닫기
  const handleCloseScanResult = () => {
    setShowScanResult(false);
    setParsedData(null);
    setVisionAnalysis(null);
    setScannedImageUri(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? '충전 기록 수정' : '새 충전 기록 추가'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* 예상 금액 카드 */}
        <View style={styles.costCard}>
          <View style={styles.costCardHeader}>
            <Text style={styles.costCardLabel}>예상 충전 금액</Text>
            <Text style={styles.costCardIcon}>⚡</Text>
          </View>
          <Text style={styles.costCardAmount}>
            {totalCost.toLocaleString('ko-KR')}원
          </Text>
          <View style={styles.costCardDetails}>
            <View>
              <Text style={styles.costCardDetailLabel}>충전량</Text>
              <Text style={styles.costCardDetailValue}>
                {chargeAmount.toFixed(0)} kWh
              </Text>
            </View>
            <View style={styles.costCardDetailRight}>
              <Text style={styles.costCardDetailLabel}>단가</Text>
              <Text style={styles.costCardDetailValue}>{unitPrice} 원</Text>
            </View>
          </View>
        </View>

        {/* 영수증 스캔 버튼 */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScanReceipt}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.scanButtonIcon}>📷</Text>
              <Text style={styles.scanButtonText}>영수증 스캔하기</Text>
            </>
          )}
        </TouchableOpacity>

        {/* 날짜 */}
        <View style={styles.section}>
          <Text style={styles.label}>날짜</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={date.toISOString().split('T')[0]}
              onChange={(e: any) => setDate(new Date(e.target.value))}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                padding: 16,
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
                borderStyle: 'solid',
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {date.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </>
          )}
        </View>

        {/* 장소 */}
        <View style={styles.section}>
          <Text style={styles.label}>장소</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 슈퍼차저 성수"
            placeholderTextColor={colors.textTertiary}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* 충전기 타입 */}
        <View style={styles.section}>
          <Text style={styles.label}>충전기 타입</Text>
          <View style={styles.typeButtons}>
            {(['완속', '급속', '슈퍼차저'] as ChargerType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  chargerType === type && styles.typeButtonActive,
                ]}
                onPress={() => setChargerType(type)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    chargerType === type && styles.typeButtonTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 충전량 */}
        <View style={styles.section}>
          <View style={styles.sliderHeader}>
            <Text style={styles.label}>충전량 (kWh)</Text>
            <Text style={styles.sliderValue}>{chargeAmount.toFixed(0)} kWh</Text>
          </View>
          {Platform.OS === 'web' ? (
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={chargeAmount}
              onChange={(e: any) => setChargeAmount(parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: 40,
                accentColor: colors.primary,
              }}
            />
          ) : (
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={chargeAmount}
              onValueChange={setChargeAmount}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          )}
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>0</Text>
            <Text style={styles.sliderLabelText}>50</Text>
            <Text style={styles.sliderLabelText}>100</Text>
          </View>
        </View>

        {/* 단가 */}
        <View style={styles.section}>
          <View style={styles.sliderHeader}>
            <Text style={styles.label}>단가 (원/kWh)</Text>
            <Text style={styles.sliderValue}>{unitPrice} 원</Text>
          </View>
          {Platform.OS === 'web' ? (
            <input
              type="range"
              min={50}
              max={600}
              step={10}
              value={unitPrice}
              onChange={(e: any) => setUnitPrice(parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: 40,
                accentColor: colors.primary,
              }}
            />
          ) : (
            <Slider
              style={styles.slider}
              minimumValue={50}
              maximumValue={600}
              step={10}
              value={unitPrice}
              onValueChange={setUnitPrice}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          )}
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>50</Text>
            <Text style={styles.sliderLabelText}>300</Text>
            <Text style={styles.sliderLabelText}>600</Text>
          </View>
        </View>

        {/* 배터리 퍼센트 (선택사항) */}
        <View style={styles.section}>
          <Text style={styles.label}>배터리 % (선택사항)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 85"
            placeholderTextColor={colors.textTertiary}
            value={batteryPercent}
            onChangeText={setBatteryPercent}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>💾 저장하기</Text>
        </TouchableOpacity>

        {/* 삭제 버튼 (수정 모드일 때만) */}
        {isEditing && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>삭제하기</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* OCR 스캔 결과 모달 */}
      <ScanResultModal
        visible={showScanResult}
        imageUri={scannedImageUri}
        parsedData={parsedData}
        onApply={handleApplyParsedData}
        onRetry={handleRetryScan}
        onClose={handleCloseScanResult}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  costCard: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  costCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  costCardLabel: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
  },
  costCardIcon: {
    fontSize: 24,
  },
  costCardAmount: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  costCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  costCardDetailLabel: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  costCardDetailValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  costCardDetailRight: {
    alignItems: 'flex-end',
  },
  section: {
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  scanButtonIcon: {
    fontSize: 20,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  dateInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  typeButtonActive: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: colors.primary,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: colors.textTertiary,
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
