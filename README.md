# Otto Frontend

Next.js 15 기반 CI/CD 파이프라인 관리 프론트엔드 애플리케이션입니다.

## 🎯 프로젝트 개요

Otto Frontend는 시각적이고 직관적인 CI/CD 파이프라인 관리를 위한 현대적인 웹 애플리케이션입니다.

### 핵심 기능
- **대시보드**: 빌드, 배포, 테스트 현황 모니터링
- **파이프라인 에디터**: ReactFlow 기반 시각적 파이프라인 구성
- **프로젝트 관리**: GitHub 레포지토리 연동 및 관리
- **인증 시스템**: JWT 기반 로그인/회원가입
- **실시간 업데이트**: 빌드 상태 및 로그 실시간 조회

## 🛠️ 기술 스택

- **Framework**: Next.js 15 with App Router + Turbopack
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS v4 + Radix UI Themes
- **State Management**: Custom stores in `lib/` directory
- **Pipeline Visualization**: ReactFlow
- **Backend Integration**: `@Team-5-CodeCat/otto-sdk`
- **Package Manager**: pnpm

## 🚀 빠른 시작

### 자동 개발환경 설정 (권장)

```bash
# 1. 개발환경 자동 설정
./setup-dev-env.sh
# 개발자 이름 입력: 한진우, 장준영, 이지윤, 고민지, 김보아, 유호준

# 2. SSH 포트 포워딩 설정 (중요!)
# ~/.ssh/config 파일에 설정 추가 (아래 참고)

# 3. 의존성 설치
pnpm install

# 4. 개발 서버 시작
pnpm dev
```

### 개발자별 포트 할당

| 개발자 | Frontend | Backend | SSH 포트 포워딩 |
|--------|----------|---------|----------------|
| 한진우 | 3000 | 4000 | LocalForward 3000, 4000 |
| 장준영 | 3001 | 4001 | LocalForward 3001, 4001 |
| 이지윤 | 3002 | 4002 | LocalForward 3002, 4002 |
| 고민지 | 3003 | 4003 | LocalForward 3003, 4003 |
| 김보아 | 3004 | 4004 | LocalForward 3004, 4004 |
| 유호준 | 3005 | 4005 | LocalForward 3005, 4005 |

## 🔧 SSH 포트 포워딩 설정

### ~/.ssh/config 설정 (필수!)

**한진우 예시**:
```bash
Host codecat-dev
  HostName ec2-43-203-239-31.ap-northeast-2.compute.amazonaws.com
  User jinwoohan
  IdentityFile ~/.ssh/jinwoohan_dev_key
  Port 22
  LocalForward 3000 localhost:3000
  LocalForward 4000 localhost:4000
```

**장준영 예시**:
```bash
Host codecat-dev
  HostName ec2-43-203-239-31.ap-northeast-2.compute.amazonaws.com  
  User jinwoohan
  IdentityFile ~/.ssh/jinwoohan_dev_key
  Port 22
  LocalForward 3001 localhost:3001
  LocalForward 4001 localhost:4001
```

**각자 자신의 포트 번호로 변경하여 설정하세요!**

### 연결 및 접속
```bash
# SSH 연결
ssh codecat-dev

# 브라우저에서 접속
http://localhost:3000  # 한진우
http://localhost:3001  # 장준영
# ... 각자 할당받은 포트
```

## 📋 주요 명령어

### 개발 워크플로우
```bash
pnpm dev                # 개발 서버 (Turbopack 사용)
pnpm build              # 프로덕션 빌드
pnpm start              # 프로덕션 서버 시작
```

### 코드 품질
```bash
npx eslint .            # ESLint 검사
npx tsc --noEmit        # TypeScript 타입 체크
npx prettier --write .  # 코드 포맷팅
```

### 패키지 관리
```bash
pnpm add package-name     # 패키지 설치
pnpm add -D package-name  # 개발 의존성 설치
pnpm update              # 패키지 업데이트
```

## 🏗️ 프로젝트 구조

### App Router 구조
```
app/
├── (auth)/             # 인증 페이지 (signin/signup)
├── (dashboard)/        # 메인 대시보드
│   ├── builds/        # 빌드 관리
│   ├── deployments/   # 배포 관리
│   ├── environments/  # 환경 설정
│   ├── pipelines/     # 파이프라인 에디터
│   ├── projects/      # 프로젝트 관리
│   ├── settings/      # 애플리케이션 설정
│   └── tests/         # 테스트 관리
├── (landing)/         # 마케팅 페이지
├── api/               # Next.js API 라우트
├── components/        # 재사용 가능한 컴포넌트
│   ├── ui/           # 기본 UI 컴포넌트
│   ├── dashboard/    # 대시보드 전용 컴포넌트
│   ├── auth/         # 인증 컴포넌트
│   └── github/       # GitHub 연동 컴포넌트
├── contexts/         # React 컨텍스트
├── hooks/           # 커스텀 훅
└── lib/             # 유틸리티 및 상태 관리
```

### 핵심 컴포넌트

**상태 관리** (`app/lib/`):
- `buildStore.ts`: 빌드 상태 관리
- `deploymentStore.ts`: 배포 상태 관리
- `projectStore.ts`: 프로젝트 상태 관리
- `testStore.ts`: 테스트 상태 관리

**API 통신**:
- `api.ts`: GitHub API 유틸리티
- `auth-api.ts`: 인증 API 
- `jwt-utils.ts`: JWT 토큰 처리
- `token-manager.ts`: 토큰 관리

## 🎨 UI/UX 특징

