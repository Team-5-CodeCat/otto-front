import { useCallback, useState, useEffect } from 'react';
import { authApi, LoginRequest, SignUpRequest } from '../lib/auth-sdk';
import { getUserFromToken } from '../lib/jwt-utils';

// 로그인 폼 데이터 타입 (SDK와 호환)
export type SignInFormData = LoginRequest;

// 회원가입 폼 데이터 타입 (SDK와 호환)
export type SignUpFormData = SignUpRequest;

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
        // SDK를 사용한 인증 상태 확인
        if (authApi.isAuthenticated() && !authApi.isTokenExpired()) {
          const token = authApi.getStoredToken();
          if (token) {
            const userInfo = getUserFromToken(token);
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
        }

        // 토큰이 만료되었지만 refresh token이 있는 경우에만 갱신 시도
        const refreshToken = authApi.getStoredRefreshToken();
        if (refreshToken) {
          try {
            console.log('토큰 갱신 시도 중...');
            await authApi.refreshToken();
            const token = authApi.getStoredToken();
            if (token) {
              console.log('새로운 토큰으로 사용자 정보 추출 시도...');
              const userInfo = getUserFromToken(token);
              if (userInfo) {
                console.log('토큰 갱신 성공, 사용자 정보:', userInfo);
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
              } else {
                console.warn('새로운 토큰에서 사용자 정보를 추출할 수 없습니다');
              }
            } else {
              console.warn('토큰 갱신 후 새로운 토큰을 받지 못했습니다');
            }
          } catch (refreshError) {
            // 리프레시 실패 시 로그아웃 상태로 설정
            console.log('토큰 갱신 실패:', refreshError);
            // 실패한 토큰들 제거
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
            }
          }
        } else {
          console.log('Refresh Token이 없어서 토큰 갱신을 시도하지 않습니다');
        }

        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
          user: null,
        }));
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
      // SDK를 사용한 로그인
      const data = await authApi.signIn(formData);

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
      // SDK를 사용한 회원가입
      const data = await authApi.signUp(formData);

      // 회원가입 성공 후 자동 로그인
      const loginData = await authApi.signIn({
        email: formData.email,
        password: formData.password,
      });

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
  const signOut = useCallback(async () => {
    try {
      // SDK를 사용한 로그아웃 (백엔드에 로그아웃 요청)
      await authApi.signOut();
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
      // 에러가 발생해도 로컬 상태는 초기화
    }

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
      // SDK를 사용한 토큰 검증
      if (authApi.isAuthenticated() && !authApi.isTokenExpired()) {
        const token = authApi.getStoredToken();
        if (token) {
          const userInfo = getUserFromToken(token);
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
      }

      // refresh token이 있는 경우에만 갱신 시도
      const refreshToken = authApi.getStoredRefreshToken();
      if (refreshToken) {
        try {
          console.log('validateToken: 토큰 갱신 시도 중...');
          await authApi.refreshToken();
          const token = authApi.getStoredToken();
          if (token) {
            console.log('validateToken: 새로운 토큰으로 사용자 정보 추출 시도...');
            const userInfo = getUserFromToken(token);
            if (userInfo) {
              console.log('validateToken: 토큰 갱신 성공, 사용자 정보:', userInfo);
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
            } else {
              console.warn('validateToken: 새로운 토큰에서 사용자 정보를 추출할 수 없습니다');
            }
          } else {
            console.warn('validateToken: 토큰 갱신 후 새로운 토큰을 받지 못했습니다');
          }
        } catch (refreshError) {
          console.log('validateToken: 토큰 갱신 실패:', refreshError);
          // 실패한 토큰들 제거
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
          }
        }
      } else {
        console.log('validateToken: Refresh Token이 없어서 토큰 갱신을 시도하지 않습니다');
      }

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
      }));
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