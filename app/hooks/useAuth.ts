import { useCallback, useState } from 'react';
import { authSignIn } from '@Team-5-CodeCat/otto-sdk/lib/functional/sign_in';

// 인증 설정 상수
const AUTH_CONFIG = {
  host: '/',
  options: { credentials: 'include' },
} as const;

// 로그인 폼 데이터 타입
export interface SignInFormData {
  email: string;
  password: string;
}

// 로그인 응답 타입 (백엔드 연동 시 사용)
export interface SignInResponse {
  success: boolean;
  message?: string;
  token?: string;
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

// useAuth 커스텀 훅
export const useAuth = () => {
  // 인증 상태 관리
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
  });

  // 로그인 함수 (메모이즈)
  const signIn = useCallback(async (formData: SignInFormData): Promise<SignInResponse> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Otto SDK를 사용한 실제 로그인
      await authSignIn(AUTH_CONFIG, {
        email: formData.email,
        password: formData.password,
      });

      // 로그인 성공 시 사용자 정보 설정
      const user = {
        id: '1', // TODO: 백엔드에서 실제 사용자 ID 받아오기
        email: formData.email,
        name: formData.email.split('@')[0] || '사용자', // 임시 이름 생성 (fallback 추가)
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
        message: '로그인 성공',
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

  // 로그아웃 함수 (메모이즈)
  const signOut = useCallback(() => {
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('authToken');

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
    const token = localStorage.getItem('authToken');

    if (!token) {
      return false;
    }

    try {
      // TODO: 실제 백엔드에서 토큰 검증
      // const response = await fetch('/api/auth/validate', {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // const data = await response.json();

      // 임시 검증 로직
      const isValid = true; // 실제로는 백엔드에서 검증

      if (isValid) {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user: {
            id: '1',
            email: 'test@example.com',
            name: '테스트 사용자',
          },
        }));
        return true;
      } else {
        localStorage.removeItem('authToken');
        return false;
      }
    } catch {
      localStorage.removeItem('authToken');
      return false;
    }
  }, []);

  return {
    ...authState,
    signIn,
    signOut,
    validateToken,
  };
};
