// 테스트 데이터 스토어 (백엔드 연동 전 임시)
// TODO: 실제로는 Context API, React Query, 또는 Zustand 사용 권장

export interface TestResult {
    id: string;
    buildId: string; // 어떤 빌드의 테스트인지
    projectId: string;
    projectName: string;
    testSuite: string; // 테스트 스위트 이름 (예: unit, integration, e2e)
    testName: string; // 개별 테스트 이름
    status: 'running' | 'passed' | 'failed' | 'skipped'; // 테스트 상태
    duration: number; // 테스트 실행 시간 (밀리초)
    errorMessage?: string; // 실패 시 에러 메시지
    coverage?: number; // 코드 커버리지 퍼센티지
    startTime: string;
    endTime: string;
}

export interface TestSummary {
    id: string;
    buildId: string;
    projectId: string;
    projectName: string;
    branch: string;
    commit: string;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    totalDuration: number; // 전체 테스트 실행 시간 (밀리초)
    coverage: number; // 전체 코드 커버리지
    status: 'running' | 'passed' | 'failed' | 'partial'; // 전체 테스트 상태
    startTime: string;
    endTime?: string;
    suites: string[]; // 실행된 테스트 스위트 목록
}

// 로컬 스토리지 키
const TESTS_KEY = 'otto_test_results';
const TEST_SUMMARIES_KEY = 'otto_test_summaries';

// 초기 목 데이터 - 실제 테스트 시나리오 반영
const initialTestResults: TestResult[] = [
    {
        id: 'test-1',
        buildId: 'build-1',
        projectId: 'proj-1',
        projectName: 'Otto CI/CD Project',
        testSuite: 'unit',
        testName: 'AuthService.validateToken',
        status: 'passed',
        duration: 125,
        coverage: 92,
        startTime: '2024-01-20T14:32:45Z',
        endTime: '2024-01-20T14:32:46Z'
    },
    {
        id: 'test-2',
        buildId: 'build-1',
        projectId: 'proj-1',
        projectName: 'Otto CI/CD Project',
        testSuite: 'unit',
        testName: 'ProjectStore.createProject',
        status: 'passed',
        duration: 89,
        coverage: 85,
        startTime: '2024-01-20T14:32:46Z',
        endTime: '2024-01-20T14:32:46Z'
    },
    {
        id: 'test-3',
        buildId: 'build-1',
        projectId: 'proj-1',
        projectName: 'Otto CI/CD Project',
        testSuite: 'integration',
        testName: 'API.projects.CRUD',
        status: 'passed',
        duration: 1450,
        coverage: 78,
        startTime: '2024-01-20T14:32:47Z',
        endTime: '2024-01-20T14:32:48Z'
    },
    {
        id: 'test-4',
        buildId: 'build-3',
        projectId: 'proj-2',
        projectName: 'Frontend Pipeline',
        testSuite: 'unit',
        testName: 'Button.component',
        status: 'failed',
        duration: 203,
        errorMessage: 'AssertionError: Expected button text "Submit" but received "Loading..."',
        coverage: 45,
        startTime: '2024-01-19T09:16:45Z',
        endTime: '2024-01-19T09:16:45Z'
    },
    {
        id: 'test-5',
        buildId: 'build-2',
        projectId: 'proj-1',
        projectName: 'Otto CI/CD Project',
        testSuite: 'unit',
        testName: 'UserAuth.signIn',
        status: 'running',
        duration: 0,
        startTime: '2024-01-20T15:48:30Z',
        endTime: '2024-01-20T15:48:30Z'
    }
];

const initialTestSummaries: TestSummary[] = [
    {
        id: 'summary-1',
        buildId: 'build-1',
        projectId: 'proj-1',
        projectName: 'Otto CI/CD Project',
        branch: 'main',
        commit: 'a1b2c3d',
        totalTests: 15,
        passedTests: 14,
        failedTests: 0,
        skippedTests: 1,
        totalDuration: 4250,
        coverage: 87,
        status: 'passed',
        startTime: '2024-01-20T14:32:45Z',
        endTime: '2024-01-20T14:33:30Z',
        suites: ['unit', 'integration']
    },
    {
        id: 'summary-2',
        buildId: 'build-2',
        projectId: 'proj-1',
        projectName: 'Otto CI/CD Project',
        branch: 'feature/auth',
        commit: 'x9y8z7w',
        totalTests: 12,
        passedTests: 8,
        failedTests: 0,
        skippedTests: 0,
        totalDuration: 0,
        coverage: 0,
        status: 'running',
        startTime: '2024-01-20T15:48:30Z',
        suites: ['unit']
    },
    {
        id: 'summary-3',
        buildId: 'build-3',
        projectId: 'proj-2',
        projectName: 'Frontend Pipeline',
        branch: 'main',
        commit: 'f5e4d3c',
        totalTests: 8,
        passedTests: 6,
        failedTests: 2,
        skippedTests: 0,
        totalDuration: 1820,
        coverage: 72,
        status: 'failed',
        startTime: '2024-01-19T09:16:45Z',
        endTime: '2024-01-19T09:17:10Z',
        suites: ['unit', 'e2e']
    }
];

