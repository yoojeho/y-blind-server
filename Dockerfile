# 개발 환경용 Dockerfile
FROM node:20-alpine

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 모든 의존성 설치 (개발 환경)
RUN npm ci

# 소스 코드 복사
COPY . .

# 애플리케이션 포트 노출
EXPOSE 4000

# 개발 모드로 실행 (hot reload)
CMD ["npm", "run", "start:dev"]

