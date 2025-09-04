# Otto Frontend 인증 시스템 구현

백엔드 API와 연동하여 JWT 토큰과 리프레시 토큰을 사용하는 완전한 인증 시스템을
구현했습니다.

## 🚀 구현된 기능

### 1. 백엔드 API 연동

- **파일**: `app/lib/auth-api.ts`
- **기능**: 백엔드 인증 API와의 통신을 담당하는 HTTP 클라이언트
- **주요 엔드포인트**:
  - `POST /sign_in` - 로그인
  - `POST /sign_in/refresh` - 리프레시 토큰으로 로그인
  - 쿠키 기반 인증 (credentials: 'include')

### 2. 토큰 관리 시스템

- **파일**: `app/lib/token-manager.ts`
- **기능**: JWT 토큰과 리프레시 토큰의 생명주기 관리
- **특징**:
  - 자동 토큰 리프레시 (만료 5분 전)
  - 토큰 상태 추적 및 검증
  - 싱글톤 패턴으로 전역 상태 관리

### 3. 인증 상태 관리

- **파일**: `app/contexts/AuthContext.tsx`
- **기능**: React Context를 통한 전역 인증 상태 관리
- **제공하는 기능**:
  - 로그인/로그아웃
  - 인증 상태 추적
  - 자동 토큰 리프레시
  - 에러 처리

### 4. 보호된 라우트

- **파일**: `app/components/auth/AuthGuard.tsx`
- **기능**: 인증이 필요한 페이지와 공개 페이지를 구분
- **컴포넌트**:
  - `AuthGuard` - 기본 인증 가드
  - `ProtectedRoute` - 인증이 필요한 라우트
  - `PublicRoute` - 공개 라우트 (로그인/회원가입 페이지)

### 5. 업데이트된 페이지들

- **로그인 페이지**: `app/(auth)/signin/page.tsx`
- **회원가입 페이지**: `app/(auth)/signup/page.tsx`
- **대시보드 레이아웃**: `app/(dashboard)/layout.tsx`

## 🔧 설정 방법

### 1. 환경 변수 설정

`env.example` 파일을 참고하여 `.env.local` 파일을 생성하세요:

```bash
# 백엔드 API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. 백엔드 서버 실행

백엔드 서버가 실행 중인지 확인하세요. 기본적으로 `http://localhost:3001`에서
실행되어야 합니다.

## 📁 파일 구조

```
app/
├── lib/
│   ├── auth-api.ts          # 백엔드 API 연동
│   └── token-manager.ts     # 토큰 관리
├── contexts/
│   └── AuthContext.tsx      # 인증 상태 관리
├── components/
│   └── auth/
│       ├── AuthGuard.tsx    # 인증 가드
│       └── index.ts         # 내보내기
├── (auth)/
│   ├── signin/page.tsx      # 로그인 페이지
│   └── signup/page.tsx      # 회원가입 페이지
├── (dashboard)/
│   └── layout.tsx           # 보호된 대시보드 레이아웃
└── layout.tsx               # 루트 레이아웃 (AuthProvider 포함)
```

## 🔐 인증 플로우

### 로그인 플로우

1. 사용자가 이메일/비밀번호 입력
2. `authApi.login()` 호출
3. 백엔드에서 JWT 토큰과 리프레시 토큰 발급
4. 토큰이 쿠키에 자동 저장 (httpOnly)
5. `AuthContext`에서 인증 상태 업데이트
6. 대시보드로 리다이렉트

### 토큰 리프레시 플로우

1. 액세스 토큰 만료 5분 전 자동 감지
2. 리프레시 토큰으로 새로운 토큰 요청
3. 토큰 회전 (기존 리프레시 토큰 삭제, 새 토큰 발급)
4. 인증 상태 유지

### 로그아웃 플로우

1. `AuthContext.logout()` 호출
2. 모든 토큰 삭제
3. 인증 상태 초기화
4. 로그인 페이지로 리다이렉트

## 🛡️ 보안 기능

### 쿠키 보안

- `httpOnly`: JavaScript에서 접근 불가
- `secure`: HTTPS에서만 전송 (프로덕션)
- `sameSite: 'lax'`: CSRF 공격 방지

### 토큰 관리

- 액세스 토큰: 15분 만료
- 리프레시 토큰: 14일 만료
- 토큰 회전: 보안 강화

### 자동 리프레시

- 백그라운드에서 자동 토큰 갱신
- 사용자 경험 향상
- 세션 유지

## 🚨 에러 처리

### API 에러

- 네트워크 오류
- 인증 실패
- 서버 오류

### 토큰 에러

- 만료된 토큰
- 잘못된 토큰
- 리프레시 실패

## 🔄 백엔드 API 호환성

이 구현은 다음 백엔드 API와 호환됩니다:

### 로그인 API

```typescript
POST /sign_in
{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "message": "로그인 성공",
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "accessTokenExpiresIn": 900,
  "refreshTokenExpiresIn": 1209600
}
```

### 리프레시 API

```typescript
POST /sign_in/refresh
// 쿠키에서 refresh_token 자동 전송

Response:
{
  "message": "로그인 성공",
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token",
  "accessTokenExpiresIn": 900,
  "refreshTokenExpiresIn": 1209600
}
```

## 🧪 테스트 방법

### 1. 로그인 테스트

1. `/signin` 페이지로 이동
2. 유효한 이메일/비밀번호 입력
3. 로그인 성공 시 `/projects`로 리다이렉트 확인

### 2. 토큰 리프레시 테스트

1. 로그인 후 개발자 도구에서 쿠키 확인
2. `access_token`과 `refresh_token` 존재 확인
3. 15분 후 자동 리프레시 동작 확인

### 3. 보호된 라우트 테스트

1. 로그인하지 않은 상태에서 `/projects` 접근
2. `/signin`으로 리다이렉트 확인
3. 로그인 후 정상 접근 확인

## 🔧 개발자 도구

### 인증 상태 확인

```typescript
import { useAuth } from '@/app/contexts/AuthContext';

const { isAuthenticated, user, isLoading, error } = useAuth();
```

### 토큰 상태 확인

```typescript
import { tokenManager } from '@/app/lib/token-manager';

const tokenState = tokenManager.getTokenState();
console.log(tokenState);
```

## 📝 TODO

백엔드에서 다음 API가 구현되면 추가 연동이 필요합니다:

1. **회원가입 API** (`POST /signup`)
2. **사용자 정보 API** (`GET /me`)
3. **로그아웃 API** (`POST /logout`)

현재는 임시 구현으로 처리되어 있으며, 백엔드 API 구현 후
`app/lib/auth-api.ts`에서 해당 함수들을 업데이트하면 됩니다.

## 🎯 주요 개선사항

1. **완전한 JWT 인증 시스템**: 토큰 기반 인증으로 보안 강화
2. **자동 토큰 관리**: 사용자 경험 향상
3. **타입 안전성**: TypeScript로 타입 안전성 보장
4. **에러 처리**: 포괄적인 에러 처리 및 사용자 피드백
5. **보호된 라우트**: 인증이 필요한 페이지 자동 보호
6. **반응형 UI**: 로딩 상태 및 에러 상태 표시

이제 백엔드 API와 완전히 연동된 안전하고 사용자 친화적인 인증 시스템이
구현되었습니다! 🎉
