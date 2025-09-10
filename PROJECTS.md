# Otto CI/CD 프로젝트 생성 페이지 개발 프롬프트

## 프로젝트 개요

App Router를 사용하여 Otto CI/CD 서비스의 프로젝트 생성 페이지를 개발해주세요.
이 페이지는 사용자가 GitHub 레포지토리와 연결된 새 프로젝트를 생성하고, **동적
라우팅으로 프로젝트 이름을 URL에 표시**할 수 있도록 하는 핵심 기능입니다.

## 핵심 기술 요구사항

**기본 기술 스택:**

- TypeScript (strict mode)
- React Query (TanStack Query) - 데이터 페칭용
- Tailwind CSS - 스타일링
- @Team-5-CodeCat/otto-sdk - 백엔드 API 연동

**아키텍처 패턴:** 하이브리드 접근 방식을 사용하여 서버 컴포넌트로 페이지 구조와
초기 데이터를 로드하고, 클라이언트 컴포넌트로 모든 사용자 상호작용을
처리해주세요.

## Otto SDK 활용 방법 (중요!)

**타입 정의 원칙:** 별도의 타입 정의 파일(types/sdk-types.ts 등)을 만들지 말고,
각 컴포넌트에서 필요할 때마다 SDK 함수의 반환 타입을 직접 추출해서 사용해주세요.

```typescript
// ✅ 올바른 방법: 각 컴포넌트에서 직접 타입 추출
type GitHubStatus = Awaited<
  ReturnType<typeof projects.github.status.getGithubInstallStatus>
>;
type Repository = Awaited<
  ReturnType<
    typeof projects.github_installations.repositories.getGithubInstallationRepositories
  >
>[0];
```

**핵심 SDK 함수들:**

1. `projects.github.status.getGithubInstallStatus()` - GitHub 앱 설치 상태 확인
2. `projects.github.install_url.getGithubInstallUrl()` - GitHub 앱 설치 URL 생성
3. `projects.github_installations.getGithubInstallations()` - 사용자의 GitHub
   설치 목록
4. `projects.github_installations.repositories.getGithubInstallationRepositories(installationId)` -
   선택된 설치의 레포지토리 목록
5. `projects.repositories.branches.projectGetRepositoryBranches(projectId, repositoryId)` -
   레포지토리의 브랜치 목록
6. `projects.projectCreateProject()` - 기본 프로젝트 생성
7. `projects.repositories.projectConnectRepository()` - 프로젝트에 레포지토리
   연결

## 인증 처리

**쿠키 기반 인증:**

```typescript
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

// 인증 토큰 갱신 (makefetch 사용)
// 실패 시 로그인 페이지로 리다이렉트
auth.sign_in.refresh.authRefresh(connection, refreshData);
```

**환경 변수:**

- `NEXT_PUBLIC_API_BASE_URL`: Otto SDK API 호스트 URL

## 사용자 플로우 설계

**1단계: 기본 정보 입력**

- 프로젝트 이름 (필수, 1자 이상)
- 개발 언어: Node.js (고정값, 선택지 없음)
- 배포 환경: EC2 (고정값, 선택지 없음)

**2단계: GitHub 상태 확인** `getGithubInstallStatus()` 호출하여 GitHub 앱 설치
여부 확인. 설치 안 되어 있으면 설치 유도 UI 표시, 설치되어 있으면 바로
레포지토리 선택 단계로 이동.

**3단계: GitHub 앱 설치 (필요시)**

- `getGithubInstallUrl()`로 설치 URL 받아오기
- **팝업 창으로 GitHub 앱 설치 페이지 열기** (새 탭이 아닌 팝업)
- 현재 페이지에서 3초마다 GitHub 상태 폴링하여 설치 완료 확인
- 설치 완료되면 팝업 자동 닫기

**4단계: 레포지토리 선택 (계층적 선택)**

- GitHub 설치 목록 조회 → 설치 선택
- 선택된 설치의 레포지토리 목록 조회 → 레포지토리 선택
- 선택된 레포지토리의 브랜치 목록 조회 → 브랜치 선택
- 상위 선택 변경 시 하위 선택들 자동 리셋

**5단계: 프로젝트 생성 및 동적 라우팅**

