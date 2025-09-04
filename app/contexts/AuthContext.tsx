'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { authApi, ApiError, User } from '@/app/lib/auth-api';
import { tokenManager, TokenState } from '@/app/lib/token-manager';
import { getUserFromToken } from '@/app/lib/jwt-utils';

// 인증 상태 타입
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  tokenState: TokenState;
}

// 인증 컨텍스트 타입
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshTokens: () => Promise<boolean>;
  clearError: () => void;
}

// 초기 상태
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  tokenState: {
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
  },
};

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Props 타입
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // 에러 초기화
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  // 토큰 상태 업데이트
  const updateTokenState = useCallback(() => {
    const tokenState = tokenManager.getTokenState();
    setAuthState((prev) => ({ ...prev, tokenState }));
  }, []);

  // 로그인 함수
  const login = useCallback(
    async (email: string, password: string) => {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await authApi.login({ email, password });

        // 토큰 상태 업데이트
        tokenManager.updateTokens(response);
        updateTokenState();

        // JWT 토큰에서 실제 사용자 정보 추출
        const userInfo = getUserFromToken(response.accessToken);
        if (!userInfo) {
          throw new Error('토큰에서 사용자 정보를 추출할 수 없습니다.');
        }

        const user: User = {
          userID: userInfo.userID,
          email: userInfo.email,
          name: userInfo.email.split('@')[0] || '사용자',
          memberRole: 'MEMBER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user,
          isLoading: false,
          error: null,
        }));

        return { success: true, message: response.message || '로그인 성공' };
      } catch (error) {
        const errorMessage =
          error instanceof ApiError ? error.message : '로그인 중 오류가 발생했습니다.';

        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: errorMessage,
        }));

        return { success: false, message: errorMessage };
      }
    },
    [updateTokenState]
  );

  // 로그아웃 함수
  const logout = useCallback(() => {
    tokenManager.clearTokens();
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: false,
      user: null,
      error: null,
      tokenState: {
        accessToken: null,
        refreshToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
      },
    }));
  }, []);

  // 토큰 리프레시 함수
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const success = await tokenManager.refreshTokensIfNeeded();
      updateTokenState();

      if (!success) {
        // 리프레시 실패 시 로그아웃
        logout();
      }

      return success;
    } catch (error) {
      console.error('토큰 리프레시 오류:', error);
      logout();
      return false;
    }
  }, [updateTokenState, logout]);

  // 초기 인증 상태 확인
  useEffect(() => {
    const initializeAuth = async () => {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      try {
        // 토큰 상태 업데이트
        updateTokenState();

        // 토큰이 있으면 유효성 확인 및 리프레시
        const accessToken = tokenManager.getAccessToken();
        if (accessToken) {
          const isTokenValid = await tokenManager.refreshTokensIfNeeded();

          if (isTokenValid) {
            // JWT 토큰에서 실제 사용자 정보 추출
            const userInfo = getUserFromToken(accessToken);
            if (userInfo) {
              const user: User = {
                userID: userInfo.userID,
                email: userInfo.email,
                name: userInfo.email.split('@')[0] || '사용자',
                memberRole: 'MEMBER',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              setAuthState((prev) => ({
                ...prev,
                isAuthenticated: true,
                user,
                isLoading: false,
                error: null,
              }));
            } else {
              setAuthState((prev) => ({
                ...prev,
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: null,
              }));
            }
          } else {
            setAuthState((prev) => ({
              ...prev,
              isAuthenticated: false,
              user: null,
              isLoading: false,
              error: null,
            }));
          }
        } else {
          setAuthState((prev) => ({
            ...prev,
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
          }));
        }
      } catch (error) {
        console.error('인증 초기화 오류:', error);
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        }));
      }
    };

    initializeAuth();
  }, [updateTokenState]);

  // 토큰 만료 시 자동 리프레시 (5분마다 체크)
  useEffect(() => {
    const interval = setInterval(
      async () => {
        if (authState.isAuthenticated) {
          await refreshTokens();
        }
      },
      5 * 60 * 1000
    ); // 5분

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, refreshTokens]);

  // 컨텍스트 값
  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshTokens,
    clearError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// useAuth 훅
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// 인증 상태만 필요한 경우를 위한 훅
export const useAuthState = (): AuthState => {
  const { isAuthenticated, user, isLoading, error, tokenState } = useAuth();
  return { isAuthenticated, user, isLoading, error, tokenState };
};

// 인증 액션만 필요한 경우를 위한 훅
export const useAuthActions = () => {
  const { login, logout, refreshTokens, clearError } = useAuth();
  return { login, logout, refreshTokens, clearError };
};

export default AuthContext;