// 테스트 결과 조회 (빌드 ID 또는 프로젝트 ID로 필터링 가능)
export function getTestResults(filters?: { buildId?: string; projectId?: string }): TestResult[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(TESTS_KEY);
        let results = stored ? JSON.parse(stored) : initialTestResults;

        // 필터 적용
        if (filters?.buildId) {
            results = results.filter((test: TestResult) => test.buildId === filters.buildId);
        }
        if (filters?.projectId) {
            results = results.filter((test: TestResult) => test.projectId === filters.projectId);
        }

        // 최신순 정렬
        return results.sort((a: TestResult, b: TestResult) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
    } catch {
        return initialTestResults;
    }
}

// 테스트 요약 조회 (프로젝트별 필터링 가능)
export function getTestSummaries(projectId?: string): TestSummary[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(TEST_SUMMARIES_KEY);
        let summaries = stored ? JSON.parse(stored) : initialTestSummaries;

        // 프로젝트 ID로 필터링
        if (projectId) {
            summaries = summaries.filter((summary: TestSummary) => summary.projectId === projectId);
        }

        // 최신순 정렬
        return summaries.sort((a: TestSummary, b: TestSummary) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
    } catch {
        return initialTestSummaries;
    }
}

// 개별 테스트 결과 조회
export function getTestResult(id: string): TestResult | null {
    const results = getTestResults();
    return results.find(test => test.id === id) || null;
}

// 테스트 요약 조회
export function getTestSummary(id: string): TestSummary | null {
    const summaries = getTestSummaries();
    return summaries.find(summary => summary.id === id) || null;
}

// 빌드의 테스트 요약 조회
export function getTestSummaryByBuildId(buildId: string): TestSummary | null {
    const summaries = getTestSummaries();
    return summaries.find(summary => summary.buildId === buildId) || null;
}

// 테스트 실행 (수동 트리거)
export function runTests(data: {
    buildId: string;
    projectId: string;
    projectName: string;
    branch: string;
    commit: string;
    suites: string[];
}): TestSummary {
    const summaries = getTestSummaries();
    const newSummary: TestSummary = {
        id: `summary-${Date.now()}`,
        buildId: data.buildId,
        projectId: data.projectId,
        projectName: data.projectName,
        branch: data.branch,
        commit: data.commit,
        totalTests: 0, // 실행 시작 시점에는 0
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        totalDuration: 0,
        coverage: 0,
        status: 'running',
        startTime: new Date().toISOString(),
        suites: data.suites
    };

    const updatedSummaries = [newSummary, ...summaries];
    saveTestSummaries(updatedSummaries);
    return newSummary;
}

// 테스트 결과 업데이트 (실행 중 → 완료)
export function updateTestSummary(
    id: string,
    updates: Partial<Omit<TestSummary, 'id' | 'buildId' | 'projectId' | 'startTime'>>
): TestSummary | null {
    const summaries = getTestSummaries();
    const index = summaries.findIndex(summary => summary.id === id);

    if (index === -1) return null;

    const currentSummary = summaries[index]!; // index check already done above
    const updatedSummary = {
        ...currentSummary,
        ...updates,
        ...(updates.status !== 'running' && {
            endTime: new Date().toISOString()
        })
    } as TestSummary;

    const updatedSummaries = [...summaries];
    updatedSummaries[index] = updatedSummary;
    saveTestSummaries(updatedSummaries);
    return updatedSummary;
}

// 로컬 스토리지 저장 함수들
function saveTestResults(results: TestResult[]): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(TESTS_KEY, JSON.stringify(results));
    } catch (error) {
        console.error('Failed to save test results:', error);
    }
}

function saveTestSummaries(summaries: TestSummary[]): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(TEST_SUMMARIES_KEY, JSON.stringify(summaries));
    } catch (error) {
        console.error('Failed to save test summaries:', error);
    }
}

// 초기 데이터 설정 (첫 접속 시)
export function initializeTests(): void {
    if (typeof window === 'undefined') return;

    const existingResults = localStorage.getItem(TESTS_KEY);
    const existingSummaries = localStorage.getItem(TEST_SUMMARIES_KEY);

    if (!existingResults) {
        saveTestResults(initialTestResults);
    }

    if (!existingSummaries) {
        saveTestSummaries(initialTestSummaries);
    }
}
