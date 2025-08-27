FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


# nginx:alpine 이미지는 ENTRYPOINT와 CMD가 설정되어있음
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# CMD / ENTRYPOINT 생략 가능
# React 빌드 결과물을 /usr/share/nginx/html에 복사만 해주면 그대로 컨테이너 실행 시 Nginx가 켜짐
EXPOSE 3000
