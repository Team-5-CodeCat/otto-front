// 프로젝트 관리 API 함수들
// @Team-5-CodeCat/otto-sdk 패턴을 따라 구현

// import { IConnection } from '@Team-5-CodeCat/otto-sdk/lib/IConnection';

// API 기본 설정
const getApiBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4004';
};

// 연결 설정 생성 (사용하지 않음)
// const createConnection = (): IConnection => ({
//     host: getApiBaseUrl(),
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// 인증 헤더가 포함된 연결 설정 생성
const createAuthConnection = (token: string) => ({
    host: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    } as HeadersInit,
});

// JWT 토큰 가져오기 (SDK 사용)
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
};

// 타입 정의
export interface Project {
    projectID: string;
    name: string;
    webhookUrl?: string;
    userID: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        userID: string;
        email: string;
        name: string;
    };
    repositories?: Repository[];
}

export interface Repository {
    id: string;
    repoFullName: string;
    selectedBranch: string;
    isActive: boolean;
}

export interface CreateProjectRequest {
    name: string;
    webhookUrl?: string | undefined;
}

export interface GitHubInstallation {
    id: string;
    userID: string;
    installationId: string;
    accountLogin: string;
    accountId: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        userID: string;
        email: string;
        name: string;
    };
}

export interface GitHubRepository {
    id: number;
    name: string;
    fullName: string;
    description?: string;
    private: boolean;
    defaultBranch: string;
    language?: string;
    stargazersCount: number;
    forksCount: number;
    updatedAt: string;
    installationId?: string; // 추가된 필드
}

export interface Branch {
    name: string;
    protected: boolean;
    commit: {
        sha: string;
        url: string;
    };
}

export interface ConnectRepositoryRequest {
    repoFullName: string;
    selectedBranch: string;
    installationId?: string | undefined;
}

export interface UpdateBranchRequest {
    branchName: string;
}

// 프로젝트 API 함수들
export const projectApi = {
    /**
     * 1. 프로젝트 생성
     * POST /api/v1/projects
     */
    async createProject(data: CreateProjectRequest): Promise<Project> {
        const token = getAuthToken();
        if (!token) throw new Error('인증이 필요합니다.');
        
        const connection = createAuthConnection(token);
        const response = await fetch(`${connection.host}/api/v1/projects`, {
            method: 'POST',
            headers: connection.headers,
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `프로젝트 생성 실패: ${response.status}`);
        }
        
        return response.json();
    },

    /**
     * 2. GitHub 설치 등록
     * POST /api/v1/projects/github-installations
     */
    async registerGitHubInstallation(installationId: string): Promise<GitHubInstallation> {
        const token = getAuthToken();
        if (!token) throw new Error('인증이 필요합니다.');
        
        const connection = createAuthConnection(token);
        const response = await fetch(`${connection.host}/api/v1/projects/github-installations`, {
            method: 'POST',
            headers: connection.headers,
            body: JSON.stringify({ installationId }),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `GitHub 설치 등록 실패: ${response.status}`);
        }
        
        return response.json();
    },

    /**
     * 3. GitHub 설치 목록 조회
     * GET /api/v1/projects/github-installations
     */
    async getGitHubInstallations(): Promise<GitHubInstallation[]> {
        const token = getAuthToken();
        if (!token) throw new Error('인증이 필요합니다.');
        
        const connection = createAuthConnection(token);
        const response = await fetch(`${connection.host}/api/v1/projects/github-installations`, {
            method: 'GET',
            headers: connection.headers,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `GitHub 설치 목록 조회 실패: ${response.status}`);
        }
        
        return response.json();
    },

    /**
     * 4. 접근 가능한 레포지토리 목록 조회
     * GET /api/v1/projects/github-installations/:installationId/repositories
     */
    async getRepositories(installationId: string): Promise<GitHubRepository[]> {
        const token = getAuthToken();
        if (!token) throw new Error('인증이 필요합니다.');
        
        const connection = createAuthConnection(token);
        const response = await fetch(`${connection.host}/api/v1/projects/github-installations/${installationId}/repositories`, {
            method: 'GET',
            headers: connection.headers,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `레포지토리 목록 조회 실패: ${response.status}`);
        }
        
        return response.json();
    },

    /**
     * 5. 프로젝트에 레포지토리 연결
     * POST /api/v1/projects/:projectId/repositories
     */
    async connectRepository(projectId: string, data: ConnectRepositoryRequest): Promise<Repository> {
        const token = getAuthToken();
        if (!token) throw new Error('인증이 필요합니다.');
        
        const connection = createAuthConnection(token);
        const response = await fetch(`${connection.host}/api/v1/projects/${projectId}/repositories`, {
            method: 'POST',
            headers: connection.headers,
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `레포지토리 연결 실패: ${response.status}`);
        }
        
        return response.json();
    },

    /**
     * 6. 레포지토리 브랜치 목록 조회
     * GET /api/v1/projects/:projectId/repositories/:repositoryId/branches
     */
    async getBranches(projectId: string, repositoryId: string): Promise<Branch[]> {
        const token = getAuthToken();
        if (!token) throw new Error('인증이 필요합니다.');
        
        const connection = createAuthConnection(token);
        const response = await fetch(`${connection.host}/api/v1/projects/${projectId}/repositories/${repositoryId}/branches`, {
            method: 'GET',
            headers: connection.headers,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `브랜치 목록 조회 실패: ${response.status}`);
        }
        
        return response.json();
    },

    /**
     * 7. 선택된 브랜치 변경
     * PATCH /api/v1/projects/:projectId/repositories/:repositoryId/branch
     */
    async updateBranch(projectId: string, repositoryId: string, data: UpdateBranchRequest): Promise<Repository> {
        const token = getAuthToken();
        if (!token) throw new Error('인증이 필요합니다.');
        
        const connection = createAuthConnection(token);
        const response = await fetch(`${connection.host}/api/v1/projects/${projectId}/repositories/${repositoryId}/branch`, {
            method: 'PATCH',
            headers: connection.headers,
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `브랜치 변경 실패: ${response.status}`);
        }
        
        return response.json();
    },

    /**
     * 8. 프로젝트 상세 정보 조회
     * GET /api/v1/projects/:projectId
     */
    async getProject(projectId: string): Promise<Project> {
        const token = getAuthToken();
        if (!token) throw new Error('인증이 필요합니다.');
        
        const connection = createAuthConnection(token);
        const response = await fetch(`${connection.host}/api/v1/projects/${projectId}`, {
            method: 'GET',
            headers: connection.headers,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `프로젝트 조회 실패: ${response.status}`);
        }
        
        return response.json();
    },

    /**
     * 9. 사용자 프로젝트 목록 조회
     * GET /api/v1/projects
     */
    async getProjects(): Promise<Project[]> {
        const token = getAuthToken();
        if (!token) throw new Error('인증이 필요합니다.');
        
        const connection = createAuthConnection(token);
        const response = await fetch(`${connection.host}/api/v1/projects`, {
            method: 'GET',
            headers: connection.headers,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `프로젝트 목록 조회 실패: ${response.status}`);
        }
        
        return response.json();
    },
};

export default projectApi;
