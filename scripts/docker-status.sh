#!/bin/bash

# Y-Blind 개발 환경 상태 확인 스크립트

echo "📊 Y-Blind 개발 환경 상태"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Docker 데몬 확인
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker가 실행중이지 않습니다."
    exit 1
fi

# 컨테이너 상태
echo "🐳 컨테이너 상태:"
docker-compose ps
echo ""

# 네트워크 상태
echo "🌐 네트워크 상태:"
docker network ls | grep yblind
echo ""

# 볼륨 상태
echo "💾 볼륨 상태:"
docker volume ls | grep yblind
echo ""

# 리소스 사용량
echo "📈 리소스 사용량:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker-compose ps -q 2>/dev/null) 2>/dev/null || echo "컨테이너가 실행중이지 않습니다."
echo ""

