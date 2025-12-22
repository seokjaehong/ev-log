import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { ThemeColors } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface SelectOption {
  label: string;
  value: string;
  subtitle?: string;
}

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const SelectModal: React.FC<SelectModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 옵션 리스트 */}
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  item.value === selectedValue && styles.optionItemSelected,
                ]}
                onPress={() => handleSelect(item.value)}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      item.value === selectedValue && styles.optionLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.subtitle && (
                    <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
                {item.value === selectedValue && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            style={styles.optionList}
          />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonText: {
      fontSize: 24,
      color: colors.textSecondary,
    },
    optionList: {
      paddingVertical: 8,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionItemSelected: {
      backgroundColor: colors.surface,
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      color: colors.text,
    },
    optionLabelSelected: {
      fontWeight: '600',
      color: colors.primary,
    },
    optionSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    checkIcon: {
      fontSize: 20,
      color: colors.primary,
      marginLeft: 12,
    },
  });
