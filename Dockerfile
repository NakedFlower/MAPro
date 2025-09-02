FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# 커스텀 nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf
# React 빌드 결과물 복사
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
# nginx는 기본적으로 80포트를 사용하므로 80으로 변경