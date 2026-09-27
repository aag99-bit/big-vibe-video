'use strict';

/**
 * Минимальный статический HTTP-сервер для раздачи index.html.
 * Без зависимостей — только встроенные модули http и fs.
 *
 * Запуск:  npm start  (или  node server.js)
 * По умолчанию слушает http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';  // ← вторая (новая, которую добавили)
const ROOT = __dirname;

// MIME-типы для статических файлов
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

function send(res, code, type, body) {
    res.writeHead(code, { 'Content-Type': type });
    res.end(body);
}

const server = http.createServer((req, res) => {
    // Нормализуем путь: '/' -> '/index.html', защищаем от path traversal
    let pathname = decodeURIComponent(new URL(req.url, `http://${HOST}`).pathname);
    if (pathname === '/') pathname = '/index.html';

    const filePath = path.join(ROOT, path.normalize(pathname).replace(/^(\.\.[\/\\])+/g, ''));
    if (!filePath.startsWith(ROOT)) {
        send(res, 403, 'text/plain; charset=utf-8', '403 Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Если файл не найден и это не запрос на favicon — отдаём index.html
            // (SPA-fallback). Для favicon просто 404, чтобы не засорять лог.
            if (pathname === '/favicon.ico') {
                send(res, 404, 'text/plain; charset=utf-8', '404 Not Found');
                return;
            }
            fs.readFile(path.join(ROOT, 'index.html'), (e2, buf) => {
                if (e2) return send(res, 404, 'text/plain; charset=utf-8', '404 Not Found');
                send(res, 200, MIME['.html'], buf);
            });
            return;
        }

        fs.readFile(filePath, (e3, buf) => {
            if (e3) return send(res, 500, 'text/plain; charset=utf-8', '500 Internal Server Error');
            const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
            send(res, 200, type, buf);
        });
    });
});

server.listen(PORT, HOST, () => {
    console.log(`🚀 Server is running!`);
    console.log(`🏠 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://<your-ip-address>:${PORT}`);
    console.log(`📄 Serving index.html from ${ROOT}`);
});