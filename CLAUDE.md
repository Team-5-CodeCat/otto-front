# CLAUDE.md

이 파일은 이 저장소에서 코드 작업을 할 때 Claude Code (claude.ai/code)에게 가이드를 제공합니다.

## 명령어

### 개발
```bash
# 환경 변수와 함께 개발 서버 시작
pnpm dev

# 애플리케이션 빌드
pnpm build

# 프로덕션 서버 시작
pnpm start

# 의존성 설치 (@Team-5-CodeCat/otto-sdk를 위해 GitHub Package 인증 필요)
pnpm install
```

### 코드 품질
```bash
# ESLint 실행
npx eslint .

# 타입 체크
npx tsc --noEmit
```

## 아키텍처 개요

### 기술 스택
- **프레임워크**: Next.js 15.5.2 with Turbopack
- **UI**: React 19.1.0, Tailwind CSS v4, Radix UI Themes
- **상태 관리**: Zustand 스토어 (buildStore, deploymentStore, healthStore, uiStore)
- **API 클라이언트**: @Team-5-CodeCat/otto-sdk with @nestia/fetcher
- **타입 안전성**: strict 모드의 TypeScript, 런타임 검증을 위한 Typia
- **패키지 매니저**: pnpm 9.15.9

### 프로젝트 구조
- **app/**: Next.js App Router 구조
  - **(auth)/**: 인증 페이지 (signin, signup)
  - **(dashboard)/**: 대시보드 페이지 (projects, pipelines, builds)
  - **(landing)/**: 랜딩 페이지
  - **components/**: 재사용 가능한 UI 컴포넌트
  - **contexts/**: React 컨텍스트 (AuthContext)
  - **hooks/**: 커스텀 React 훅 (useAuth)
  - **lib/**: Zustand 스토어와 유틸리티
  - **styles/**: 전역 CSS

### 주요 패턴

#### API 통합
- `app/lib/make-fetch.ts`에서 SDK 연결 설정
- 베이스 URL: `process.env.NEXT_PUBLIC_API_BASE_URL` (기본값: localhost:4000)
- `next.config.ts`의 Next.js rewrites를 통한 API 라우트 프록시
- 모든 API 호출은 쿠키 기반 인증을 위해 credentials: 'include' 사용

#### 인증 플로우
- `useAuth` 훅을 사용하여 `AuthContext`에 중앙화
- SDK 메서드: `authSignIn`, `authSignUp`, `userMyInfo`
- 토큰 검증 및 갱신 기능
- 이전 인증 패턴을 위한 레거시 호환성 레이어

#### 상태 관리
- 도메인별 Zustand 스토어:
  - `buildStore`: 빌드 파이프라인 상태
  - `deploymentStore`: 배포 관리
  - `healthStore`: 헬스 체크 상태
  - `uiStore`: UI 상태 관리

### 환경 설정
- `.env.dev.local`: 로컬 개발 환경
- `.env.production`: 프로덕션 환경 (CI에서 생성)
- 필수 변수: `NEXT_PUBLIC_API_BASE_URL`

### TypeScript 설정
- 추가 체크와 함께 strict 모드 활성화
- 경로 별칭 설정 (@/*, @/components/* 등)
- Target: ES2022
- Module resolution: bundler

### CI/CD 파이프라인
- dev 브랜치에서 GitHub Actions 워크플로우
- 단계: 설치 → 린트 → 타입 체크 → 빌드
- GitHub Packages 접근을 위해 `OTTO_SDK_PACKAGE_TOKEN` 필요
- 배포를 위한 빌드 아티팩트 업로드