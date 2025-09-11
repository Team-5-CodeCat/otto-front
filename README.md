# Otto 프론트엔드

Otto CI/CD 파이프라인 자동화 플랫폼의 프론트엔드 애플리케이션입니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- pnpm 9.15.9 이상
- GitHub Package Registry 접근 권한 (@Team-5-CodeCat/otto-sdk 설치용)

### 환경 설정

1. 저장소 클론
```bash
git clone https://github.com/Team-5-CodeCat/otto-front.git
cd otto-front
```

2. 환경 변수 설정
```bash
# .env.dev.local 파일 생성
cp .env.example .env.dev.local
```

`.env.dev.local` 파일에 다음 변수 설정:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

3. GitHub Package Registry 인증 설정
```bash
# GitHub Personal Access Token이 필요합니다
echo "@Team-5-CodeCat:registry=https://npm.pkg.github.com" > ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

4. 의존성 설치
```bash
pnpm install
```

5. 개발 서버 실행
```bash
pnpm dev
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 📦 사용 가능한 스크립트

```bash
# 개발 서버 실행 (Turbopack 사용)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 코드 린팅
npx eslint .

# 타입 체크
npx tsc --noEmit
```

## 🏗️ 프로젝트 구조

```
otto-front/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (dashboard)/       # 대시보드 페이지
│   ├── (landing)/         # 랜딩 페이지
│   ├── components/        # React 컴포넌트
│   ├── contexts/          # React 컨텍스트
│   ├── hooks/             # 커스텀 훅
│   ├── lib/               # 유틸리티 및 스토어
│   └── styles/            # 전역 스타일
├── public/                # 정적 자산
├── tools/                 # 도구 및 유틸리티
└── types/                 # TypeScript 타입 정의
```

## 🛠️ 기술 스택

- **프레임워크**: [Next.js 15](https://nextjs.org/) with App Router
- **언어**: [TypeScript](https://www.typescriptlang.org/)
- **스타일링**: [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **상태 관리**: [Zustand](https://github.com/pmndrs/zustand)
- **API 클라이언트**: @Team-5-CodeCat/otto-sdk
- **패키지 매니저**: [pnpm](https://pnpm.io/)
- **빌드 도구**: Turbopack

## 🔧 주요 기능

### 인증 시스템
- JWT 기반 인증
- 로그인/회원가입 플로우
- 토큰 자동 갱신
- 보호된 라우트 관리

### 대시보드
- 프로젝트 관리
- CI/CD 파이프라인 에디터 (ReactFlow)
- 빌드 및 배포 모니터링
- 환경 변수 관리
- GitHub 저장소 통합

### 파이프라인 에디터
- 시각적 파이프라인 구성
- 드래그 앤 드롭 인터페이스
- 실시간 파이프라인 검증
- YAML 설정 생성

## 🔐 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | 백엔드 API URL | `http://localhost:4000` |
| `PORT` | 프론트엔드 포트 | `3000` |
| `BACKEND_PORT` | 백엔드 포트 | `4000` |

## 🧪 테스트

```bash
# 테스트 실행 (준비 중)
pnpm test

# 테스트 커버리지 (준비 중)
pnpm test:coverage
```

## 📝 코드 스타일

프로젝트는 ESLint와 Prettier를 사용하여 일관된 코드 스타일을 유지합니다.

```bash
# 린트 검사
npx eslint .

# 타입 체크
npx tsc --noEmit
```

## 🚢 배포

### 프로덕션 빌드

```bash
# 프로덕션용 빌드
pnpm build

# 빌드된 애플리케이션 실행
pnpm start
```

### Docker 지원

Docker 컨테이너에서 실행 시, 백엔드 API 연결을 위해 `host.docker.internal`을 사용합니다.

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 커밋 메시지 규칙

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 변경
- `style:` 코드 스타일 변경
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가/수정
- `chore:` 빌드 프로세스 또는 보조 도구 변경

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다.

## 👥 팀

Team-5-CodeCat

## 📞 문의

프로젝트 관련 문의사항은 GitHub Issues를 통해 제출해주세요.

---

© 2024 Team-5-CodeCat. All rights reserved.