#!/bin/bash
set -e

SERVER="root@109.238.92.111"
REMOTE_DIR="/app/big-vibe-video"

echo "📦 Собираю архив с исходниками (новая структура apps/)..."
tar -czf project.tar.gz apps/ Dockerfile docker-compose.yml nginx.conf entrypoint.sh .dockerignore

echo "🚀 Загружаю на сервер..."
scp project.tar.gz $SERVER:$REMOTE_DIR/

echo "🔄 Пересобираю и перезапускаю на сервере..."
ssh $SERVER << 'REMOTECMD'
    cd /app/big-vibe-video
    tar -xzf project.tar.gz
    rm -f project.tar.gz
    docker compose up -d --build
REMOTECMD

echo "🧹 Очищаю локальный архив..."
rm -f project.tar.gz

echo "✅ Деплой успешно завершён!"