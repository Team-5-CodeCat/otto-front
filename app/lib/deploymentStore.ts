// 배포 데이터 스토어 (백엔드 연동 전 임시)
// TODO: 실제로는 Context API, React Query, 또는 Zustand 사용 권장

export interface Deployment {
    id: string;
    buildId: string; // 어떤 빌드의 배포인지
    projectId: string;
    projectName: string;
    environment: 'development' | 'staging' | 'production'; // 배포 환경
    version: string; // 배포 버전 (예: v1.2.3)
    branch: string;
    commit: string;
    commitMessage: string;
    status: 'pending' | 'deploying' | 'success' | 'failed' | 'rolled_back'; // 배포 상태
    url?: string; // 배포된 서비스 URL (성공 시)
    startTime: string;
    endTime?: string;
    duration?: number; // 배포 소요 시간 (초)
    deployType: 'manual' | 'auto' | 'rollback'; // 배포 방식
    deployedBy: string; // 배포 실행자
    logs: string[]; // 배포 로그
    healthCheck?: {
        status: 'healthy' | 'unhealthy' | 'checking';
        lastChecked: string;
        uptime: number; // 가동 시간 (초)
    };
}

export interface DeploymentEnvironment {
    name: string;
    type: 'development' | 'staging' | 'production';
    description: string;
    url?: string;
    lastDeployment?: Deployment | undefined;
    isActive: boolean;
}

// 로컬 스토리지 키
const DEPLOYMENTS_KEY = 'otto_deployments';

// 초기 목 데이터 - 실제 배포 시나리오 반영
const initialDeployments: Deployment[] = [
    {
        id: 'deploy-1',
        buildId: 'build-1',
        projectId: 'proj-1',
        projectName: 'Otto CI/CD Project',
        environment: 'production',
        version: 'v1.2.3',
        branch: 'main',
        commit: 'a1b2c3d',
        commitMessage: 'Fix: Update deployment configuration',
        status: 'success',
        url: 'https://otto-app.example.com',
        startTime: '2024-01-20T14:35:30Z',
        endTime: '2024-01-20T14:38:45Z',
        duration: 195, // 3분 15초
        deployType: 'auto',
        deployedBy: 'CI/CD Pipeline',
        logs: [
            '[14:35:30] Starting deployment to production',
            '[14:35:35] Pulling Docker image: otto-app:a1b2c3d',
            '[14:36:20] Stopping previous containers',
            '[14:36:25] Starting new containers',
            '[14:37:10] Running database migrations',
            '[14:37:45] Updating load balancer configuration',
            '[14:38:30] Health check passed ✓',
            '[14:38:45] Deployment completed successfully ✓'
        ],
        healthCheck: {
            status: 'healthy',
            lastChecked: '2024-01-20T15:30:00Z',
            uptime: 3300 // 55분
        }
    },
    {
        id: 'deploy-2',
        buildId: 'build-2',
        projectId: 'proj-1',
        projectName: 'Otto CI/CD Project',
        environment: 'staging',
        version: 'v1.3.0-beta',
        branch: 'feature/auth',
        commit: 'x9y8z7w',
        commitMessage: 'Add: User authentication system',
        status: 'deploying',
        startTime: '2024-01-20T15:50:00Z',
        deployType: 'manual',
        deployedBy: 'jane.smith',
        logs: [
            '[15:50:00] Starting deployment to staging',
            '[15:50:05] Pulling Docker image: otto-app:x9y8z7w',
            '[15:51:20] Stopping previous containers',
            '[15:51:25] Starting new containers...'
        ]
    },
    {
        id: 'deploy-3',
        buildId: 'build-3',
        projectId: 'proj-2',
        projectName: 'Frontend Pipeline',
        environment: 'staging',
        version: 'v2.1.0',
        branch: 'main',
        commit: 'f5e4d3c',
        commitMessage: 'Update: Improve UI components',
        status: 'failed',
        startTime: '2024-01-19T09:20:00Z',
        endTime: '2024-01-19T09:22:30Z',
        duration: 150,
        deployType: 'auto',
        deployedBy: 'CI/CD Pipeline',
        logs: [
            '[09:20:00] Starting deployment to staging',
            '[09:20:05] Pulling Docker image: frontend-app:f5e4d3c',
            '[09:21:20] Error: Image pull failed',
            '[09:21:25] Error: Registry authentication failed',
            '[09:22:30] Deployment failed ✗'
        ]
    }
];

// 배포 목록 조회 (프로젝트별, 환경별 필터링 가능)
export function getDeployments(filters?: {
    projectId?: string;
    environment?: string;
}): Deployment[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(DEPLOYMENTS_KEY);
        let deployments = stored ? JSON.parse(stored) : initialDeployments;

        // 필터 적용
        if (filters?.projectId) {
            deployments = deployments.filter((deploy: Deployment) =>
                deploy.projectId === filters.projectId
            );
        }
        if (filters?.environment) {
            deployments = deployments.filter((deploy: Deployment) =>
                deploy.environment === filters.environment
            );
        }

        // 최신순 정렬
        return deployments.sort((a: Deployment, b: Deployment) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
    } catch {
        return initialDeployments;
    }
}

