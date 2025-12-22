import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface WebSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
}

export const WebSlider: React.FC<WebSliderProps> = ({
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  minimumTrackTintColor = '#1fb28a',
  style,
}) => {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <input
          type="range"
          min={minimumValue}
          max={maximumValue}
          step={step}
          value={value}
          onChange={(e) => onValueChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: 40,
            accentColor: minimumTrackTintColor,
          }}
        />
      </View>
    );
  }

  // 네이티브에서는 원래의 Slider를 사용하도록 null 반환 (부모에서 처리)
  return null;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
  },
});
