import { useCallback, useState } from 'react';

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
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // TODO: 실제 백엔드 API 호출로 교체
            // const response = await fetch('/api/auth/signin', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(formData),
            // });
            // const data = await response.json();

            // 임시 로그인 로직 (백엔드 연동 전 테스트용)
            await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션

            // 이메일과 비밀번호 검증 (임시)
            if (formData.email === 'test@example.com' && formData.password === 'password') {
                const mockResponse: SignInResponse = {
                    success: true,
                    message: '로그인 성공',
                    token: 'mock-jwt-token',
                    user: {
                        id: '1',
                        email: formData.email,
                        name: '테스트 사용자',
                    },
                };

                // 로컬 스토리지에 토큰 저장
                localStorage.setItem('authToken', mockResponse.token!);

                // 인증 상태 업데이트
                setAuthState({
                    isAuthenticated: true,
                    user: mockResponse.user!,
                    isLoading: false,
                    error: null,
                });

                return mockResponse;
            } else {
                throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';

            setAuthState(prev => ({
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
                setAuthState(prev => ({
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
