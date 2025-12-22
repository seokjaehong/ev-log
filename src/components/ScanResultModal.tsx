import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { ParsedReceipt, ThemeColors } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { formatParsedResult } from '../utils/receiptParser';

interface ScanResultModalProps {
  visible: boolean;
  imageUri: string | null;
  parsedData: ParsedReceipt | null;
  onApply: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({
  visible,
  imageUri,
  parsedData,
  onApply,
  onRetry,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!parsedData) {
    return null;
  }

  const hasData = parsedData.confidence > 0;
  const isReliable = parsedData.confidence >= 0.4;

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
            <Text style={styles.headerTitle}>📄 영수증 스캔 결과</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* 썸네일 이미지 */}
            {imageUri && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.thumbnail}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* 인식 결과 */}
            {hasData ? (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>인식된 정보</Text>
                <Text style={styles.resultText}>
                  {formatParsedResult(parsedData)}
                </Text>

                {!isReliable && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      ⚠️ 인식 신뢰도가 낮습니다. 정보를 확인해주세요.
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>😕</Text>
                <Text style={styles.emptyText}>
                  영수증에서 정보를 찾을 수 없습니다.{'\n'}
                  다시 촬영하거나 수동으로 입력해주세요.
                </Text>
              </View>
            )}

            {/* 원본 텍스트 */}
            <View style={styles.rawTextCard}>
              <Text style={styles.rawTextTitle}>원본 텍스트</Text>
              <ScrollView
                style={styles.rawTextScroll}
                nestedScrollEnabled={true}
              >
                <Text style={styles.rawText}>{parsedData.rawText}</Text>
              </ScrollView>
            </View>
          </ScrollView>

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            {hasData && (
              <TouchableOpacity
                style={[styles.button, styles.applyButton]}
                onPress={onApply}
              >
                <Text style={styles.applyButtonText}>✓ 적용하기</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
            >
              <Text style={styles.retryButtonText}>📷 다시 찍기</Text>
            </TouchableOpacity>
          </View>
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
      maxHeight: '90%',
      paddingBottom: 20,
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
    content: {
      flex: 1,
      padding: 20,
    },
    imageContainer: {
      marginBottom: 20,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },
    thumbnail: {
      width: '100%',
      height: 200,
    },
    resultCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
    },
    resultTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    resultText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    warningBox: {
      marginTop: 12,
      padding: 12,
      backgroundColor: 'rgba(255, 165, 0, 0.1)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 165, 0, 0.3)',
    },
    warningText: {
      fontSize: 13,
      color: '#ff9500',
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 40,
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    rawTextCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    rawTextTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    rawTextScroll: {
      maxHeight: 120,
    },
    rawText: {
      fontSize: 12,
      color: colors.textTertiary,
      lineHeight: 18,
      fontFamily: 'monospace',
    },
    buttonContainer: {
      paddingHorizontal: 20,
      gap: 12,
    },
    button: {
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    applyButton: {
      backgroundColor: colors.primary,
    },
    applyButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    retryButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    retryButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });
