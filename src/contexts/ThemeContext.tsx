import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { ThemeMode, ThemeColors } from '../types';
import { getTheme, saveTheme } from '../utils/storage';

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 다크 테마 색상 (현재 HomeScreen 스타일 기반)
const darkTheme: ThemeColors = {
  background: '#0f1419',
  surface: '#1a2332',
  card: '#1a2332',
  text: '#ffffff',
  textSecondary: '#8b95a5',
  textTertiary: '#666666',
  primary: '#1fb28a',
  accent: '#1fb28a',
  border: '#2a3647',
  error: '#ff6666',
  statusBarStyle: 'light-content',
};

// 라이트 테마 색상 (현재 AddChargeScreen 스타일 기반)
const lightTheme: ThemeColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',
  primary: '#1fb28a',
  accent: '#1a2332',
  border: '#e0e0e0',
  error: '#ff4444',
  statusBarStyle: 'dark-content',
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 테마 로드
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getTheme();
      setThemeState(savedTheme);
      setIsLoading(false);
    };
    loadTheme();
  }, []);

  // 테마 변경 시 저장
  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode);
    await saveTheme(mode);
  };

  // 테마 토글
  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };

  // 현재 테마에 맞는 색상 객체
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  // 로딩 중에는 빈 화면 (깜빡임 방지)
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
