import React from 'react';
import { View, StyleSheet, Platform, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddChargeScreen } from './src/screens/AddChargeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { VehicleSettingsScreen } from './src/screens/VehicleSettingsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// 인증 상태에 따른 네비게이션
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // 로딩 화면
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f1419' }}>
        <ActivityIndicator size="large" color="#1fb28a" />
        <Text style={{ marginTop: 16, color: '#ffffff', fontSize: 16 }}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddCharge" component={AddChargeScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="VehicleSettings" component={VehicleSettingsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  const content = (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
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