### 시각적 파이프라인 에디터
- **ReactFlow 기반**: 드래그 앤 드롭 파이프라인 구성
- **커스텀 노드**: 빌드, 테스트, 배포 노드 타입
- **실시간 미리보기**: 파이프라인 실행 상태 시각화
- **YAML 내보내기**: 시각적 파이프라인을 YAML로 변환

### 반응형 디자인
- **Mobile-First**: 모바일 우선 설계
- **Tailwind CSS**: 유틸리티 우선 스타일링
- **Dark Mode**: 다크 모드 준비 (향후 구현 예정)
- **Radix UI**: 접근성을 고려한 컴포넌트

### 인증 및 보안
- **JWT 토큰**: localStorage 기반 토큰 관리
- **Bearer 인증**: API 호출 시 자동 토큰 첨부
- **AuthGuard**: 라우트 보호 컴포넌트
- **토큰 갱신**: 자동 토큰 리프레시

## 🔗 백엔드 통합

### API 통신
- **Base URL**: 환경별 자동 감지
  - Client-side: `http://localhost:4000`
  - Server-side: `host.docker.internal:4000`
- **Type-safe SDK**: Nestia 자동 생성 클라이언트
- **Error Handling**: 일관된 에러 처리 패턴

### GitHub 통합
- **OAuth 앱**: GitHub 앱 설치 플로우
- **레포지토리 관리**: 브랜치 선택 및 관리
- **웹훅**: 자동 빌드 트리거
- **권한 관리**: 세밀한 권한 제어

## 🌐 환경 설정

### 자동 생성 환경변수

`.env.local` 파일 예시 (한진우):
```env
PORT=3000
BACKEND_PORT=4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GITHUB_APP_NAME=otto-test-1
NODE_ENV=development
```

### 개발자별 설정
- **PORT**: 3000-3005 (개발자별 할당)
- **BACKEND_PORT**: 4000-4005 (백엔드 API 포트)
- **API_BASE_URL**: 자동 환경 감지
- **GITHUB_APP_NAME**: GitHub 앱 이름

## 💻 개발 환경

### Hot Reload
- **Turbopack**: 빠른 개발 서버
- **자동 새로고침**: 파일 변경 시 즉시 반영
- **에러 오버레이**: 개발 중 에러 표시

### TypeScript 설정
- **Strict Mode**: 엄격한 타입 검사
- **Additional Safety**: 
  - `noUncheckedIndexedAccess`
  - `exactOptionalPropertyTypes`
  - `noImplicitOverride`

### ESLint 설정
- **Flat Config**: 최신 ESLint 설정 형식
- **Multi-format**: JS/TS/React/JSON/Markdown/CSS 지원
- **Prettier 통합**: 코드 포맷팅 자동화

## 🎯 주요 페이지

### 대시보드
- **프로젝트 개요**: 최근 빌드 상태
- **빌드 현황**: 성공/실패 통계
- **배포 상태**: 환경별 배포 현황
- **실시간 로그**: 빌드 진행 상황

### 파이프라인 에디터  
- **시각적 구성**: 드래그 앤 드롭 인터페이스
- **노드 타입**: Build, Test, Deploy, Condition
- **연결 관리**: 파이프라인 흐름 정의
- **설정 패널**: 각 노드별 상세 설정

### 프로젝트 관리
- **GitHub 연동**: 레포지토리 연결
- **브랜치 관리**: 빌드 대상 브랜치 선택
- **웹훅 설정**: 자동 트리거 구성
- **환경 변수**: 빌드 환경 설정

## 🧪 개발 가이드

### 컴포넌트 개발
```tsx
// 컴포넌트 패턴 예시
interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  ...props
}) => {
  // 구현
};
```

### 상태 관리
```tsx
// Store 패턴 예시
interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

export const useProjectStore = () => {
  // 상태 관리 로직
  // CRUD 작업
  // 에러 처리
};
```

### API 호출
```tsx
// API 통신 예시
import { api } from '@/lib/api';

const projects = await api.projects.list();
const project = await api.projects.create({
  name: 'My Project',
  repository: 'user/repo'
});
```

## 🛠️ 문제 해결

### SSH 연결 문제
```bash
# 연결 테스트
ssh -T codecat-dev

# 포트 포워딩 확인
netstat -an | grep 3000

# SSH 설정 디버그
ssh -v codecat-dev
```

### 개발 서버 문제
```bash
# 포트 충돌 해결
lsof -ti:3000 | xargs kill -9

# 캐시 정리
rm -rf .next
pnpm dev

# 의존성 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### API 연동 문제
- 백엔드 서버가 실행 중인지 확인
- 포트 번호가 올바른지 확인
- CORS 설정 확인
- JWT 토큰 만료 여부 확인

## 📱 브라우저 접속 주의사항

**⚠️ 중요**: EC2/원격 개발 시
- 터미널의 링크를 클릭하지 마세요
- URL을 복사하여 브라우저에 직접 붙여넣으세요
- 포트 포워딩이 올바르게 설정되었는지 확인하세요

## 📚 추가 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Tailwind CSS 가이드](https://tailwindcss.com/docs)
- [ReactFlow 문서](https://reactflow.dev/)
- [Radix UI 컴포넌트](https://www.radix-ui.com/themes)
- [프로젝트 CLAUDE.md](../CLAUDE.md) - AI 어시스턴트 가이드

---

**Otto Frontend는 직관적이고 효율적인 CI/CD 파이프라인 관리를 위한 현대적인 웹 애플리케이션입니다.**