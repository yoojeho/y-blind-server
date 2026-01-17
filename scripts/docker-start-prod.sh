#!/bin/bash

# Y-Blind 프로덕션 환경 시작 스크립트

echo "🚀 Y-Blind 프로덕션 환경을 시작합니다..."
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
    else
        echo "❌ Docker에 접근할 수 없습니다."
        echo "   오류: $DOCKER_ERROR"
        echo "   Docker가 설치되어 있는지 확인해주세요."
    fi
    exit 1
fi

# 이미지 빌드 및 컨테이너 시작
echo "📦 Docker 이미지 빌드 및 컨테이너 시작 중..."
docker-compose -f docker-compose.prod.yml up -d --build

# 컨테이너 상태 확인
echo ""
echo "⏳ 서비스 준비 중..."
sleep 8

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 프로덕션 환경이 준비되었습니다!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 서비스 접속 정보:"
echo "   - API 서버: http://localhost:4000"
echo "   - Swagger: http://localhost:4000/api-docs"
echo "   - PostgreSQL: localhost:5432"
echo ""
echo "📝 도커 명령어:"
echo "   - 로그 보기: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - 종료하기: docker-compose -f docker-compose.prod.yml down"
echo "   - 상태 확인: docker-compose -f docker-compose.prod.yml ps"
echo ""
