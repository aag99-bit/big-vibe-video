const express = require('express');
const { init, save, getDb } = require('./db');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

const toApi = (row) => ({ id: row.id, text: row.text, done: !!row.done });

function all(sql, params = []) {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function get(sql, params = []) {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  let row = null;
  if (stmt.step()) row = stmt.getAsObject();
  stmt.free();
  return row;
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/todos', (req, res) => {
  const rows = all('SELECT * FROM todos ORDER BY id ASC');
  res.json(rows.map(toApi));
});

app.post('/api/todos', (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'text is required' });
  getDb().run('INSERT INTO todos (text) VALUES (?)', [text]);
  save();
  const row = get('SELECT * FROM todos ORDER BY id DESC LIMIT 1');
  res.status(201).json(toApi(row));
});

app.patch('/api/todos/:id', (req, res) => {
  const row = get('SELECT * FROM todos WHERE id = ?', [+req.params.id]);
  if (!row) return res.status(404).json({ error: 'not found' });
  const text = req.body.text !== undefined ? String(req.body.text).trim() : row.text;
  const done = req.body.done !== undefined ? (req.body.done ? 1 : 0) : row.done;
  if (!text) return res.status(400).json({ error: 'text is required' });
  getDb().run('UPDATE todos SET text = ?, done = ? WHERE id = ?', [text, done, row.id]);
  save();
  res.json(toApi(get('SELECT * FROM todos WHERE id = ?', [+req.params.id])));
});

app.delete('/api/todos/:id', (req, res) => {
  const before = all('SELECT * FROM todos').length;
  getDb().run('DELETE FROM todos WHERE id = ?', [+req.params.id]);
  save();
  const after = all('SELECT * FROM todos').length;
  if (before === after) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

init().then(() => {
  app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});