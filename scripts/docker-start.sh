#!/bin/bash

# Y-Blind 개발 환경 시작 스크립트

echo "🚀 Y-Blind 개발 환경을 시작합니다..."
echo ""

# Docker 데몬 확인
DOCKER_ERROR=$(docker ps 2>&1)
DOCKER_EXIT_CODE=$?
if [ $DOCKER_EXIT_CODE -ne 0 ]; then
    # 오류 원인 확인
    if echo "$DOCKER_ERROR" | grep -q "permission denied"; then
        echo "❌ Docker 권한 오류가 발생했습니다."
        echo "   현재 사용자를 docker 그룹에 추가해주세요:"
        echo "   sudo usermod -aG docker \$USER"
        echo "   그 후 재로그인하거나: newgrp docker"
    elif echo "$DOCKER_ERROR" | grep -q "Cannot connect"; then
        echo "❌ Docker 서비스가 실행중이지 않습니다."
        echo "   Ubuntu/Linux: sudo systemctl start docker"
        echo "   Windows/Mac: Docker Desktop을 실행해주세요."
    else
        echo "❌ Docker에 접근할 수 없습니다."
        echo "   오류: $DOCKER_ERROR"
        echo "   Docker가 설치되어 있는지 확인해주세요."
    fi
    exit 1
fi

# 시드 데이터 생성 여부 확인
echo "🌱 시드 데이터 생성 옵션"
echo ""
echo "테스트용 유저와 게시글을 자동으로 생성할 수 있습니다:"
echo "  - 테스트 유저 2명 (testuser1, testuser2)"
echo "  - 샘플 게시글 7개"
echo ""
read -p "시드 데이터를 생성하시겠습니까? (Y/n): " -n 1 -r
echo ""
echo ""

# 기본값은 Y (엔터만 쳐도 생성)
if [[ -z $REPLY ]] || [[ $REPLY =~ ^[Yy]$ ]]; then
    SEED_DATA_OPTION=true
    echo "✅ 시드 데이터를 생성합니다."
else
    SEED_DATA_OPTION=false
    echo "⏭️  시드 데이터 생성을 건너뜁니다."
fi

echo ""

# 이미지 빌드 및 컨테이너 시작
echo "📦 Docker 이미지 빌드 및 컨테이너 시작 중..."
ENABLE_SEED_DATA=$SEED_DATA_OPTION docker-compose up -d --build

# 컨테이너 상태 확인
echo ""
echo "⏳ 서비스 준비 중..."
sleep 8

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 개발 환경이 준비되었습니다!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 서비스 접속 정보:"
echo "   - API 서버: http://localhost:4000"
echo "   - Swagger: http://localhost:4000/api-docs"
echo "   - PostgreSQL: localhost:5432"
echo ""
echo "📝 도커 명령어:"
echo "   - 로그 보기: npm run logs"
echo "   - 종료하기: npm run down"
echo "   - 재시작: npm run restart"
echo "   - 완전 삭제(DB 초기화): npm run clean"
echo ""

# 시드 데이터 정보 출력
if [[ $SEED_DATA_OPTION == "true" ]]; then
    echo "🌱 시드 데이터:"
    echo "   테스트 계정이 자동으로 생성되었습니다."
    echo "   - Username: testuser1, Password: test1234"
    echo "   - Username: testuser2, Password: test1234"
    echo ""
fi
