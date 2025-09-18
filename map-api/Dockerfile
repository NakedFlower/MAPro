FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install --only=production

# 애플리케이션 코드 복사
COPY src ./src

# 포트 노출
EXPOSE 5000

# 비root 유저로 실행
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# 애플리케이션 시작
CMD ["npm", "start"]