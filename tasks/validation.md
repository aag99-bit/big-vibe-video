# 📋 Task: Валидация пустых задач

**Цель:** Запретить создание задач с пустым текстом или только пробелами.

**Критерии:**
- [ ] Backend возвращает 400 при пустом тексте
- [ ] Frontend показывает ошибку "Введите текст задачи"
- [ ] Кнопка "Добавить" неактивна при пустом поле

**Технически:**
- Backend (`apps/backend/server.js`): добавить проверку `if (!text.trim()) return res.status(400).json({ error: 'text is required' })` в POST /api/todos
- Frontend (`apps/frontend/src/components/TodoList.vue`): добавить проверку `if (!newTodo.value.trim()) return` перед вызовом `add()`

**План:**
1) Обновить POST /api/todos в server.js (проверка уже есть, но убедимся)
2) Добавить проверку в TodoList.vue перед отправкой
3) Протестировать локально: `cd apps/backend && npm start` и `cd apps/frontend && npm run dev`
4) Попробовать добавить пустую задачу — должна появиться ошибка

**Команды для проверки:**
```bash
# Запустить бэкенд
cd apps/backend && npm start

# В другом терминале запустить фронтенд
cd apps/frontend && npm run dev

# Или тест через curl
curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" -d '{"text":""}'
# Ожидаем: {"error":"text is required"} с кодом 400