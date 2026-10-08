# Backend для админ-панели

## 3. Acceptance criteria

- [ ] В таблице users есть колонка is_admin BOOLEAN
- [ ] Первый зарегистрированный пользователь получает is_admin=true
- [ ] Middleware isAdmin проверяет права
- [ ] GET /api/admin/users возвращает список (только для админов)
- [ ] GET /api/admin/users/:id возвращает одного пользователя
- [ ] PUT /api/admin/users/:id обновляет данные
- [ ] Запрещено снимать статус с последнего админа (400)

## 4. Затрагиваемые файлы

- apps/backend/db.js
- apps/backend/server.js

## 7.1 Сценарии автотестирования

Файл: apps/backend/tests/admin.test.js

- [ ] Первый юзер gets is_admin=true → 201
- [ ] GET /api/admin/users с токеном админа → 200
- [ ] GET /api/admin/users без токена → 401
- [ ] GET /api/admin/users обычным юзером → 403
- [ ] PUT /api/admin/users/:id админом → 200
- [ ] PUT /api/admin/users/:id не-админом → 403
- [ ] Второй юзер gets is_admin=false → 201
