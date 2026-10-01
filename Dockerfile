# Stage 1: сборка фронтенда
FROM node:20-alpine AS frontend-build
WORKDIR /build
COPY apps/frontend/package*.json ./
RUN npm ci
COPY apps/frontend/ ./
RUN npm run build

# Stage 2: production-зависимости бэкенда (без devDeps)
FROM node:20-alpine AS backend-deps
WORKDIR /build
COPY apps/backend/package*.json ./
RUN npm ci --omit=dev

# Stage 3: финальный образ — node + nginx
FROM node:20-alpine
RUN apk add --no-cache nginx
WORKDIR /app

# Бэкенд с production-зависимостями
COPY --from=backend-deps /build/node_modules ./apps/backend/node_modules
COPY apps/backend/ ./apps/backend/

# Собранный фронтенд
COPY --from=frontend-build /build/dist ./apps/frontend/dist

# Конфиг nginx и точка входа
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]