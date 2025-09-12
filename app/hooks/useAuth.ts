'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import makeFetch from '@/app/lib/make-fetch';
import { userMyInfo } from '@cooodecat/otto-sdk/lib/functional/user';
import { authRefreshSignIn } from '@cooodecat/otto-sdk/lib/functional/auth/refresh';
import { authSignOut } from '@cooodecat/otto-sdk/lib/functional/auth/logout';
import { mapErrorToUserMessage, type ErrorInfo } from '@/app/lib/error-messages';

// 인증 상태 타입
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: userMyInfo.Output | null;
  error: string | null;
  errorInfo?: ErrorInfo | null; // 상세한 에러 정보 추가
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
      await authRefreshSignIn(makeFetch());
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

      // 먼저 쿠키/로컬 스토리지에서 토큰 존재 여부만 확인
      // 실제 토큰 갱신은 필요할 때만 수행
      try {
        // 사용자 정보 조회를 먼저 시도
        const user = await userMyInfo(makeFetch());
        
        // 성공하면 세션이 유효한 것
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: user,
          error: null,
        });
      } catch (error) {
        // 401 에러 시에만 refresh 시도
        if ((error as any)?.status === 401) {
          const isSessionValid = await checkSession();
          
          if (isSessionValid) {
            try {
              const user = await userMyInfo(makeFetch());
              setAuthState({
                isAuthenticated: true,
                isLoading: false,
                user: user,
                error: null,
              });
            } catch {
              setAuthState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: null,
              });
            }
          } else {
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
              error: null,
            });
          }
        } else {
          // 다른 에러는 미인증 상태로 처리
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: null,
          });
        }
      }
    };

    initializeAuth();
  }, [checkSession]);

  // 로그인 (현재는 GitHub OAuth만 지원)
  const signIn = useCallback(
    async (_formData: { email: string; password: string }): Promise<SignInResponse> => {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Password 로그인은 현재 지원되지 않습니다. GitHub OAuth를 사용해주세요.',
      }));

      return {
        success: false,
        message: 'Password 로그인은 현재 지원되지 않습니다. GitHub OAuth를 사용해주세요.',
      };
    },
    []
  );

  // 회원가입 (현재는 GitHub OAuth만 지원)
  const signUp = useCallback(
    async (_formData: {
      email: string;
      password: string;
      username: string;
    }): Promise<SignInResponse> => {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Password 회원가입은 현재 지원되지 않습니다. GitHub OAuth를 사용해주세요.',
      }));

      return {
        success: false,
        message: 'Password 회원가입은 현재 지원되지 않습니다. GitHub OAuth를 사용해주세요.',
      };
    },
    []
  );

  // GitHub 로그인
  const signInWithGitHub = useCallback(
    async (_tokens: {
      accessToken: string;
      refreshToken: string;
      accessTokenExpiresIn: number;
      refreshTokenExpiresIn: number;
    }): Promise<SignInResponse> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        // 토큰은 이미 백엔드에서 쿠키로 설정됨
        // 사용자 정보 조회
        const user = await userMyInfo(makeFetch());

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          error: null,
        });

        // 리다이렉트는 호출하는 쪽에서 처리하도록 변경

        return {
          success: true,
          message: 'GitHub 로그인 성공',
          user,
        };
      } catch (error: unknown) {
        const errorInfo = mapErrorToUserMessage(error);

        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorInfo.message,
          errorInfo: errorInfo,
        }));

        return {
          success: false,
          message: errorInfo.message,
        };
      }
    },
    []
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
    signInWithGitHub,
    signOut,
    validateToken,
    refreshToken,
    errorInfo: authState.errorInfo, // 에러 상세 정보 노출
  };
}
