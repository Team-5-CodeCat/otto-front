# GitHub 웹훅 설정 가이드

## 📋 개요

GitHub 저장소에 코드가 push될 때 자동으로 파이프라인을 실행하는 웹훅 시스템을 설정하는 방법입니다.

## 🔧 구현된 기능

### ✅ 웹훅 수신 엔드포인트
- **경로**: `POST /api/webhooks/github`
- **기능**: GitHub push 이벤트 수신 및 파이프라인 자동 실행
- **지원 이벤트**: `push` (다른 이벤트는 무시)

### ✅ 자동 실행 플로우
1. GitHub에서 push 이벤트 발생
2. 웹훅 페이로드 검증 (`repository`, `ref`, `commits` 필수)
3. 저장소 ID로 프로젝트 매핑
4. 프로젝트의 활성 파이프라인 조회
5. 파이프라인 자동 실행 (수동 실행과 동일한 방식)

## 🚀 GitHub 웹훅 설정 방법

### 1. 저장소 설정 접근
1. GitHub 저장소로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Webhooks** 클릭

### 2. 새 웹훅 추가
1. **Add webhook** 버튼 클릭
2. 다음 정보 입력:
   ```
   Payload URL: https://your-domain.com/api/webhooks/github
   Content type: application/json
   Secret: (선택사항, 보안을 위해 설정 권장)
   ```

### 3. 이벤트 선택
- **Just the push event** 선택 (기본값)
- 또는 **Let me select individual events**에서 `Push` 체크

### 4. 웹훅 활성화
- **Active** 체크박스 활성화
- **Add webhook** 클릭하여 저장

## 🧪 테스트 방법

### 1. 로컬 테스트
```bash
# 개발 서버 시작
pnpm dev

# ngrok으로 로컬 서버 노출 (다른 터미널에서)
ngrok http 3000

# GitHub 웹훅 URL에 ngrok URL 사용
# 예: https://abc123.ngrok.io/api/webhooks/github
```

### 2. 웹훅 동작 확인
1. 테스트 커밋 & 푸시:
   ```bash
   git add .
   git commit -m "웹훅 테스트"
   git push origin main
   ```

2. 서버 로그 확인:
   ```
   GitHub 웹훅 수신: /api/webhooks/github
   웹훅 처리 시작: username/repository-name/main
   웹훅으로 파이프라인 실행 완료: { pipelineId: "...", ... }
   ```

### 3. GitHub 웹훅 상태 확인
- GitHub 저장소 → Settings → Webhooks
- 최근 웹훅 요청 상태 확인 (200 성공, 4xx/5xx 오류)

## 🔍 디버깅

### 일반적인 문제들

**1. 웹훅이 전송되지 않음**
- GitHub 웹훅 설정에서 URL 확인
- HTTPS 사용 여부 확인 (GitHub는 HTTP 웹훅 제한적 지원)

**2. 500 Internal Server Error**
```javascript
// 서버 로그 확인
console.log('웹훅 처리 실패:', error);
```

**3. 프로젝트를 찾을 수 없음**
- `findProjectByRepository()` 함수에서 저장소 ID 매핑 로직 확인
- 현재는 첫 번째 프로젝트를 사용하는 임시 구현

**4. 파이프라인이 없음**
- 프로젝트에 활성 파이프라인이 있는지 확인
- 파이프라인 content 필드가 있는지 확인

### 로그 확인 방법
```bash
# 개발 서버 로그
pnpm dev

# 프로덕션 로그 (배포 환경에 따라)
docker logs container-name
# 또는
pm2 logs
```

## ⚠️ 현재 제한사항

### 1. 저장소-프로젝트 매핑
- **현재**: 모든 웹훅이 첫 번째 프로젝트로 전달
- **필요**: 데이터베이스에 `github_repo_id` 필드 추가

### 2. 브랜치 필터링
- **현재**: 모든 브랜치의 push 이벤트 처리
- **필요**: 프로젝트별 트리거 브랜치 설정 (`main`, `develop` 등)

### 3. 웹훅 보안
- **현재**: 기본적인 페이로드 검증만 수행
- **권장**: GitHub Secret을 사용한 서명 검증

## 🚧 향후 개선사항

1. **데이터베이스 스키마 확장**:
   ```sql
   ALTER TABLE projects ADD COLUMN github_repo_id BIGINT;
   ALTER TABLE projects ADD COLUMN webhook_branch VARCHAR(100) DEFAULT 'main';
   ALTER TABLE projects ADD COLUMN webhook_secret VARCHAR(255);
   ```

2. **웹훅 보안 강화**:
   ```typescript
   // GitHub 서명 검증
   const signature = request.headers.get('x-hub-signature-256');
   const isValidSignature = verifyGitHubSignature(payload, signature, secret);
   ```

3. **UI 설정 화면**:
   - 프로젝트 설정에서 GitHub 저장소 연결
   - 웹훅 트리거 브랜치 선택
   - 웹훅 활동 로그 확인