import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChargeRecord, ChargerType, ThemeColors } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface ChargeListItemProps {
  record: ChargeRecord;
  onPress: () => void;
}

const getChargerIcon = (type: ChargerType): string => {
  switch (type) {
    case '슈퍼차저':
      return '⚡';
    case '급속':
      return '🔌';
    case '완속':
      return '🔋';
    default:
      return '🔌';
  }
};

const getChargerTypeLabel = (type: ChargerType): string => {
  switch (type) {
    case '슈퍼차저':
      return 'Supercharger';
    case '급속':
      return 'DC Combo';
    case '완속':
      return 'Slow';
    default:
      return type;
  }
};

export const ChargeListItem: React.FC<ChargeListItemProps> = ({
  record,
  onPress,
}) => {
  const { colors } = useTheme();
  const formattedDate = new Date(record.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getChargerIcon(record.chargerType)}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.location}>{record.location}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.chargerType}>
              {getChargerTypeLabel(record.chargerType)}
            </Text>
            {record.batteryPercent && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.battery}>배터리 {record.batteryPercent}%</Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.cost}>
          {record.totalCost.toLocaleString('ko-KR')}
        </Text>
        <Text style={styles.amount}>{record.chargeAmount.toFixed(1)} kWh</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  infoContainer: {
    flex: 1,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chargerType: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  separator: {
    fontSize: 13,
    color: colors.textTertiary,
    marginHorizontal: 6,
  },
  battery: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  cost: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  amount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
