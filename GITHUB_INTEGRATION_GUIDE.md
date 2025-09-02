# 🚀 GitHub 앱 통합 기능 사용 가이드

## 📋 개요

GitHub 앱 통합 기능을 통해 사용자는 GitHub 레포지토리를 연결하고 브랜치를
선택하여 CI/CD 파이프라인을 설정할 수 있습니다.

## 🔄 워크플로우 단계

### 1단계: GitHub 앱 설치

- **목적**: GitHub 앱을 설치하여 레포지토리 접근 권한 획득
- **동작**:
  - "GitHub 앱 설치" 버튼 클릭
  - 새 창에서 GitHub 앱 설치 페이지 열림
  - 설치 완료 후 자동으로 레포지토리 목록 조회

### 2단계: 레포지토리 선택

- **목적**: CI/CD 파이프라인에 연결할 레포지토리 선택
- **동작**:
  - 접근 가능한 레포지토리 목록을 카드 형태로 표시
  - 각 카드에 레포지토리 정보 표시 (이름, 설명, 기본 브랜치, 공개/비공개)
  - 레포지토리 선택 시 해당 레포지토리의 브랜치 목록 자동 조회

### 3단계: 브랜치 선택

- **목적**: CI/CD 파이프라인에서 사용할 브랜치 선택
- **동작**:
  - 선택된 레포지토리의 브랜치 목록을 라디오 버튼 형태로 표시
  - 각 브랜치 정보 표시 (이름, 최근 커밋 SHA, 보호 여부)
  - 브랜치 선택 후 "등록 완료" 버튼으로 최종 등록

### 4단계: 설정 완료

- **목적**: 선택된 레포지토리와 브랜치 정보 확인 및 완료
- **동작**:
  - 선택된 레포지토리와 브랜치 정보 요약 표시
  - "다시 설정하기" 버튼으로 초기화 가능

## 🎯 주요 기능

### 진행 단계 표시

- 4단계 진행 상황을 시각적으로 표시
- 현재 단계 하이라이트
- 완료된 단계는 초록색으로 표시

### 반응형 디자인

- 모바일, 태블릿, 데스크톱에서 모두 최적화
- 카드 형태의 레포지토리 목록
- 터치 친화적인 UI 요소

### 에러 처리

- 네트워크 오류, API 오류 등 모든 에러 상황 처리
- 사용자 친화적인 에러 메시지 표시
- 재시도 옵션 제공

### 로딩 상태

- 각 API 호출 시 로딩 상태 표시
- 버튼 비활성화로 중복 요청 방지

## 🔧 백엔드 API 연동

### 1. GitHub 앱 설치 URL 조회

```typescript
GET / api / integrations / github / install / url;
Authorization: Bearer<token>;
```

### 2. GitHub 앱 등록

```typescript
POST /api/integrations/github/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "installationId": "string",
  "accessToken": "string"
}
```

### 3. 브랜치 목록 조회

```typescript
GET /api/integrations/github/branches?repo=owner/repo
Authorization: Bearer <token>
```

### 4. 브랜치 등록

```typescript
POST /api/integrations/github/branches
Authorization: Bearer <token>
Content-Type: application/json

{
  "repo": "username/repo-name",
  "branch": "main"
}
```

## 📱 사용자 경험

### 직관적인 UI

- 단계별 진행 상황 표시
- 명확한 버튼과 액션
- 시각적 피드백 (로딩, 성공, 에러)

### 접근성

- 키보드 네비게이션 지원
- 스크린 리더 호환
- 색상 대비 최적화

### 성능

- API 호출 최적화
- 불필요한 리렌더링 방지
- 메모리 누수 방지

## 🚨 문제 해결

### GitHub 앱 설치 실패

- **원인**: 네트워크 오류, 권한 부족
- **해결**: 재시도 버튼 클릭, 브라우저 새로고침

### 레포지토리 목록 조회 실패

- **원인**: GitHub 앱 설치 미완료, API 오류
- **해결**: GitHub 앱 재설치, 관리자 문의

### 브랜치 목록 조회 실패

- **원인**: 레포지토리 접근 권한 부족, API 오류
- **해결**: GitHub에서 레포지토리 권한 확인, 재시도

### 브랜치 등록 실패

- **원인**: 백엔드 오류, 데이터베이스 연결 문제
- **해결**: 재시도, 관리자 문의

## 🔄 상태 관리

### 컴포넌트 상태

- `currentStep`: 현재 워크플로우 단계
- `repositories`: 레포지토리 목록
- `selectedRepo`: 선택된 레포지토리
- `branches`: 브랜치 목록
- `selectedBranch`: 선택된 브랜치
- `isLoading`: 로딩 상태
- `error`: 에러 메시지
- `successMessage`: 성공 메시지

### 부모 컴포넌트 연동

- `onRepoSelect`: 레포지토리 선택 시 부모 컴포넌트에 전달
- `onBranchSelect`: 브랜치 선택 시 부모 컴포넌트에 전달
- `initialRepo`: 초기 레포지토리 설정
- `initialBranch`: 초기 브랜치 설정

## 🎨 스타일링

### 색상 팔레트

- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Error: Red (#EF4444)
- Warning: Yellow (#F59E0B)
- Gray: Gray (#6B7280)

### 컴포넌트 스타일

- Card: 둥근 모서리, 그림자 효과
- Button: 호버 효과, 로딩 상태
- Input: 포커스 상태, 에러 상태
- Modal: 오버레이, 애니메이션

## 📊 성능 최적화

### 코드 분할

- GitHub 통합 컴포넌트는 필요 시에만 로드
- API 호출 최적화

### 메모리 관리

- 컴포넌트 언마운트 시 이벤트 리스너 정리
- 불필요한 상태 업데이트 방지

### 네트워크 최적화

- API 응답 캐싱
- 중복 요청 방지

## 🔐 보안 고려사항

### 토큰 관리

- GitHub 앱 토큰은 안전하게 저장
- 토큰 만료 시 자동 갱신

### 권한 관리

- 최소 권한 원칙 적용
- 사용자별 접근 권한 확인

### 데이터 보호

- 민감한 정보 암호화
- 로그에서 민감한 정보 제거

## 🚀 향후 개선 사항

### 기능 확장

- 여러 레포지토리 동시 선택
- 브랜치별 설정 저장
- 웹훅 설정 자동화

### 사용자 경험

- 드래그 앤 드롭 지원
- 키보드 단축키
- 다국어 지원

### 성능 개선

- 가상화된 리스트
- 무한 스크롤
- 실시간 업데이트

---

이 가이드를 통해 GitHub 앱 통합 기능을 효과적으로 사용할 수 있습니다! 🎯
