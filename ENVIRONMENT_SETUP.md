# 🔧 환경변수 설정 가이드

## 📋 개요

프론트엔드에서 백엔드 API와 GitHub 앱과 연동하기 위해 필요한 환경변수들을
설정하는 방법을 안내합니다.

## 🚀 환경변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# .env.local
# 백엔드 API URL (백엔드 서버 주소)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# GitHub 앱 설정
NEXT_PUBLIC_GITHUB_APP_ID=your_github_app_id
NEXT_PUBLIC_GITHUB_APP_NAME=otto-handler

# 개발 환경 설정
NODE_ENV=development
```

## 🔑 환경변수 설명

### `NEXT_PUBLIC_API_BASE_URL`

- **설명**: 백엔드 API 서버의 기본 URL
- **기본값**: `http://localhost:4000` (백엔드 서버 주소)
- **예시**:
  - 개발환경: `http://localhost:4000`
  - 스테이징: `https://api-staging.otto.com`
  - 프로덕션: `https://api.otto.com`

### `NEXT_PUBLIC_GITHUB_APP_ID`

- **설명**: GitHub 앱의 고유 ID
- **설정 방법**: GitHub에서 앱 생성 시 발급받은 App ID
- **예시**: `123456`

### `NEXT_PUBLIC_GITHUB_APP_NAME`

- **설명**: GitHub 앱의 이름
- **설정 방법**: GitHub에서 앱 생성 시 설정한 앱 이름
- **예시**: `otto-handler`

## 🌍 환경별 설정

### 개발 환경 (Development)

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GITHUB_APP_ID=123456
NEXT_PUBLIC_GITHUB_APP_NAME=otto-handler-dev
NODE_ENV=development
```

### 스테이징 환경 (Staging)

```bash
# .env.staging
NEXT_PUBLIC_API_BASE_URL=https://api-staging.otto.com
NEXT_PUBLIC_GITHUB_APP_ID=789012
NEXT_PUBLIC_GITHUB_APP_NAME=otto-handler-staging
NODE_ENV=staging
```

### 프로덕션 환경 (Production)

```bash
# .env.production
NEXT_PUBLIC_API_BASE_URL=https://api.otto.com
NEXT_PUBLIC_GITHUB_APP_ID=345678
NEXT_PUBLIC_GITHUB_APP_NAME=otto-handler
NODE_ENV=production
```

## 🔒 보안 고려사항

### 환경변수 파일 보안

- `.env.local` 파일은 `.gitignore`에 추가하여 버전 관리에서 제외
- 민감한 정보는 환경변수로 관리
- 프로덕션에서는 서버 환경변수로 설정

### GitHub 앱 보안

- GitHub 앱의 Private Key는 백엔드에서만 관리
- 프론트엔드에서는 App ID만 사용
- Webhook Secret은 백엔드에서 관리

## 🚀 배포 환경 설정

### Vercel 배포

```bash
# Vercel CLI로 환경변수 설정
vercel env add NEXT_PUBLIC_API_BASE_URL
vercel env add NEXT_PUBLIC_GITHUB_APP_ID
vercel env add NEXT_PUBLIC_GITHUB_APP_NAME
```

### Docker 배포

```dockerfile
# Dockerfile
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ENV NEXT_PUBLIC_GITHUB_APP_ID=123456
ENV NEXT_PUBLIC_GITHUB_APP_NAME=otto-handler
```

### Kubernetes 배포

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otto-frontend
spec:
  template:
    spec:
      containers:
        - name: otto-frontend
          env:
            - name: NEXT_PUBLIC_API_BASE_URL
              value: 'https://api.otto.com'
            - name: NEXT_PUBLIC_GITHUB_APP_ID
              value: '123456'
            - name: NEXT_PUBLIC_GITHUB_APP_NAME
              value: 'otto-handler'
```

## 🔧 개발 환경 설정

### 1. 환경변수 파일 생성

```bash
# 프로젝트 루트에서 실행
cp .env.example .env.local
```

### 2. 환경변수 값 설정

```bash
# .env.local 파일 편집
nano .env.local
```

### 3. 개발 서버 재시작

```bash
# 환경변수 변경 후 서버 재시작
npm run dev
```

## 🐛 문제 해결

### 환경변수가 적용되지 않는 경우

1. **파일명 확인**: `.env.local` 파일명이 정확한지 확인
2. **서버 재시작**: 환경변수 변경 후 개발 서버 재시작
3. **변수명 확인**: `NEXT_PUBLIC_` 접두사가 있는지 확인
4. **빌드 확인**: 프로덕션 빌드 시 환경변수 포함 여부 확인

### API 연결 오류

1. **URL 확인**: `NEXT_PUBLIC_API_BASE_URL`이 올바른지 확인
2. **백엔드 서버 확인**: `http://localhost:4000`에서 백엔드 서버가 실행 중인지
   확인
3. **CORS 설정**: 백엔드에서 CORS 설정 확인
4. **네트워크 확인**: 백엔드 서버가 실행 중인지 확인

### GitHub 앱 연결 오류

1. **App ID 확인**: `NEXT_PUBLIC_GITHUB_APP_ID`가 올바른지 확인
2. **앱 이름 확인**: `NEXT_PUBLIC_GITHUB_APP_NAME`이 올바른지 확인
3. **권한 확인**: GitHub 앱의 권한 설정 확인

## 📝 체크리스트

- [ ] `.env.local` 파일 생성
- [ ] `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` 설정
- [ ] `NEXT_PUBLIC_GITHUB_APP_ID` 설정
- [ ] `NEXT_PUBLIC_GITHUB_APP_NAME` 설정
- [ ] 개발 서버 재시작
- [ ] 백엔드 서버(`http://localhost:4000`) 실행 확인
- [ ] API 연결 테스트
- [ ] GitHub 앱 연결 테스트
- [ ] 환경변수 보안 설정 확인

## 🔗 관련 링크

- [Next.js 환경변수 문서](https://nextjs.org/docs/basic-features/environment-variables)
- [GitHub 앱 생성 가이드](https://docs.github.com/en/developers/apps/building-github-apps)
- [Vercel 환경변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)

---

이 가이드를 따라 환경변수를 설정하면 프론트엔드에서 백엔드
API(`http://localhost:4000`)와 GitHub 앱과 원활하게 연동할 수 있습니다! 🎯
