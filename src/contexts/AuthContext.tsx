import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, Session } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 세션 확인
  useEffect(() => {
    checkSession();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] Auth state changed:', _event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 세션 확인
  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[AuthContext] Session check error:', error);
        throw error;
      }
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('[AuthContext] Failed to check session:', error);
    } finally {
      setLoading(false);
    }
  };

  // 로그인
  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Signing in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext] Sign in error:', error);
        throw error;
      }

      console.log('[AuthContext] Sign in successful');
      setSession(data.session);
      setUser(data.user);
    } catch (error) {
      console.error('[AuthContext] Sign in failed:', error);
      throw error;
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      console.log('[AuthContext] Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthContext] Sign out error:', error);
        throw error;
      }
      console.log('[AuthContext] Sign out successful');
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('[AuthContext] Sign out failed:', error);
      throw error;
    }
  };

  const isAuthenticated = !!session && !!user;

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