```typescript
// 1. 기본 프로젝트 생성
const newProject = await projects.projectCreateProject(connection, {
  name: projectName,
  webhookUrl?: string // 선택사항
});

// 2. 레포지토리 연결
await projects.repositories.projectConnectRepository(connection, newProject.id, {
  repositoryData // ConnectRepositoryRequestDto 타입
});

// 3. 동적 라우팅으로 프로젝트 상세 페이지 이동
const projectSlug = newProject.name
  .toLowerCase()
  .replace(/[^a-z0-9가-힣]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

router.push(`/projects/${newProject.id}-${projectSlug}`);
```

## 상태 관리 (useReducer)

React의 `useReducer`로 복잡한 폼 상태 관리:

```typescript
interface ProjectCreationState {
  // 기본 정보 (고정값들 포함)
  projectName: string;
  language: 'nodejs'; // 고정값
  deploymentEnv: 'ec2'; // 고정값

  // 진행 단계
  currentStep:
    | 'basic-info'
    | 'github-check'
    | 'github-install'
    | 'repository-selection'
    | 'creating';

  // GitHub 연동 데이터 (SDK에서 직접 받아온 타입 사용)
  githubStatus: Awaited<
    ReturnType<typeof projects.github.status.getGithubInstallStatus>
  > | null;
  selectedInstallation: string | null;
  selectedRepository: string | null;
  selectedBranch: string | null;

  // UI 상태
  isLoading: boolean;
  error: string | null;

  // 로드된 데이터들
  installations: any[]; // SDK 타입 직접 사용
  repositories: any[]; // SDK 타입 직접 사용
  branches: any[]; // SDK 타입 직접 사용
}

// 중요한 상태 관리 규칙:
// - 설치 변경 → 레포지토리, 브랜치 null로 리셋
// - 레포지토리 변경 → 브랜치 null로 리셋
// - 각 단계에서 명확한 에러 메시지 제공
```

## React Query 설정

**의존적 쿼리 체인:**

```typescript
// 1. GitHub 상태 확인 (항상 활성)
const githubStatusQuery = useQuery({
  queryKey: ['github-status'],
  queryFn: () => projects.github.status.getGithubInstallStatus(connection),
  refetchInterval: (data) => (data?.hasInstallation ? false : 3000), // 설치 중일 때만 폴링
});

// 2. 설치 목록 (GitHub 상태 확인 완료 후)
const installationsQuery = useQuery({
  queryKey: ['github-installations'],
  queryFn: () =>
    projects.github_installations.getGithubInstallations(connection),
  enabled: githubStatusQuery.data?.hasInstallation === true,
});

// 3. 레포지토리 목록 (설치 선택 후)
const repositoriesQuery = useQuery({
  queryKey: ['repositories', selectedInstallationId],
  queryFn: () =>
    projects.github_installations.repositories.getGithubInstallationRepositories(
      connection,
      selectedInstallationId
    ),
  enabled: !!selectedInstallationId,
});

// 4. 브랜치 목록 (레포지토리 선택 후)
const branchesQuery = useQuery({
  queryKey: ['branches', projectId, repositoryId],
  queryFn: () =>
    projects.repositories.branches.projectGetRepositoryBranches(
      connection,
      projectId,
      repositoryId
    ),
  enabled: !!(projectId && repositoryId),
});
```

**캐싱 전략:**

- GitHub 상태: 설치 중 3초마다, 완료 후 5분 캐시
- 설치 목록: 10분 캐시
- 레포지토리 목록: 5분 캐시
- 브랜치 목록: 2분 캐시

## 팝업 창 GitHub 앱 설치

```typescript
// GitHub 앱 설치를 팝업으로 처리
const handleGitHubInstall = async () => {
  try {
    const { installUrl } =
      await projects.github.install_url.getGithubInstallUrl(connection);

    // 팝업 창 열기 (새 탭 아님)
    const popup = window.open(
      installUrl,
      'github-install',
      'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
    );

    // 팝업 상태 모니터링
    const pollTimer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(pollTimer);
        // 팝업 닫힘 감지 시 GitHub 상태 재확인
        queryClient.invalidateQueries(['github-status']);
      }
    }, 1000);
  } catch (error) {
    console.error('GitHub 설치 URL 생성 실패:', error);
  }
};
```

## 동적 라우팅 처리

**프로젝트 생성 완료 후 라우팅:**

