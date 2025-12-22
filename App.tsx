import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddChargeScreen } from './src/screens/AddChargeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { VehicleSettingsScreen } from './src/screens/VehicleSettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const content = (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddCharge" component={AddChargeScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="VehicleSettings" component={VehicleSettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );

  // 웹에서는 모바일 뷰포트처럼 보이도록 컨테이너 추가
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.mobileFrame}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileFrame: {
    width: '100%',
    maxWidth: 430, // iPhone 14 Pro Max 너비
    height: '100%',
    maxHeight: 932, // iPhone 14 Pro Max 높이
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    // 그림자 효과로 프레임처럼 보이게
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
});
