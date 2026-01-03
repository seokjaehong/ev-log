import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ChargeRecord, ThemeColors } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { MonthlySummary } from '../components/MonthlySummary';
import { ChargeListItem } from '../components/ChargeListItem';
import { StatisticsContent } from '../components/statistics/StatisticsContent';
import {
  getChargeRecords,
  calculateMonthlySummary,
} from '../utils/storage';

type TabType = 'records' | 'statistics';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [records, setRecords] = useState<ChargeRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('records');

  const loadRecords = async () => {
    try {
      console.log('[HomeScreen] 기록 로드 중...');
      const loadedRecords = await getChargeRecords();
      console.log('[HomeScreen] 로드된 기록 개수:', loadedRecords.length);
      if (loadedRecords.length > 0) {
        console.log('[HomeScreen] 최신 기록:', loadedRecords[0]);
      }
      setRecords(loadedRecords);
      console.log('[HomeScreen] 상태 업데이트 완료');
    } catch (error) {
      console.error('[HomeScreen] 로드 실패:', error);
      // 에러 발생 시 빈 배열로 설정
      setRecords([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecords();
    setRefreshing(false);
  };

  const handleAddPress = () => {
    navigation.navigate('AddCharge', {});
  };

  const handleRecordPress = (record: ChargeRecord) => {
    navigation.navigate('AddCharge', { editRecord: record });
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const summary = calculateMonthlySummary(records, currentYear, currentMonth);
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.background} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>⚡ EV LOG</Text>
          <Text style={styles.subtitle}>Smart Charging Manager</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <Text style={styles.addButtonText}>+ 기록하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 탭 선택기 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'records' && styles.activeTab]}
          onPress={() => setSelectedTab('records')}
        >
          <Text style={[styles.tabText, selectedTab === 'records' && styles.activeTabText]}>
            📋 기록
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'statistics' && styles.activeTab]}
          onPress={() => setSelectedTab('statistics')}
        >
          <Text style={[styles.tabText, selectedTab === 'statistics' && styles.activeTabText]}>
            📊 통계
          </Text>
        </TouchableOpacity>
      </View>

      {/* 탭 콘텐츠 */}
      {selectedTab === 'records' ? (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.content}>
              <MonthlySummary summary={summary} />

              {summary.totalRecords === 0 && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <Text style={styles.infoText}>
                    이번 달의 충전 기록이 없습니다. 우측의{'\n'}
                    '기록하기' 버튼을 눌러서 첫 충전 기록을{'\n'}
                    입력해보세요!
                  </Text>
                </View>
              )}

              {records.length > 0 && (
                <Text style={styles.sectionTitle}>충전 기록</Text>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <ChargeListItem
              record={item}
              onPress={() => handleRecordPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <StatisticsContent records={records} />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
});
