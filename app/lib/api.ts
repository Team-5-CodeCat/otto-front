// API 유틸리티 함수들

// GitHub 레포지토리 타입
export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    html_url: string;
    default_branch: string;
}

// GitHub 브랜치 타입
export interface GitHubBranch {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
    protected: boolean;
}

// API 응답 타입들
export interface InstallUrlResponse {
    installUrl: string;
    callbackUrl: string;
}

export interface RegisterAppResponse {
    success: boolean;
    repositories: GitHubRepo[];
}

export interface RegisterBranchResponse {
    success: boolean;
    message: string;
}

// 백엔드 API 기본 URL
const getApiBaseUrl = (): string => {
    // Docker 환경에서는 Docker 네트워크 IP 사용
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://172.18.0.4:4001';
};

// GitHub 앱 이름
const getGitHubAppName = (): string => {
    return process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'otto-test-1';
};

// 인증 토큰 가져오기
const getAuthToken = (): string => {
    return localStorage.getItem('auth_token') || '';
};

// 기본 API 요청 헤더
const getDefaultHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

// GitHub 앱 설치 URL 조회
export const getGitHubInstallUrl = async (): Promise<InstallUrlResponse> => {
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/integrations/github/install/url`, {
            headers: getDefaultHeaders(),
        });

        if (!response.ok) {
            throw new Error(`백엔드 API 오류: ${response.status} ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        // 백엔드 API가 사용 불가능한 경우 직접 GitHub 앱 설치 URL 생성
        console.warn('백엔드 API 사용 불가, 직접 GitHub 앱 설치 URL 생성:', error);
        return {
            installUrl: `https://github.com/apps/${getGitHubAppName()}/installations/new`,
            callbackUrl: `${getApiBaseUrl()}/api/integrations/github/install/callback`
        };
    }
};

// GitHub 앱 등록
export const registerGitHubApp = async (
    installationId: string,
    accessToken: string = ''
): Promise<RegisterAppResponse> => {
    const response = await fetch(`${getApiBaseUrl()}/api/integrations/github/register`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
            installationId,
            accessToken,
        }),
    });

    if (!response.ok) {
        throw new Error('GitHub 앱 등록에 실패했습니다.');
    }

    return response.json();
};

// 브랜치 목록 조회
export const getGitHubBranches = async (repoFullName: string): Promise<GitHubBranch[]> => {
    const response = await fetch(
        `${getApiBaseUrl()}/api/integrations/github/branches?repo=${encodeURIComponent(repoFullName)}`,
        {
            headers: getDefaultHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error('브랜치 목록을 가져오는데 실패했습니다.');
    }

    return response.json();
};

// 브랜치 등록
export const registerGitHubBranch = async (
    repoFullName: string,
    branchName: string
): Promise<RegisterBranchResponse> => {
    const response = await fetch(`${getApiBaseUrl()}/api/integrations/github/branches`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
            repo: repoFullName,
            branch: branchName,
        }),
    });

    if (!response.ok) {
        throw new Error('브랜치 등록에 실패했습니다.');
    }

    return response.json();
};

// API 에러 처리 유틸리티
export const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return '알 수 없는 오류가 발생했습니다.';
};
