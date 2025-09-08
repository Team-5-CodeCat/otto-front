#!/bin/bash

# Otto Frontend 개발환경 설정 스크립트
echo "🌐 Otto Frontend 개발환경 설정을 시작합니다..."

# 개발자 이름 입력받기
read -p "개발자 이름을 입력하세요 (한진우/장준영/이지윤/고민지/김보아/유호준): " DEV_NAME

# 개발자 이름 검증 및 번호 매핑
case "$DEV_NAME" in
    "한진우")
        DEV_NUM=1
        DEV_ID="hanjinwoo"
        ;;
    "장준영")
        DEV_NUM=2
        DEV_ID="jangjunyeong"
        ;;
    "이지윤")
        DEV_NUM=3
        DEV_ID="leejiyun"
        ;;
    "고민지")
        DEV_NUM=4
        DEV_ID="gominji"
        ;;
    "김보아")
        DEV_NUM=5
        DEV_ID="kimboa"
        ;;
    "유호준")
        DEV_NUM=6
        DEV_ID="yoohojun"
        ;;
    *)
        echo "❌ 오류: 올바른 개발자 이름을 입력해주세요."
        echo "   입력 가능한 이름: 한진우, 장준영, 이지윤, 고민지, 김보아, 유호준"
        exit 1
        ;;
esac

# 포트 계산
FRONTEND_PORT=$((2999 + $DEV_NUM))  # 3000-3005
BACKEND_PORT=$((3999 + $DEV_NUM))   # 4000-4005

echo "📋 $DEV_NAME Frontend 개발환경 설정:"
echo "   - Frontend: $FRONTEND_PORT"
echo "   - Backend API: $BACKEND_PORT"
echo ""

# .env.dev.local 파일 생성
echo "📝 .env.dev.local 파일을 생성합니다..."

cat > .env.dev.local << EOF
# $DEV_NAME Frontend Environment Configuration
# 이 파일은 otto-front 개발환경을 위해 자동 생성되었습니다

# Port Configuration
PORT=$FRONTEND_PORT

# Backend API Configuration  
BACKEND_PORT=$BACKEND_PORT
NEXT_PUBLIC_API_BASE_URL=http://localhost:$BACKEND_PORT

# GitHub App Configuration
NEXT_PUBLIC_GITHUB_APP_NAME=otto-test-1

# Development Configuration
NODE_ENV=development

# SSH Port Forwarding 설정 참고:
# ~/.ssh/config 파일에 다음을 추가하세요:
#
# Host codecat-dev
#   HostName ec2-43-203-239-31.ap-northeast-2.compute.amazonaws.com
#   User jinwoohan
#   IdentityFile ~/.ssh/jinwoohan_dev_key  
#   Port 22
#   LocalForward $FRONTEND_PORT localhost:$FRONTEND_PORT
#   LocalForward $BACKEND_PORT localhost:$BACKEND_PORT
#
# 연결: ssh codecat-dev
# 브라우저: http://localhost:$FRONTEND_PORT
EOF

echo "✅ .env.dev.local 파일 생성 완료"

echo ""
echo "🎉 Frontend 개발환경 설정이 완료되었습니다!"
echo ""
echo "다음 단계:"
echo "1. SSH 포트 포워딩 설정 (~/.ssh/config 파일 참고)"
echo "2. pnpm install"
echo "3. pnpm dev"
echo ""
echo "🌐 애플리케이션 URL: http://localhost:$FRONTEND_PORT"
echo "🔗 백엔드 API URL: http://localhost:$BACKEND_PORT"
echo ""
echo "⚠️  중요 사항:"
echo "  - otto-handler 개발서버가 포트 $BACKEND_PORT 에서 실행되어야 합니다"
echo "  - SSH 포트 포워딩이 올바르게 설정되어야 합니다"
echo "  - 터미널 링크를 클릭하지 말고 URL을 복사하여 브라우저에 붙여넣으세요"
echo ""
echo "📚 관련 문서:"
echo "  - README.md: 상세한 SSH 포트 포워딩 설정 방법"
echo "  - .env.dev.local: 생성된 환경변수 설정 확인"