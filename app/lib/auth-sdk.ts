// 인증 API 함수들 - Next.js API 라우트를 통해 백엔드 호출

// API 기본 설정 (사용하지 않음 - Next.js API 라우트 사용)
// const getApiBaseUrl = (): string => {
//     return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4004';
// };

// Next.js API 라우트를 통한 요청
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(endpoint, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include', // 쿠키 포함
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
    }

    return response.json();
};

// 타입 정의
export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignUpRequest {
    email: string;
    password: string;
    username: string;
}

export interface LoginResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
}

export interface SignUpResponse {
    message: string;
}

// 인증 API 함수들
export const authApi = {
    /**
     * 로그인
     * POST /api/auth/signin
     */
    async signIn(data: LoginRequest): Promise<LoginResponse> {
        try {
            // Next.js API 라우트를 통해 백엔드 호출
            const response = await apiRequest('/api/auth/signin', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            
            // 토큰을 localStorage에 저장 (백엔드에서 쿠키로도 설정됨)
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', response.accessToken);
                localStorage.setItem('refresh_token', response.refreshToken);
            }
            
            return response;
        } catch (error) {
            console.error('로그인 오류:', error);
            throw error;
        }
    },

    /**
     * 회원가입
     * POST /api/auth/signup
     */
    async signUp(data: SignUpRequest): Promise<SignUpResponse> {
        try {
            // Next.js API 라우트를 통해 백엔드 호출
            const response = await apiRequest('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            
            return response;
        } catch (error) {
            console.error('회원가입 오류:', error);
            throw error;
        }
    },

    /**
     * 로그아웃
     * POST /api/auth/signout
     */
    async signOut(): Promise<{ message: string }> {
        try {
            // Next.js API 라우트를 통해 백엔드 호출
            const response = await apiRequest('/api/auth/signout', {
                method: 'POST',
            });
            
            // localStorage에서 토큰 제거
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
            }
            
            return response;
        } catch (error) {
            console.error('로그아웃 오류:', error);
            // 에러가 발생해도 토큰은 제거
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
            }
            throw error;
        }
    },

    /**
     * 토큰 갱신
     * POST /api/auth/refresh
     */
    async refreshToken(): Promise<LoginResponse> {
        try {
            // Next.js API 라우트를 통해 백엔드 호출
            const response = await apiRequest('/api/auth/refresh', {
                method: 'POST',
            });
            
            // 새로운 토큰을 localStorage에 저장
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', response.accessToken);
                localStorage.setItem('refresh_token', response.refreshToken);
            }
            
            return response;
        } catch (error) {
            console.error('토큰 갱신 오류:', error);
            // 토큰 갱신 실패 시 로그아웃 처리
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
            }
            throw error;
        }
    },

    /**
     * 현재 저장된 토큰 가져오기
     */
    getStoredToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_token');
    },

    /**
     * 현재 저장된 리프레시 토큰 가져오기
     */
    getStoredRefreshToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('refresh_token');
    },

    /**
     * 로그인 상태 확인
     */
    isAuthenticated(): boolean {
        return this.getStoredToken() !== null;
    },

    /**
     * 토큰 만료 시간 확인
     */
    isTokenExpired(): boolean {
        const token = this.getStoredToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1] || ''));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch {
            return true;
        }
    },
};

export default authApi;
