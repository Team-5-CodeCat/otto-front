import { useCallback, useState, useEffect } from 'react';
import { tokenManager } from '../lib/token-manager';
import { getUserFromToken, isTokenExpired } from '../lib/jwt-utils';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// 로그인 폼 데이터 타입
export interface SignInFormData {
  email: string;
  password: string;
}

// 회원가입 폼 데이터 타입
export interface SignUpFormData {
  email: string;
  password: string;
  username: string;
}

// 로그인 응답 타입 (백엔드 API 문서에 맞춤)
export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

// 회원가입 응답 타입 (백엔드 API 문서에 맞춤)
export interface SignUpResponse {
  message: string;
}

// 로그인 응답 타입 (프론트엔드용)
export interface SignInResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

// 인증 상태 타입
export interface AuthState {
  isAuthenticated: boolean;
  user: SignInResponse['user'] | null;
  isLoading: boolean;
  error: string | null;
}

// 초기 인증 상태를 확인하는 함수
const getInitialAuthState = (): AuthState => {
  // 서버사이드와 클라이언트사이드 모두 로딩 상태로 시작하여 hydration mismatch 방지
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      user: null,
      isLoading: true,
      error: null,
    };
  }

  // 클라이언트사이드에서도 초기에는 로딩 상태로 시작
  // useEffect에서 실제 인증 상태를 확인한 후 업데이트
  return {
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  };
};

// useAuth 커스텀 훅
export const useAuth = () => {
  // 인증 상태 관리
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const tokenState = tokenManager.getTokenState();

        // 액세스 토큰이 있고 만료되지 않았는지 확인
        if (tokenState.accessToken && !isTokenExpired(tokenState.accessToken)) {
          const userInfo = getUserFromToken(tokenState.accessToken);
          if (userInfo) {
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: true,
              isLoading: false,
              user: {
                id: userInfo.userID,
                email: userInfo.email,
                name: userInfo.email.split('@')[0] || '사용자',
              },
            }));
            return;
          }
        }

        // 토큰이 만료되었거나 없으면 리프레시 시도
        const isValid = await tokenManager.refreshTokensIfNeeded();
        if (isValid) {
          const newTokenState = tokenManager.getTokenState();
          const userInfo = getUserFromToken(newTokenState.accessToken!);
          if (userInfo) {
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: true,
              isLoading: false,
              user: {
                id: userInfo.userID,
                email: userInfo.email,
                name: userInfo.email.split('@')[0] || '사용자',
              },
            }));
          }
        } else {
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            isLoading: false,
            user: null,
          }));
        }
      } catch {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
          user: null,
        }));
      }
    };

    checkAuthStatus();
  }, []);

  // 로그인 함수 (메모이즈)
  const signIn = useCallback(async (formData: SignInFormData): Promise<SignInResponse> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 백엔드 API를 사용한 실제 로그인
      const response = await fetch(`${API_BASE_URL}/api/auth/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include', // 쿠키 포함
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '로그인에 실패했습니다.');
      }

      const data: LoginResponse = await response.json();

      // 토큰 매니저에 토큰 저장
      tokenManager.updateTokens(data);

      // JWT 토큰에서 사용자 정보 추출
      const userInfo = getUserFromToken(data.accessToken);
      const user = {
        id: userInfo?.userID || '1',
        email: userInfo?.email || formData.email,
        name: userInfo?.email?.split('@')[0] || formData.email.split('@')[0] || '사용자',
      };

      // 인증 상태 업데이트
      setAuthState({
        isAuthenticated: true,
        user: user,
        isLoading: false,
        error: null,
      });

      return {
        success: true,
        message: data.message,
        user: user,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        message: errorMessage,
      };
    }
  }, []);

  // 회원가입 함수 (메모이즈)
  const signUp = useCallback(async (formData: SignUpFormData): Promise<SignInResponse> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 백엔드 API를 사용한 실제 회원가입
      const response = await fetch(`${API_BASE_URL}/api/auth/sign_up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입에 실패했습니다.');
      }

      const data: SignUpResponse = await response.json();

      // 회원가입 성공 후 자동 로그인
      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include',
      });

      if (!loginResponse.ok) {
        throw new Error('회원가입 후 자동 로그인에 실패했습니다.');
      }

      const loginData: LoginResponse = await loginResponse.json();

      // 토큰 매니저에 토큰 저장
      tokenManager.updateTokens(loginData);

      // JWT 토큰에서 사용자 정보 추출
      const userInfo = getUserFromToken(loginData.accessToken);
      const user = {
        id: userInfo?.userID || '1',
        email: userInfo?.email || formData.email,
        name: formData.username,
      };

      // 인증 상태 업데이트
      setAuthState({
        isAuthenticated: true,
        user: user,
        isLoading: false,
        error: null,
      });

      return {
        success: true,
        message: data.message,
        user: user,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.';

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        message: errorMessage,
      };
    }
  }, []);

  // 로그아웃 함수 (메모이즈)
  const signOut = useCallback(() => {
    // 토큰 매니저에서 토큰 제거
    tokenManager.clearTokens();

    // 인증 상태 초기화
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
  }, []);

  // 토큰 검증 함수 (메모이즈)
  const validateToken = useCallback(async () => {
    try {
      const tokenState = tokenManager.getTokenState();

      // 액세스 토큰이 있고 만료되지 않았는지 확인
      if (tokenState.accessToken && !isTokenExpired(tokenState.accessToken)) {
        const userInfo = getUserFromToken(tokenState.accessToken);
        if (userInfo) {
          setAuthState((prev) => ({
            ...prev,
            isAuthenticated: true,
            user: {
              id: userInfo.userID,
              email: userInfo.email,
              name: userInfo.email.split('@')[0] || '사용자',
            },
          }));
          return true;
        }
      }

      // 토큰이 만료되었거나 없으면 리프레시 시도
      const isValid = await tokenManager.refreshTokensIfNeeded();

      if (isValid) {
        const newTokenState = tokenManager.getTokenState();
        const userInfo = getUserFromToken(newTokenState.accessToken!);
        if (userInfo) {
          setAuthState((prev) => ({
            ...prev,
            isAuthenticated: true,
            user: {
              id: userInfo.userID,
              email: userInfo.email,
              name: userInfo.email.split('@')[0] || '사용자',
            },
          }));
          return true;
        }
      } else {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          user: null,
        }));
        return false;
      }

      return false;
    } catch {
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
      }));
      return false;
    }
  }, []);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    validateToken,
  };
};