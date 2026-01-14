#!/bin/bash

# Y-Blind 프로덕션 환경 상태 확인 스크립트

echo "📊 Y-Blind 프로덕션 환경 상태:"
echo ""
docker-compose -f docker-compose.prod.yml ps
