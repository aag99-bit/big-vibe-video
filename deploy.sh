#!/bin/bash
set -e

SERVER="root@109.238.92.111"
REMOTE_DIR="/app/big-vibe-video"
CONTAINER_NAME="todo-app"

echo "📦 Собираю архив с исходниками..."
tar -czf project.tar.gz package.json package-lock.json vite.config.js nginx.conf Dockerfile src/ index.html

echo "📤 Загружаю на сервер..."
scp project.tar.gz $SERVER:$REMOTE_DIR/

echo "🔨 Подключаюсь к серверу для пересборки..."
ssh $SERVER << EOF
    cd $REMOTE_DIR
    tar -xzf project.tar.gz
    rm project.tar.gz
    
    echo "🛑 Останавливаю старый контейнер..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    
    echo "🏗 Собираю новый образ (это займет минуту)..."
    docker build -t $CONTAINER_NAME .
    
    echo "🚀 Запускаю новый контейнер..."
    docker run -d --name $CONTAINER_NAME --restart always -p 3000:3000 $CONTAINER_NAME
    
    echo "✅ Статус:"
    docker ps | grep $CONTAINER_NAME
EOF

# Удаляем локальный архив
rm project.tar.gz
echo "🎉 Деплой завершён! Откройте http://109.238.92.111:3000"