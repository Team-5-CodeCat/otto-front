# Otto Frontend

Next.js 15 기반 CI/CD 파이프라인 관리 프론트엔드

## 개발 환경 설정

### 필수 요구사항

- Node.js 18+
- pnpm 9.x
- Git

### 빠른 시작

1. **의존성 설치**

```bash
pnpm install
```

2. **환경변수 설정**

```bash
cp .env.example .env.local
# .env.local 파일에서 포트 및 API URL 설정
```

3. **개발 서버 시작**

```bash
pnpm dev
```

### 개발 워크플로우

1. `pnpm install` - 의존성 설치
2. `cp .env.example .env.local` - 환경변수 설정
3. `pnpm dev` - 개발 서버 시작 (Turbopack 사용)

### 다중 개발자 환경 (6명 동시 개발)

각 개발자는 서로 다른 포트에서 독립적인 개발환경을 구성할 수 있습니다.

**개발자별 포트 할당:**

- 한진우: Frontend 3000, Backend 4000
- 장준영: Frontend 3001, Backend 4001
- 이지윤: Frontend 3002, Backend 4002
- 고민지: Frontend 3003, Backend 4003
- 김보아: Frontend 3004, Backend 4004
- 유호준: Frontend 3005, Backend 4005

### SSH 포트 포워딩 설정 (매우 중요!)

각 개발자는 **반드시** `~/.ssh/config` 파일에 자신의 포트로 LocalForward 설정을
해야 합니다.

**SSH Config 설정 예시:**

```bash
# ~/.ssh/config 파일에 추가

Host codecat-dev
  HostName ec2-43-203-239-31.ap-northeast-2.compute.amazonaws.com
  User jinwoohan
  IdentityFile ~/.ssh/jinwoohan_dev_key
  Port 22
  LocalForward 3000 localhost:3000    # 자신의 Frontend 포트로 변경 필요
  LocalForward 4000 localhost:4000    # 자신의 Backend 포트로 변경 필요
```

**⚠️ 중요**: 위 예시는 한진우 기준입니다. **각자 자신의 할당받은 포트 번호로
변경**해서 설정하세요!

**개발자별 .env.local 설정 예시 (한진우):**

```bash
PORT=3000
BACKEND_PORT=4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GITHUB_APP_NAME=otto-test-1
```

**개발자별 서버 실행:**

```bash
# 환경변수 파일 지정하여 개발 서버 시작
pnpm dev
```

### 서비스 포트

- 한진우: http://localhost:3000
- 장준영: http://localhost:3001
- 이지윤: http://localhost:3002
- 고민지: http://localhost:3003
- 김보아: http://localhost:3004
- 유호준: http://localhost:3005

> **⚠️ EC2/원격 개발 시 중요사항**: 터미널 링크를 클릭하는 대신 URL을 복사하여
> 브라우저에 직접 붙여넣어 접속하세요.

## 새로운 라이브러리 설치

```bash
# 패키지 설치
pnpm add package-name

# 개발 의존성 설치
pnpm add -D package-name
```

## 개발 도구

### 주요 명령어

```bash
# 개발 서버 시작 (Turbopack 사용)
pnpm dev

# 빌드
pnpm build

# 프로덕션 서버 시작
pnpm start

# 타입 체크
npx tsc --noEmit

# 린팅
npx eslint .

# 코드 포매팅
npx prettier --write .
```

## 코드 변경 시 반영 방법

### 1. 소스 코드 변경 (TypeScript/React 파일)

- **자동 반영**: `pnpm dev` 실행 중이면 파일 저장 시 Turbopack으로 빠른 핫
  리로드

### 2. 패키지 의존성 변경 (package.json)

```bash
pnpm install
# 개발 서버 재시작
```

### 3. 환경 설정 파일 변경 (.env.local)

```bash
# 개발 서버 재시작 필요
```

### 4. Tailwind CSS 설정 변경

```bash
# 자동 반영 (개발 서버 실행 중)
```

### 5. Next.js 설정 변경 (next.config.js)

```bash
# 개발 서버 재시작 필요
```

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript (strict mode)
- **UI**: React 19, Tailwind CSS v4, Radix UI
- **상태 관리**: React Context + Custom Stores
- **파이프라인 시각화**: ReactFlow
- **백엔드 통신**: @Team-5-CodeCat/otto-sdk
- **패키지 매니저**: pnpm
- **빌드 도구**: Turbopack