```typescript
const createProjectMutation = useMutation({
  mutationFn: async (formData) => {
    // 1. 프로젝트 생성 (Project 테이블)
    const project = await projects.projectCreateProject(connection, {
      name: formData.projectName,
      webhookUrl: null, // 선택사항, 나중에 설정
    });

    // 2. 레포지토리 연결 (ProjectRepository 테이블)
    await projects.repositories.projectConnectRepository(
      connection,
      project.projectID,
      {
        repoFullName: formData.selectedRepository.full_name, // "owner/repo-name"
        selectedBranch: formData.selectedBranch.name, // 선택한 브랜치명
        installationId: formData.selectedInstallation.installationId, // GitHub 설치 ID
        isActive: true,
      }
    );

    return project;
  },
  onSuccess: (newProject) => {
    // URL 친화적 슬러그 생성
    const slug = newProject.name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // 동적 라우팅: /projects/[projectID]-[slug] 형태로 이동
    router.push(`/projects/${newProject.projectID}-${slug}`);

    // 세션 데이터 정리
    sessionStorage.removeItem('project-creation-draft');

    // 관련 쿼리 무효화
    queryClient.invalidateQueries(['user-projects']);
  },
  onError: (error) => {
    console.error('프로젝트 생성 실패:', error);
    // 구체적인 에러 메시지 표시
  },
});
```

## 세션 복원 (GitHub 앱 설치 중단 대비)

```typescript
// 팝업으로 GitHub 이동 전 현재 상태 저장
const saveSessionBeforeGitHub = () => {
  const sessionData = {
    projectName: state.projectName,
    currentStep: state.currentStep,
    timestamp: Date.now(),
  };
  sessionStorage.setItem('project-creation-draft', JSON.stringify(sessionData));
};

// 컴포넌트 마운트 시 세션 복원
useEffect(() => {
  const savedSession = sessionStorage.getItem('project-creation-draft');
  if (savedSession) {
    const sessionData = JSON.parse(savedSession);
    // 30분 이내 데이터만 복원
    if (Date.now() - sessionData.timestamp < 30 * 60 * 1000) {
      dispatch({ type: 'RESTORE_SESSION', payload: sessionData });
    }
  }
}, []);
```

## 파일 구조

```
app/projects/create/
├── page.tsx                    # 서버 컴포넌트 (메인 페이지)
├── components/
│   ├── ProjectCreationForm.tsx # 메인 클라이언트 컴포넌트
│   ├── BasicInfoStep.tsx       # 1단계: 기본 정보 (언어/배포환경 고정)
│   ├── GitHubConnectionStep.tsx # 2-3단계: GitHub 연결 + 팝업 설치
│   ├── RepositorySelectionStep.tsx # 4단계: 계층적 선택
│   └── CreationProgressStep.tsx # 5단계: 프로젝트 생성 + 라우팅
└── hooks/
    ├── useProjectCreation.ts   # 메인 상태 관리 (useReducer)
    └── useGitHubIntegration.ts # GitHub 연동 React Query

# 동적 라우팅 페이지
app/projects/[projectSlug]/
└── page.tsx                   # 프로젝트 상세 페이지
```

## UI/UX 요구사항

**스텝 인디케이터:** 5단계 진행 상황을 명확히 표시 **로딩 상태:** 각 API
호출마다 적절한 스피너/스켈레톤 **에러 처리:** 구체적이고 실행 가능한 에러
메시지 **반응형:** 모바일에서도 팝업과 폼이 정상 작동 **접근성:** 키보드
네비게이션과 스크린 리더 지원

## 고정값 처리

```typescript
// 언어와 배포 환경은 선택지 없이 고정값으로 표시
const FIXED_LANGUAGE = 'Node.js';
const FIXED_DEPLOYMENT = 'EC2';

// UI에서는 읽기 전용으로 표시
<div className="bg-gray-50 p-3 rounded border">
  <label className="text-sm text-gray-600">개발 언어</label>
  <div className="font-medium">{FIXED_LANGUAGE}</div>
</div>
```

## 중요 구현 참고사항

1. **팝업 기반 GitHub 설치** - 새 탭이 아닌 팝업 창 사용
2. **동적 라우팅** - 프로젝트 생성 후 `/projects/[id]-[slug]` 형태로 이동
3. **SDK 타입 직접 활용** - 별도 타입 파일 생성 금지
4. **계층적 선택 리셋** - 상위 선택 변경 시 하위 자동 리셋
5. **세션 복원** - GitHub 설치 중단에 대비한 임시 저장
6. **고정값 UI** - 언어/배포환경은 선택지 없이 표시만

이 프롬프트를 바탕으로 완전히 작동하는 프로젝트 생성 페이지를 구현해주세요. 모든
단계가 매끄럽게 연결되고, 사용자가 중단 없이 프로젝트를 생성할 수 있도록 견고한
에러 처리와 상태 관리를 포함해주세요.
