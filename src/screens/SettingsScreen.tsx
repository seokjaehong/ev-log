import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import Constants from 'expo-constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Vehicle } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getVehicle } from '../utils/storage';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

const APP_NAME = 'EV LOG';
const COMPANY_NAME = '주식회사 티핑포인트';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme, colors, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    loadVehicle();

    // 화면 포커스 시 차량 정보 다시 로드
    const unsubscribe = navigation.addListener('focus', () => {
      loadVehicle();
    });

    return unsubscribe;
  }, [navigation]);

  const loadVehicle = async () => {
    const vehicleData = await getVehicle();
    setVehicle(vehicleData);
  };

  const handleVehiclePress = () => {
    navigation.navigate('VehicleSettings');
  };

  const handleLogout = async () => {
    const confirmLogout = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error('[SettingsScreen] Logout error:', error);
        if (Platform.OS === 'web') {
          window.alert('로그아웃 중 오류가 발생했습니다.');
        } else {
          Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('로그아웃하시겠습니까?')) {
        await confirmLogout();
      }
    } else {
      Alert.alert(
        '로그아웃',
        '로그아웃하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '로그아웃', onPress: confirmLogout },
        ]
      );
    }
  };

  const styles = createStyles(colors);
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* 계정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>
          <View style={styles.accountCard}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>로그인 계정</Text>
              <Text style={styles.accountEmail}>{user?.email || '알 수 없음'}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 테마 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>테마</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>다크 모드</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* 차량 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>차량 정보</Text>

          {vehicle ? (
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleLabel}>🚗 차량 별명</Text>
                <Text style={styles.vehicleValue}>{vehicle.nickname}</Text>
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleLabel}>🏭 제조사</Text>
                <Text style={styles.vehicleValue}>{vehicle.manufacturer}</Text>
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleLabel}>📋 모델명</Text>
                <Text style={styles.vehicleValue}>{vehicle.modelName}</Text>
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleLabel}>🔋 배터리 용량</Text>
                <Text style={styles.vehicleValue}>{vehicle.batteryCapacity} kWh</Text>
              </View>
              {vehicle.licensePlate && (
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleLabel}>🚙 차량 번호</Text>
                  <Text style={styles.vehicleValue}>{vehicle.licensePlate}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.editButton}
                onPress={handleVehiclePress}
              >
                <Text style={styles.editButtonText}>차량 정보 수정</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                차량을 등록하면 효율적인{'\n'}충전 관리가 가능합니다.
              </Text>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleVehiclePress}
              >
                <Text style={styles.registerButtonText}>차량 등록하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer: 앱 정보 */}
        <View style={styles.footerContainer}>
          <Text style={styles.appVersion}>
            {APP_NAME} v{Constants.expoConfig?.version || '1.0.0'}
          </Text>
          <Text style={styles.companyInfo}>
            © {new Date().getFullYear()} {COMPANY_NAME}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },
  vehicleCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
  },
  vehicleInfo: {
    marginBottom: 16,
  },
  vehicleLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  vehicleValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  editButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
  },
  accountInfo: {
    marginBottom: 16,
  },
  accountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: colors.error,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 8,
  },
  appVersion: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  companyInfo: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '400',
  },
});
