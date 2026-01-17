#!/bin/bash

# Y-Blind 프로덕션 환경 종료 스크립트

echo "🛑 Y-Blind 프로덕션 환경을 종료합니다..."
docker-compose -f docker-compose.prod.yml down
echo "✅ 프로덕션 환경이 종료되었습니다."
