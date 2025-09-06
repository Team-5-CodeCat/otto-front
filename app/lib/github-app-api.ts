// GitHub 앱 관련 API 함수들
// @Team-5-CodeCat/otto-sdk 패턴을 따라 구현

import { IConnection } from '@Team-5-CodeCat/otto-sdk/lib/IConnection';

// API 기본 설정
const getApiBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4004';
};

// 연결 설정 생성
const createConnection = (): IConnection => ({
    host: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// 인증 헤더가 포함된 연결 설정 생성
const createAuthConnection = (token: string): IConnection => ({
    host: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    },
});

// JWT 토큰 가져오기
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
};

// 타입 정의
export interface GitHubInstallUrlResponse {
    url: string;
}

export interface GitHubInstallCallbackResponse {
    message: string;
    installationId: string;
    nextStep: string;
}

// GitHub 앱 API 함수들
export const githubAppApi = {
    /**
     * GitHub 앱 설치 URL 조회
     * GET /api/integrations/github/install/url
     */
    async getInstallUrl(): Promise<GitHubInstallUrlResponse> {
        const connection = createConnection();
        const response = await fetch(`${connection.host}/api/integrations/github/install/url`, {
            method: 'GET',
            headers: connection.headers,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `GitHub 설치 URL 조회 실패: ${response.status}`);
        }
        
        return response.json();
    },

    /**
     * GitHub 앱 설치 콜백 처리
     * GET /api/integrations/github/install/callback
     */
    async handleInstallCallback(installationId: string, setupAction: string = 'install'): Promise<GitHubInstallCallbackResponse> {
        const connection = createConnection();
        const response = await fetch(`${connection.host}/api/integrations/github/install/callback?installation_id=${installationId}&setup_action=${setupAction}`, {
            method: 'GET',
            headers: connection.headers,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `GitHub 설치 콜백 처리 실패: ${response.status}`);
        }
        
        return response.json();
    },
};

export default githubAppApi;
