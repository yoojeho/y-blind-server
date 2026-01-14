# Ubuntu Server에 Docker 설치 가이드

## 1. 기존 Docker 제거 (선택사항)

이미 Docker가 설치되어 있다면:

```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
```

## 2. 필수 패키지 설치

```bash
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

## 3. Docker 공식 GPG 키 추가

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

## 4. Docker 저장소 추가

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

## 5. Docker Engine 설치

```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## 6. Docker 서비스 시작 및 자동 시작 설정

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

## 7. 현재 사용자를 docker 그룹에 추가 (sudo 없이 사용하기 위해)

```bash
sudo usermod -aG docker $USER
```

**중요**: 그룹 변경을 적용하려면 **재로그인**하거나 다음 명령어를 실행해야 합니다:

```bash
newgrp docker
```

## 8. 설치 확인

```bash
# Docker 버전 확인
docker --version

# Docker Compose 버전 확인
docker compose version

# Docker 서비스 상태 확인
sudo systemctl status docker

# 테스트 실행
docker run hello-world
```

## 9. Docker Compose (별도 설치가 필요한 경우)

최신 Docker는 `docker compose` (v2)를 포함하지만, 구버전 `docker-compose`가 필요하다면:

```bash
# docker-compose v2는 이미 설치됨 (docker compose)
# 구버전 docker-compose가 필요하면:
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

## 문제 해결

### 권한 오류가 발생하는 경우

```bash
# docker 그룹에 사용자 추가 확인
groups

# docker 그룹이 보이지 않으면 재로그인
exit
# 또는
newgrp docker
```

### Docker 서비스가 시작되지 않는 경우

```bash
# 서비스 상태 확인
sudo systemctl status docker

# 서비스 로그 확인
sudo journalctl -u docker.service

# 서비스 재시작
sudo systemctl restart docker
```

## 참고

- 공식 문서: https://docs.docker.com/engine/install/ubuntu/
- Docker Compose 문서: https://docs.docker.com/compose/install/