// 개별 배포 조회
export function getDeployment(id: string): Deployment | null {
    const deployments = getDeployments();
    return deployments.find(deploy => deploy.id === id) || null;
}

// 프로젝트별 환경 상태 조회
export function getEnvironmentStatus(projectId: string): DeploymentEnvironment[] {
    const deployments = getDeployments({ projectId });

    const environments: DeploymentEnvironment[] = [
        {
            name: 'Development',
            type: 'development',
            description: 'Development environment for testing features',
            isActive: true
        },
        {
            name: 'Staging',
            type: 'staging',
            description: 'Pre-production environment for QA testing',
            isActive: true
        },
        {
            name: 'Production',
            type: 'production',
            description: 'Live production environment',
            isActive: true
        }
    ];

    // 각 환경의 최신 배포 정보 추가
    environments.forEach(env => {
        const envDeployments = deployments.filter(d => d.environment === env.type);
        if (envDeployments.length > 0) {
            const lastDeploy = envDeployments[0]; // 이미 최신순 정렬됨
            env.lastDeployment = lastDeploy;
            if (lastDeploy && lastDeploy.status === 'success' && lastDeploy.url) {
                env.url = lastDeploy.url;
            }
        }
    });

    return environments;
}

// 새 배포 생성 (수동 배포 트리거)
export function createDeployment(data: {
    buildId: string;
    projectId: string;
    projectName: string;
    environment: Deployment['environment'];
    version: string;
    branch: string;
    commit: string;
    commitMessage: string;
    deployType?: 'manual' | 'auto' | 'rollback';
}): Deployment {
    const deployments = getDeployments();
    const newDeployment: Deployment = {
        id: `deploy-${Date.now()}`,
        buildId: data.buildId,
        projectId: data.projectId,
        projectName: data.projectName,
        environment: data.environment,
        version: data.version,
        branch: data.branch,
        commit: data.commit,
        commitMessage: data.commitMessage,
        status: 'pending',
        startTime: new Date().toISOString(),
        deployType: data.deployType || 'manual',
        deployedBy: 'current.user', // TODO: 실제 사용자 정보로 교체
        logs: [`[${new Date().toLocaleTimeString()}] Deployment queued for ${data.environment}...`]
    };

    const updatedDeployments = [newDeployment, ...deployments];
    saveDeployments(updatedDeployments);
    return newDeployment;
}

// 배포 상태 업데이트
export function updateDeploymentStatus(
    id: string,
    status: Deployment['status'],
    updates?: {
        logs?: string[];
        url?: string;
        duration?: number;
        healthCheck?: Deployment['healthCheck'];
    }
): Deployment | null {
    const deployments = getDeployments();
    const index = deployments.findIndex(deploy => deploy.id === id);

    if (index === -1) return null;

    const currentDeployment = deployments[index]!; // index check already done above
    const updatedDeployment = {
        ...currentDeployment,
        status,
        ...(updates?.logs && {
            logs: [...currentDeployment.logs, ...updates.logs]
        }),
        ...(updates?.url && { url: updates.url }),
        ...(updates?.healthCheck && { healthCheck: updates.healthCheck }),
        ...(status !== 'deploying' && status !== 'pending' && {
            endTime: new Date().toISOString(),
            duration: updates?.duration || Math.floor(
                (Date.now() - new Date(currentDeployment.startTime).getTime()) / 1000
            )
        })
    } as Deployment;

    const updatedDeployments = [...deployments];
    updatedDeployments[index] = updatedDeployment;
    saveDeployments(updatedDeployments);
    return updatedDeployment;
}

// 배포 롤백
export function rollbackDeployment(deploymentId: string): Deployment | null {
    const originalDeployment = getDeployment(deploymentId);
    if (!originalDeployment || originalDeployment.status !== 'success') {
        return null;
    }

    // 롤백을 위한 새 배포 생성
    const rollbackDeployment = createDeployment({
        buildId: originalDeployment.buildId,
        projectId: originalDeployment.projectId,
        projectName: originalDeployment.projectName,
        environment: originalDeployment.environment,
        version: `${originalDeployment.version}-rollback`,
        branch: originalDeployment.branch,
        commit: originalDeployment.commit,
        commitMessage: `Rollback to: ${originalDeployment.commitMessage}`,
        deployType: 'rollback'
    });

    return rollbackDeployment;
}

// 로컬 스토리지 저장
function saveDeployments(deployments: Deployment[]): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(DEPLOYMENTS_KEY, JSON.stringify(deployments));
    } catch (error) {
        console.error('Failed to save deployments:', error);
    }
}

// 초기 데이터 설정 (첫 접속 시)
export function initializeDeployments(): void {
    if (typeof window === 'undefined') return;

    const existing = localStorage.getItem(DEPLOYMENTS_KEY);
    if (!existing) {
        saveDeployments(initialDeployments);
    }
}
