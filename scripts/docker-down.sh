#!/bin/bash

# Y-Blind 개발 환경 종료 스크립트

echo "🛑 Y-Blind 개발 환경을 종료합니다..."
echo ""

docker-compose down

echo ""
echo "✅ 모든 컨테이너가 종료되었습니다."
echo ""
echo "💡 참고:"
echo "   - 데이터는 보존 (볼륨이 남아있음)"
echo "   - 다시 시작: ./scripts/docker-start.sh"
echo "   - 데이터까지 삭제: ./scripts/docker-clean.sh"
echo ""

