'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook, SignInResponse } from '@/app/hooks/useAuth';
import type { authSignIn } from '@cooodecat/otto-sdk/lib/functional/auth/sign_in';
import type { authSignUp } from '@cooodecat/otto-sdk/lib/functional/auth/sign_up';
import { userMyInfo } from '@cooodecat/otto-sdk/lib/functional/user';

// 인증 상태 타입
export interface AuthState {
  isAuthenticated: boolean;
  user: userMyInfo.Output | null;
  isLoading: boolean;
  error: string | null;
}

// 인증 컨텍스트 타입 - useAuth의 모든 기능을 포함
export interface AuthContextType extends AuthState {
  signIn: (formData: authSignIn.Body) => Promise<SignInResponse>;
  signUp: (formData: authSignUp.Body) => Promise<SignInResponse>;
  signOut: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  // 레거시 호환성을 위한 별칭
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshTokens: () => Promise<boolean>;
  clearError: () => void;
}

// 기본 컨텍스트 값
const defaultContextValue: AuthContextType = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  validateToken: async () => false,
  refreshToken: async () => false,
  login: async () => ({ success: false, message: '' }),
  logout: () => {},
  refreshTokens: async () => false,
  clearError: () => {},
};

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// AuthProvider Props 타입
interface AuthProviderProps {
  children: ReactNode;
}

// 인증 프로바이더 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // useAuth 훅을 통해 모든 인증 기능 가져오기
  const authHook = useAuthHook();

  // 레거시 호환성을 위한 별칭 함수들
  const login = async (email: string, password: string) => {
    const result = await authHook.signIn({ email, password });
    return {
      success: result.success,
      message: result.message || '',
    };
  };

  const logout = () => {
    authHook.signOut();
  };

  const refreshTokens = async (): Promise<boolean> => {
    return await authHook.refreshToken();
  };

  const clearError = () => {
    // 에러 클리어 기능은 useAuth에서 자동으로 처리됨
    console.log('Error cleared (handled automatically by useAuth)');
  };

  // 컨텍스트 값 구성
  const contextValue: AuthContextType = {
    ...authHook,
    login,
    logout,
    refreshTokens,
    clearError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// useAuth 훅 (컨텍스트 접근용)
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// 인증 상태만 필요한 경우를 위한 훅
export const useAuthState = (): AuthState => {
  const { isAuthenticated, user, isLoading, error } = useAuth();
  return { isAuthenticated, user, isLoading, error };
};

// 인증 액션만 필요한 경우를 위한 훅
export const useAuthActions = () => {
  const { signIn, signUp, signOut, validateToken, refreshToken } = useAuth();
  return { signIn, signUp, signOut, validateToken, refreshToken };
};

export default AuthContext;
