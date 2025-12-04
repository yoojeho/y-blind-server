#!/bin/bash

# Y-Blind 개발 환경 완전 정리 스크립트
# 이 프로젝트의 컨테이너만 삭제합니다 (다른 Docker 컨테이너에는 영향 없음)

PROJECT_NAME="y-blind-server"
CONTAINER_PREFIX="yblind"

echo "🗑️  Y-Blind 개발 환경을 완전히 정리합니다..."
echo ""
echo "📋 삭제할 항목:"
echo ""

# 실행 중인 컨테이너 확인
if docker ps -a | grep -q "$CONTAINER_PREFIX"; then
    echo "📦 컨테이너:"
    docker ps -a --filter "name=$CONTAINER_PREFIX" --format "   - {{.Names}} ({{.Status}})"
else
    echo "📦 컨테이너: 없음"
fi

# 볼륨 확인
if docker volume ls | grep -q "$PROJECT_NAME"; then
    echo ""
    echo "💾 볼륨:"
    docker volume ls --filter "name=$PROJECT_NAME" --format "   - {{.Name}}"
else
    echo ""
    echo "💾 볼륨: 없음"
fi

# 이미지 확인
if docker images | grep -q "$PROJECT_NAME"; then
    echo ""
    echo "🖼️  이미지:"
    docker images --filter "reference=*$PROJECT_NAME*" --format "   - {{.Repository}}:{{.Tag}}"
else
    echo ""
    echo "🖼️  이미지: 없음"
fi

echo ""
echo "⚠️  경고: 위의 항목들이 삭제됩니다."
echo "   (다른 프로젝트의 Docker 리소스는 영향받지 않습니다)"
echo ""
read -p "정말로 진행하시겠습니까? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🧹 정리 중..."
    
    # 1. docker-compose로 컨테이너와 네트워크 중지 및 삭제
    echo ""
    echo "1️⃣  컨테이너 및 네트워크 정리..."
    docker-compose down
    
    # 2. 볼륨 삭제
    echo ""
    echo "2️⃣  볼륨 삭제..."
    VOLUMES=$(docker volume ls -q --filter "name=$PROJECT_NAME")
    if [ -n "$VOLUMES" ]; then
        echo "$VOLUMES" | xargs docker volume rm
        echo "✅ 볼륨 삭제 완료"
    else
        echo "ℹ️  삭제할 볼륨이 없습니다"
    fi
    
    # 3. 이미지 삭제 (선택사항)
    echo ""
    read -p "3️⃣  Docker 이미지도 삭제하시겠습니까? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        IMAGES=$(docker images -q --filter "reference=*$PROJECT_NAME*")
        if [ -n "$IMAGES" ]; then
            echo "$IMAGES" | xargs docker rmi -f
            echo "✅ 이미지 삭제 완료"
        else
            echo "ℹ️  삭제할 이미지가 없습니다"
        fi
    else
        echo "ℹ️  이미지는 보존됩니다"
    fi
    
    echo ""
    echo "✅ 정리 완료!"
    echo ""
    echo "💡 다시 시작하려면: ./scripts/docker-start.sh"
    echo ""
else
    echo ""
    echo "❌ 취소되었습니다."
    echo ""
fi
