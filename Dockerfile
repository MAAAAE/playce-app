# --- 1. 빌드 단계 ---
# Node.js 환경에서 Expo 앱을 빌드합니다.
FROM node:18-alpine AS build

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# Expo 웹 앱 빌드
RUN npx expo export

# --- 2. 프로덕션 단계 ---
# Nginx 웹 서버를 사용하여 빌드된 정적 파일을 제공합니다.
FROM nginx:stable-alpine

# 빌드 단계에서 생성된 dist 폴더를 Nginx의 기본 웹 루트로 복사합니다.
COPY --from=build /app/dist /usr/share/nginx/html

# 커스텀 Nginx 설정을 복사합니다.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80번 포트를 외부에 노출합니다.
EXPOSE 80

# Nginx 서버를 실행합니다.
CMD ["nginx", "-g", "daemon off;"]
