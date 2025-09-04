// 백엔드 API와 연동하는 인증 관련 API 함수들

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// API 응답 타입 정의
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// 로그인 요청 타입
export interface LoginRequest {
    email: string;
    password: string;
}

// 로그인 응답 타입 (백엔드 LoginResponseDto와 일치)
export interface LoginResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
}

// 회원가입 요청 타입 (백엔드 API 문서에 맞춤)
export interface SignupRequest {
    email: string;
    password: string;
    username: string;
}

// 회원가입 응답 타입 (백엔드 API 문서에 맞춤)
export interface SignupResponse {
    message: string;
}

// 사용자 정보 타입
export interface User {
    userID: string;
    email: string;
    name: string;
    memberRole: 'ADMIN' | 'MEMBER' | 'VIEWER';
    createdAt: string;
    updatedAt: string;
}

// API 에러 타입
export interface ApiErrorInterface {
    message: string;
    status: number | undefined;
}

// HTTP 클라이언트 클래스
class HttpClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // 쿠키 포함
            ...options,
        };

        try {
            const response = await fetch(url, defaultOptions);

            // 응답이 JSON인지 확인
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');

            let data: unknown;
            if (isJson) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = (data as { message?: string })?.message ||
                    (typeof data === 'string' ? data : '') ||
                    `HTTP ${response.status}: ${response.statusText}`;
                throw new ApiError(errorMessage, response.status);
            }

            return data as T;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(
                error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.'
            );
        }
    }

    async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : null,
        });
    }

    async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : null,
        });
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

// HTTP 클라이언트 인스턴스
const httpClient = new HttpClient(API_BASE_URL);

// 인증 API 함수들
export const authApi = {
    // 로그인
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        return httpClient.post<LoginResponse>('/api/auth/sign_in', credentials);
    },

    // 리프레시 토큰으로 로그인
    async refreshToken(): Promise<LoginResponse> {
        return httpClient.post<LoginResponse>('/api/auth/sign_in/refresh');
    },

    // 회원가입
    async signup(userData: SignupRequest): Promise<SignupResponse> {
        return httpClient.post<SignupResponse>('/api/auth/sign_up', userData);
    },

    // 로그아웃 (백엔드에 로그아웃 API가 없다면 클라이언트에서 처리)
    async logout(): Promise<void> {
        // TODO: 백엔드에 로그아웃 API가 구현되면 실제 엔드포인트로 변경
        // 현재는 클라이언트에서 쿠키를 삭제하는 방식으로 처리
        return Promise.resolve();
    },

    // 사용자 정보 조회 (백엔드에 사용자 정보 API가 없다면 임시로 구현)
    async getCurrentUser(): Promise<User> {
        // TODO: 백엔드에 사용자 정보 API가 구현되면 실제 엔드포인트로 변경
        throw new ApiError('사용자 정보 API가 아직 구현되지 않았습니다. 백엔드 개발팀에 문의하세요.');
    },
};

// 쿠키 관리 유틸리티
export const cookieUtils = {
    // 쿠키에서 토큰 가져오기
    getCookie(name: string): string | null {
        if (typeof document === 'undefined') return null;

        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
        }
        return null;
    },

    // 쿠키 설정하기
    setCookie(name: string, value: string, options: {
        expires?: Date;
        maxAge?: number;
        path?: string;
        domain?: string;
        secure?: boolean;
        httpOnly?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
    } = {}): void {
        if (typeof document === 'undefined') return;

        let cookieString = `${name}=${value}`;

        if (options.expires) {
            cookieString += `; expires=${options.expires.toUTCString()}`;
        }
        if (options.maxAge) {
            cookieString += `; max-age=${options.maxAge}`;
        }
        if (options.path) {
            cookieString += `; path=${options.path}`;
        }
        if (options.domain) {
            cookieString += `; domain=${options.domain}`;
        }
        if (options.secure) {
            cookieString += `; secure`;
        }
        if (options.httpOnly) {
            cookieString += `; httpOnly`;
        }
        if (options.sameSite) {
            cookieString += `; samesite=${options.sameSite}`;
        }

        document.cookie = cookieString;
    },

    // 쿠키 삭제하기
    deleteCookie(name: string, path: string = '/'): void {
        if (typeof document === 'undefined') return;

        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    },

    // 액세스 토큰 가져오기
    getAccessToken(): string | null {
        return this.getCookie('access_token');
    },

    // 리프레시 토큰 가져오기
    getRefreshToken(): string | null {
        return this.getCookie('refresh_token');
    },

    // 토큰 삭제하기
    clearTokens(): void {
        this.deleteCookie('access_token');
        this.deleteCookie('refresh_token');
    },
};

// API 에러 클래스
export class ApiError extends Error implements ApiErrorInterface {
    public status: number | undefined;

    constructor(message: string, status?: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export default authApi;
