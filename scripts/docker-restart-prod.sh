#!/bin/bash

# Y-Blind 프로덕션 환경 재시작 스크립트

echo "🔄 Y-Blind 프로덕션 환경을 재시작합니다..."
docker-compose -f docker-compose.prod.yml restart
echo "✅ 프로덕션 환경이 재시작되었습니다."
