// 빌드 데이터 스토어 (백엔드 연동 전 임시)
// TODO: 실제로는 Context API, React Query, 또는 Zustand 사용 권장

export interface Build {
    id: string;
    projectId: string; // 어떤 프로젝트의 빌드인지
    projectName: string; // 프로젝트 이름 (UI 표시용)
    branch: string; // 빌드 대상 브랜치
    commit: string; // 커밋 해시 (짧은 형태)
    commitMessage: string; // 커밋 메시지
    status: 'pending' | 'running' | 'success' | 'failed'; // 빌드 상태
    startTime: string; // 빌드 시작 시간
    endTime?: string | undefined; // 빌드 종료 시간 (완료/실패 시)
    duration?: number | undefined; // 빌드 소요 시간 (초)
    logs: string[]; // 빌드 로그 (실시간 스트리밍용)
    triggerType: 'push' | 'pull_request' | 'manual'; // 트리거 방식
    author: string; // 커밋 작성자
}

// 로컬 스토리지 키
const BUILDS_KEY = 'otto_builds';

// 초기 목 데이터 - 실제 빌드 시나리오 반영
const initialBuilds: Build[] = [
    {
        id: 'build-1',
        projectId: 'proj-1',
        projectName: 'Otto CI/CD Project',
        branch: 'main',
        commit: 'a1b2c3d',
        commitMessage: 'Fix: Update deployment configuration',
        status: 'success',
        startTime: '2024-01-20T14:30:00Z',
        endTime: '2024-01-20T14:35:15Z',
        duration: 315, // 5분 15초
        logs: [
            '[14:30:00] Starting build for commit a1b2c3d',
            '[14:30:05] Installing dependencies...',
            '[14:31:20] Running npm install',
            '[14:32:45] Running tests...',
            '[14:33:30] All tests passed ✓',
            '[14:34:00] Building application...',
            '[14:35:10] Build completed successfully ✓',
            '[14:35:15] Build finished'
        ],
        triggerType: 'push',
        author: 'john.doe'
    },
    {
        id: 'build-2',
        projectId: 'proj-1',
        projectName: 'Otto CI/CD Project',
        branch: 'feature/auth',
        commit: 'x9y8z7w',
        commitMessage: 'Add: User authentication system',
        status: 'running',
        startTime: '2024-01-20T15:45:00Z',
        logs: [
            '[15:45:00] Starting build for commit x9y8z7w',
            '[15:45:05] Installing dependencies...',
            '[15:46:20] Running npm install',
            '[15:47:45] Running tests...',
            '[15:48:30] Running unit tests... (in progress)'
        ],
        triggerType: 'pull_request',
        author: 'jane.smith'
    },
    {
        id: 'build-3',
        projectId: 'proj-2',
        projectName: 'Frontend Pipeline',
        branch: 'main',
        commit: 'f5e4d3c',
        commitMessage: 'Update: Improve UI components',
        status: 'failed',
        startTime: '2024-01-19T09:15:00Z',
        endTime: '2024-01-19T09:17:30Z',
        duration: 150, // 2분 30초
        logs: [
            '[09:15:00] Starting build for commit f5e4d3c',
            '[09:15:05] Installing dependencies...',
            '[09:16:20] Running npm install',
            '[09:16:45] Running tests...',
            '[09:17:10] Test failed: Component.test.tsx ✗',
            '[09:17:15] Error: Expected 3 to equal 4',
            '[09:17:30] Build failed ✗'
        ],
        triggerType: 'push',
        author: 'mike.wilson'
    }
];

// 빌드 목록 조회 (프로젝트별 필터링 가능)
export function getBuilds(projectId?: string): Build[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(BUILDS_KEY);
        const builds = stored ? JSON.parse(stored) : initialBuilds;

        // 프로젝트 ID로 필터링
        if (projectId) {
            return builds.filter((build: Build) => build.projectId === projectId);
        }

        // 최신순 정렬
        return builds.sort((a: Build, b: Build) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
    } catch {
        return initialBuilds;
    }
}

// 개별 빌드 조회
export function getBuild(id: string): Build | null {
    const builds = getBuilds();
    return builds.find(build => build.id === id) || null;
}

// 빌드 생성 (수동 트리거 시 사용)
export function createBuild(data: {
    projectId: string;
    projectName: string;
    branch: string;
    triggerType?: 'manual' | 'push' | 'pull_request';
}): Build {
    const builds = getBuilds();
    const newBuild: Build = {
        id: `build-${Date.now()}`,
        projectId: data.projectId,
        projectName: data.projectName,
        branch: data.branch,
        commit: Math.random().toString(36).substr(2, 7), // 임시 커밋 해시
        commitMessage: 'Manual build trigger',
        status: 'pending',
        startTime: new Date().toISOString(),
        logs: ['[' + new Date().toLocaleTimeString() + '] Build queued...'],
        triggerType: data.triggerType || 'manual',
        author: 'current.user' // TODO: 실제 사용자 정보로 교체
    };

    const updatedBuilds = [newBuild, ...builds]; // 최신 빌드를 맨 앞에
    saveBuilds(updatedBuilds);
    return newBuild;
}

// 빌드 상태 업데이트 (진행 중 → 완료/실패)
export function updateBuildStatus(
    id: string,
    status: Build['status'],
    logs?: string[],
    duration?: number
): Build | null {
    const builds = getBuilds();
    const index = builds.findIndex(build => build.id === id);

    if (index === -1) return null;

    const currentBuild = builds[index]!; // index check already done above
    const updatedBuild = {
        ...currentBuild,
        status,
        logs: logs ? [...currentBuild.logs, ...logs] : currentBuild.logs,
        ...(status !== 'running' && status !== 'pending' && {
            endTime: new Date().toISOString(),
            duration: duration || Math.floor((Date.now() - new Date(currentBuild.startTime).getTime()) / 1000)
        })
    } as Build;

    const updatedBuilds = [...builds];
    updatedBuilds[index] = updatedBuild;
    saveBuilds(updatedBuilds);
    return updatedBuild;
}

// 빌드 삭제 (관리용)
export function deleteBuild(id: string): boolean {
    const builds = getBuilds();
    const filteredBuilds = builds.filter(build => build.id !== id);

    if (filteredBuilds.length === builds.length) return false; // 삭제할 빌드 없음

    saveBuilds(filteredBuilds);
    return true;
}

// 로컬 스토리지에 저장
function saveBuilds(builds: Build[]): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(BUILDS_KEY, JSON.stringify(builds));
    } catch (error) {
        console.error('Failed to save builds:', error);
    }
}

// 초기 데이터 설정 (첫 접속 시)
export function initializeBuilds(): void {
    if (typeof window === 'undefined') return;

    const existing = localStorage.getItem(BUILDS_KEY);
    if (!existing) {
        saveBuilds(initialBuilds);
    }
}
