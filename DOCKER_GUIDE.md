# 🐳 Docker 개발 환경 가이드

## 개요

이 프로젝트는 Docker를 사용하여 NestJS 서버와 PostgreSQL 데이터베이스를 한 번에 실행할 수 있도록 설정되어 있습니다.
프론트엔드 개발자가 별도의 설정 없이 로컬에서 쉽게 서버를 띄울 수 있습니다.

## 필수 요구사항

- Docker Desktop 설치 (https://www.docker.com/products/docker-desktop)
- Docker Desktop이 실행 중이어야 합니다

## 📁 관련 파일

```
.
├── docker-compose.yml          # Docker 서비스 설정
├── Dockerfile                  # NestJS 이미지 빌드 설정
└── scripts/                    # Docker 관리 스크립트
    ├── docker-start.sh           # 시작 스크립트
    ├── docker-down.sh            # 종료 스크립트
    ├── docker-restart.sh         # 재시작 스크립트
    ├── docker-logs.sh            # 로그 확인 스크립트
    ├── docker-status.sh          # 상태 확인 스크립트
    └── docker-clean.sh           # 컨테이너 초기화 스크립트
```

## ⚙️ 환경 변수 설정

### 1. `.env` 파일 생성

처음 프로젝트를 시작할 때, `.env` 파일을 생성해야 합니다:

```bash
cp .env.example .env
```

### 2. 환경 변수 수정

`.env` 파일을 열어서 필요한 값을 수정:

**중요**: `.env` 파일의 환경 변수가 변경되면 컨테이너를 재시작해야 적용됩니다:

```bash
./scripts/docker-restart.sh
# 또는
npm run restart
```

## 🚀 서버 실행

### 1. nest js 실행

```bash
npm run start:docker
```

- **API 서버**: http://localhost:4000
- **Swagger API 문서**: http://localhost:4000/api-docs
- **PostgreSQL**: localhost:5432

### 2. 시드 데이터 (선택적 생성)

`npm run start:docker`를 실행하면 **시드 데이터 생성 여부를 물어봅니다**.

```
🌱 시드 데이터 생성 옵션

테스트용 유저와 게시글을 자동으로 생성할 수 있습니다:
  - 테스트 유저 2명 (testuser1, testuser2)
  - 샘플 게시글 7개

시드 데이터를 생성하시겠습니까? (Y/n):
```

- **Y 또는 Enter**: 시드 데이터 생성
- **n**: 시드 데이터 생성하지 않음

#### 📝 자동 생성되는 데이터

**테스트 유저 2명:**

- `testuser1` / 비밀번호: `test1234`
- `testuser2` / 비밀번호: `test1234`

**게시글 7개:**

- testuser1이 작성한 게시글 3개
- testuser2가 작성한 게시글 4개

#### ⚙️ 동작 방식

1. 스크립트에서 사용자에게 시드 데이터 생성 여부 확인
2. TypeORM이 `synchronize: true`로 테이블 자동 생성
3. NestJS 애플리케이션 시작
4. `DatabaseSeederService`가 `ENABLE_SEED_DATA` 환경 변수 확인
5. 활성화되어 있으면 시드 데이터 생성
6. 이미 데이터가 있으면 건너뛰기 (중복 생성 방지)

#### 💡 시드 데이터 확인

```bash
# 유저 목록 확인
docker exec yblind-postgres psql -U app -d yblind -c "SELECT id, username, nickname FROM \"user\";"

# 게시글 목록 확인
docker exec yblind-postgres psql -U app -d yblind -c "SELECT id, title, \"userId\" FROM posts ORDER BY id;"
```

#### 🔄 시드 데이터 재생성

데이터를 초기화하고 다시 생성하려면:

```bash
npm run clean   # 모든 데이터 삭제
npm run start:docker   # 도커 다시 시작
```

#### 📍 시드 데이터 코드 위치

시드 데이터를 수정하거나 추가하려면 다음 파일을 편집:

- `src/database/database-seeder.service.ts`

### 3. 로그 확인

#### 모든 서비스 로그 보기

```bash
npm run logs
```

로그를 종료하려면 `Command + C`를 누르세요.

### 4. 서비스 상태 확인

```bash
npm run status
```

컨테이너 상태, 네트워크, 볼륨, 리소스 사용량을 확인할 수 있습니다.

### 5. 서버 종료

```bash
npm run down
```

컨테이너를 중지하지만 데이터베이스 데이터는 보존됩니다.

### 6. 서버 재시작

```bash
npm run restart
```

코드 변경 사항은 hot reload로 자동 반영되지만, 환경 변수나 docker-compose.yml 변경 시 재시작이 필요합니다.

## 🗑️ 완전 삭제

데이터베이스 데이터를 포함하여 모든 것을 삭제하려면:

```bash
npm run clean
```

이 명령어는:

- 모든 컨테이너 중지 및 삭제
- 데이터베이스 볼륨 삭제 (모든 데이터 손실!)
- 선택적으로 Docker 이미지도 삭제

## 🗄️ 데이터베이스 정보

### 연결 정보

```
Host: localhost
Port: 5432
Database: yblind
Username: app
Password: app_pw
```

### 데이터베이스 초기화

TypeORM의 `synchronize: true` 옵션으로 테이블이 자동으로 생성됩니다.

데이터베이스를 완전히 초기화하려면:

```bash
npm run clean  # 볼륨 삭제 (모든 데이터 삭제)
npm run start:docker  # 새로 시작 (시드 데이터 생성 여부 선택)
```

### 시드 데이터 커스터마이징

시드 데이터를 수정하거나 추가하려면 `src/database/database-seeder.service.ts` 파일을 편집하세요.

예를 들어 더 많은 유저나 게시글을 추가할 수 있습니다:

```typescript
// database-seeder.service.ts의 seedData() 메서드에서
const user3 = this.userRepository.create({
  username: "testuser3",
  nickname: "테스트유저3",
  passwordHash,
});
```

변경 후 Docker가 자동으로 hot reload하여 반영됩니다 (기존 데이터가 있으면 건너뜀).

## 🛠️ 고급 사용법

### 직접 Docker Compose 명령 사용

```bash
# 빌드 없이 시작
docker-compose up -d

# 빌드하면서 시작
docker-compose up -d --build

# 중지
docker-compose down

# 볼륨까지 삭제
docker-compose down -v

# 특정 서비스만 재시작
docker-compose restart yblind-nestjs
```

### 컨테이너 내부 접속

```bash
# NestJS 컨테이너
docker exec -it yblind-nestjs sh

# PostgreSQL 컨테이너
docker exec -it yblind-postgres sh
```

### 데이터베이스 직접 접속

```bash
docker exec -it yblind-postgres psql -U app -d yblind
```

## 🔄 코드 변경 사항 반영

### 자동 반영 (Hot Reload)

- `src/` 디렉토리의 TypeScript 파일 변경 시 자동으로 재컴파일되고 서버가 재시작됩니다.
- 변경 사항은 즉시 반영됩니다.

### 수동 재시작이 필요한 경우

**재빌드가 필요한 경우:**

- `package.json` 변경 (의존성 추가/삭제)
- `Dockerfile` 변경

```bash
npm run down
npm run start:docker
```

**재시작만 필요한 경우:**

- `docker-compose.yml` 변경
- `.env` 또는 환경 변수 변경

```bash
npm run restart
```
