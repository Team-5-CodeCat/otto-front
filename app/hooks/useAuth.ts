'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authSignIn } from '@Team-5-CodeCat/otto-sdk/lib/functional/auth/sign_in';
import makeFetch from '@/app/lib/make-fetch';
import { userMyInfo } from '@Team-5-CodeCat/otto-sdk/lib/functional/user';
import { authSignInByRefresh } from '@Team-5-CodeCat/otto-sdk/lib/functional/auth/sign_in/refresh';
import { authSignUp } from '@Team-5-CodeCat/otto-sdk/lib/functional/auth/sign_up';
import { authSignOut } from '@Team-5-CodeCat/otto-sdk/lib/functional/auth/sign_out';

// 인증 상태 타입
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: userMyInfo.Output | null;
  error: string | null;
}

// 로그인 응답 타입 (프론트엔드용)
export interface SignInResponse {
  success: boolean;
  message?: string;
  user?: userMyInfo.Output | null;
}

// 초기 인증 상태 - 세션 기반으로 확인
const getInitialAuthState = (): AuthState => {
  return {
    isAuthenticated: false,
    isLoading: true, // 세션 검증 중
    user: null,
    error: null,
  };
};

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);

  // 세션 검증
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      await authSignInByRefresh(makeFetch());
      return true;
    } catch (error) {
      console.error('세션 검증 실패:', error);
      return false;
    }
  }, []);

  // 인증 상태 초기화 (세션 기반)
  useEffect(() => {
    const initializeAuth = async () => {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const isSessionValid = await checkSession();

      const user = await userMyInfo(makeFetch());
      if (isSessionValid) {
        // 세션이 유효한 경우 - 실제로는 사용자 정보 API를 호출해야 함
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: user,
          error: null,
        });
      } else {
        // 세션이 유효하지 않은 경우
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null,
        });
      }
    };

    initializeAuth();
  }, [checkSession]);

  // 로그인
  const signIn = useCallback(
    async (formData: authSignIn.Body): Promise<SignInResponse> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await authSignIn(makeFetch(), {
          email: formData.email,
          password: formData.password,
        });

        // 세션 기반이므로 httpOnly 쿠키로 자동 관리됨
        // 사용자 정보는 응답에서 가져오거나 별도 API 호출
        const user = await userMyInfo(makeFetch());

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          error: null,
        });

        // 프로젝트 페이지로 리다이렉트
        router.push('/projects');

        return {
          success: true,
          message: response.message,
          user,
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : '로그인 중 알 수 없는 오류가 발생했습니다.';

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
    },
    [router]
  );

  // 회원가입
  const signUp = useCallback(
    async (formData: authSignUp.Body): Promise<SignInResponse> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await authSignUp(makeFetch(), {
          email: formData.email,
          password: formData.password,
          username: formData.username,
        });

        console.log('회원가입 성공:', response.message);
        return {
          success: true,
          message: response.message,
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : '회원가입 중 알 수 없는 오류가 발생했습니다.';

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
    },
    [signIn]
  );

  // 로그아웃 (세션 기반)
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await authSignOut(makeFetch());
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
      // API 호출 실패해도 로컬 상태는 초기화
    } finally {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });

      // 로그인 페이지로 리다이렉트
      router.push('/signin');
    }
  }, [router]);

  // 세션 검증 (토큰 검증 대신)
  const validateToken = useCallback(async (): Promise<boolean> => {
    return await checkSession();
  }, [checkSession]);

  // 세션 갱신 (토큰 갱신 대신)
  const refreshToken = useCallback(async (): Promise<boolean> => {
    return await checkSession();
  }, [checkSession]);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    validateToken,
    refreshToken,
  };
}
