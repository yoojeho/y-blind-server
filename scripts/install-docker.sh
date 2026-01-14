#!/bin/bash

# Ubuntu Server에 Docker 설치 스크립트

set -e  # 오류 발생 시 스크립트 중단

echo "🐳 Docker 설치를 시작합니다..."
echo ""

# root 권한 확인
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 이 스크립트는 sudo 권한이 필요합니다."
    echo "   실행: sudo bash scripts/install-docker.sh"
    exit 1
fi

# 1. 기존 Docker 제거 (선택사항)
echo "📦 기존 Docker 제거 중..."
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# 2. 필수 패키지 설치
echo "📦 필수 패키지 설치 중..."
apt-get update
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 3. Docker 공식 GPG 키 추가
echo "🔑 Docker GPG 키 추가 중..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Docker 저장소 추가
echo "📚 Docker 저장소 추가 중..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Docker Engine 설치
echo "🚀 Docker Engine 설치 중..."
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Docker 서비스 시작 및 자동 시작 설정
echo "⚙️  Docker 서비스 시작 중..."
systemctl start docker
systemctl enable docker

# 7. 현재 사용자를 docker 그룹에 추가
if [ -n "$SUDO_USER" ]; then
    echo "👤 사용자 '$SUDO_USER'를 docker 그룹에 추가 중..."
    usermod -aG docker "$SUDO_USER"
else
    echo "⚠️  SUDO_USER를 찾을 수 없습니다. 수동으로 docker 그룹에 추가해주세요:"
    echo "   sudo usermod -aG docker \$USER"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Docker 설치가 완료되었습니다!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 다음 단계:"
echo ""
echo "1. 재로그인하거나 다음 명령어 실행:"
echo "   newgrp docker"
echo ""
echo "2. 설치 확인:"
echo "   docker --version"
echo "   docker compose version"
echo "   docker run hello-world"
echo ""
echo "3. 프로덕션 환경 시작:"
echo "   npm run start:docker:prod"
echo ""
