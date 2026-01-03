import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors, ChargeRecord, FavoriteLocation } from '../types';
import {
  getFavoriteLocations,
  getRecentLocations,
  searchLocations,
} from '../utils/favoriteLocations';
import { LocationSuggestionList } from './LocationSuggestionList';

interface LocationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  records: ChargeRecord[]; // 충전 기록 (통계 계산용)
  onDropdownToggle?: (isOpen: boolean) => void; // 드롭다운 열림/닫힘 콜백
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChangeText,
  placeholder = '충전소 위치',
  records,
  onDropdownToggle,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [recents, setRecents] = useState<FavoriteLocation[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<FavoriteLocation[]>([]);

  // 충전 기록이 변경되면 즐겨찾기 및 최근 방문 목록 업데이트
  useEffect(() => {
    const favoriteList = getFavoriteLocations(records);
    const recentList = getRecentLocations(records);
    setFavorites(favoriteList);
    setRecents(recentList);
  }, [records]);

  // 입력값이 변경되면 필터링
  useEffect(() => {
    if (!isFocused) {
      return;
    }

    if (value.trim() === '') {
      // 빈 값이면 즐겨찾기 + 최근 방문 모두 표시
      setFilteredSuggestions([...favorites, ...recents]);
      setShowSuggestions(favorites.length > 0 || recents.length > 0);
    } else {
      // 검색어가 있으면 즐겨찾기와 최근 방문에서 검색
      const allLocations = [...favorites, ...recents];
      const filtered = searchLocations(allLocations, value);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  }, [value, isFocused, favorites, recents]);

  // 드롭다운 열림/닫힘 상태 알림
  useEffect(() => {
    onDropdownToggle?.(showSuggestions);
  }, [showSuggestions, onDropdownToggle]);

  const handleFocus = () => {
    setIsFocused(true);
    if (favorites.length > 0 || recents.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // 약간의 지연을 주어 항목 클릭이 먼저 처리되도록 함
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleSelectLocation = (location: string) => {
    onChangeText(location);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
        />
        {value.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 자동완성 드롭다운 */}
      {showSuggestions && (
        <LocationSuggestionList
          favorites={favorites}
          recents={recents}
          filteredSuggestions={filteredSuggestions}
          searchQuery={value}
          onSelectLocation={handleSelectLocation}
        />
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      zIndex: 1000, // 드롭다운이 다른 요소 위에 표시되도록
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
    },
    input: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    clearButton: {
      padding: 4,
      marginLeft: 8,
    },
    clearButtonText: {
      fontSize: 24,
      color: colors.textSecondary,
      lineHeight: 24,
    },
  });
