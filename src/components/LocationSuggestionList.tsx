import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors, FavoriteLocation } from '../types';
import { formatRelativeTime } from '../utils/favoriteLocations';

interface LocationSuggestionListProps {
  favorites: FavoriteLocation[];
  recents: FavoriteLocation[];
  filteredSuggestions: FavoriteLocation[];
  searchQuery: string;
  onSelectLocation: (location: string) => void;
}

export const LocationSuggestionList: React.FC<LocationSuggestionListProps> = ({
  favorites,
  recents,
  filteredSuggestions,
  searchQuery,
  onSelectLocation,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // 검색어가 없으면 전체 목록 표시 (즐겨찾기 + 최근 방문 구분)
  // 검색어가 있으면 필터링된 결과만 표시
  const showSeparateSections = searchQuery.trim() === '';

  const renderLocationItem = (item: FavoriteLocation, isFavorite: boolean) => {
    const relativeTime = formatRelativeTime(item.daysSinceLastVisit);

    return (
      <TouchableOpacity
        key={item.location}
        style={styles.item}
        onPress={() => onSelectLocation(item.location)}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.locationName} numberOfLines={1}>
            {isFavorite && '⭐ '}
            {item.location}
          </Text>
        </View>
        <Text style={styles.locationInfo}>
          평균 {item.averageUnitPrice.toLocaleString()}원 · {item.visitCount}회 ·{' '}
          {relativeTime}
        </Text>
      </TouchableOpacity>
    );
  };

  if (filteredSuggestions.length === 0) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      {showSeparateSections ? (
        <>
          {/* 즐겨찾기 섹션 */}
          {favorites.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>💾 즐겨찾기 (3회 이상)</Text>
              </View>
              {favorites.map((item) => renderLocationItem(item, true))}
            </View>
          )}

          {/* 최근 방문 섹션 */}
          {recents.length > 0 && (
            <View>
              {favorites.length > 0 && <View style={styles.divider} />}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📍 최근 방문 (1-2회)</Text>
              </View>
              {recents.map((item) => renderLocationItem(item, false))}
            </View>
          )}
        </>
      ) : (
        // 검색 결과
        <View>
          {filteredSuggestions.map((item) => {
            const isFavorite = favorites.some((f) => f.location === item.location);
            return renderLocationItem(item, isFavorite);
          })}
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 52, // 입력 필드 높이 + 여백
      left: 0,
      right: 0,
      maxHeight: 300,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 1001,
    },
    sectionHeader: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.background,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    item: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    locationName: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
    },
    locationInfo: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
