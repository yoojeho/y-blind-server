#!/bin/bash

# Y-Blind 개발 환경 재시작 스크립트

echo "🔄 Y-Blind 개발 환경을 재시작합니다..."
echo ""

# 컨테이너 재시작
docker-compose restart

echo ""
echo "⏳ 서비스 준비 중..."
sleep 3

# 상태 출력
echo ""
echo "✅ 서비스 상태:"
docker-compose ps

echo ""
echo "✅ 재시작 완료!"
echo ""

