// JWT 토큰 및 리프레시 토큰 관리 로직

import { authApi, cookieUtils, ApiError } from './auth-api';
import { isTokenExpired } from './jwt-utils';

// 토큰 상태 타입
export interface TokenState {
    accessToken: string | null;
    refreshToken: string | null;
    accessTokenExpiresAt: number | null;
    refreshTokenExpiresAt: number | null;
}

// 토큰 매니저 클래스
class TokenManager {
    private static instance: TokenManager;
    private tokenState: TokenState = {
        accessToken: null,
        refreshToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
    };

    private constructor() {
        this.initializeTokens();
    }

    // 싱글톤 인스턴스 가져오기
    public static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    // 초기 토큰 상태 설정
    private initializeTokens(): void {
        this.tokenState.accessToken = cookieUtils.getAccessToken();
        this.tokenState.refreshToken = cookieUtils.getRefreshToken();

        // 토큰 만료 시간은 쿠키에서 직접 가져올 수 없으므로
        // 토큰이 있으면 유효하다고 가정하고 리프레시 시 업데이트
        if (this.tokenState.accessToken) {
            this.tokenState.accessTokenExpiresAt = Date.now() + (15 * 60 * 1000); // 15분 후
        }
        if (this.tokenState.refreshToken) {
            this.tokenState.refreshTokenExpiresAt = Date.now() + (14 * 24 * 60 * 60 * 1000); // 14일 후
        }
    }

    // 토큰 상태 업데이트
    public updateTokens(loginResponse: {
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresIn: number;
        refreshTokenExpiresIn: number;
    }): void {
        const now = Date.now();

        this.tokenState = {
            accessToken: loginResponse.accessToken,
            refreshToken: loginResponse.refreshToken,
            accessTokenExpiresAt: now + (loginResponse.accessTokenExpiresIn * 1000),
            refreshTokenExpiresAt: now + (loginResponse.refreshTokenExpiresIn * 1000),
        };
    }

    // 토큰 상태 초기화
    public clearTokens(): void {
        this.tokenState = {
            accessToken: null,
            refreshToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
        };
        cookieUtils.clearTokens();
    }

    // 액세스 토큰 가져오기
    public getAccessToken(): string | null {
        return this.tokenState.accessToken;
    }

    // 리프레시 토큰 가져오기
    public getRefreshToken(): string | null {
        return this.tokenState.refreshToken;
    }

    // 액세스 토큰이 유효한지 확인
    public isAccessTokenValid(): boolean {
        if (!this.tokenState.accessToken) {
            return false;
        }

        // JWT 토큰 만료 확인
        return !isTokenExpired(this.tokenState.accessToken);
    }

    // 리프레시 토큰이 유효한지 확인
    public isRefreshTokenValid(): boolean {
        if (!this.tokenState.refreshToken || !this.tokenState.refreshTokenExpiresAt) {
            return false;
        }

        return this.tokenState.refreshTokenExpiresAt > Date.now();
    }

    // 토큰 자동 리프레시
    public async refreshTokensIfNeeded(): Promise<boolean> {
        // 액세스 토큰이 유효하면 리프레시 불필요
        if (this.isAccessTokenValid()) {
            return true;
        }

        // 리프레시 토큰이 유효하지 않으면 리프레시 불가능
        if (!this.isRefreshTokenValid()) {
            this.clearTokens();
            return false;
        }

        try {
            // 리프레시 토큰으로 새로운 토큰 발급
            const response = await authApi.refreshToken();
            this.updateTokens(response);
            return true;
        } catch (error) {
            console.error('토큰 리프레시 실패:', error);
            this.clearTokens();
            return false;
        }
    }

    // 인증된 요청을 위한 헤더 가져오기
    public async getAuthHeaders(): Promise<Record<string, string>> {
        const isTokenValid = await this.refreshTokensIfNeeded();

        if (!isTokenValid || !this.tokenState.accessToken) {
            throw new ApiError('인증 토큰이 유효하지 않습니다.');
        }

        return {
            'Authorization': `Bearer ${this.tokenState.accessToken}`,
        };
    }

    // 현재 토큰 상태 가져오기
    public getTokenState(): TokenState {
        return { ...this.tokenState };
    }

    // 인증 상태 확인
    public isAuthenticated(): boolean {
        return !!(this.tokenState.accessToken && this.isAccessTokenValid());
    }
}

// 토큰 매니저 인스턴스 내보내기
export const tokenManager = TokenManager.getInstance();

// 편의 함수들
export const tokenManagerUtils = {
    // 토큰 매니저를 통한 인증 헤더 가져오기
    async getAuthHeaders(): Promise<Record<string, string>> {
        return tokenManager.getAuthHeaders();
    },

    // 인증 상태 확인
    isAuthenticated(): boolean {
        return tokenManager.isAuthenticated();
    },

    // 토큰 리프레시
    async refreshTokensIfNeeded(): Promise<boolean> {
        return tokenManager.refreshTokensIfNeeded();
    },

    // 토큰 초기화
    clearTokens(): void {
        tokenManager.clearTokens();
    },

    // 토큰 상태 가져오기
    getTokenState(): TokenState {
        return tokenManager.getTokenState();
    },
};

export default tokenManager;
