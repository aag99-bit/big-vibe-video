const express = require('express');
const { init, save, getDb } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

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

// Middleware для проверки токена
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware для проверки прав администратора
const isAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = get('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (!user || !user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.get('/api/health', (req, res) => res.json({ ok: true }));

// === Auth Routes ===
app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  if (get('SELECT * FROM users WHERE email = ?', [email])) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  // Первый пользователь в системе становится админом
  const userCount = get('SELECT COUNT(*) as c FROM users').c;
  const isFirstUser = userCount === 0 ? 1 : 0;
  
  getDb().run('INSERT INTO users (email, password_hash, is_admin) VALUES (?, ?, ?)', 
    [email, passwordHash, isFirstUser]);
  save();
  res.status(201).json({ ok: true, is_admin: isFirstUser === 1 });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, is_admin: !!user.is_admin } });
});

app.post('/api/auth/logout', (req, res) => res.json({ ok: true }));

app.post('/api/auth/reset-password', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const newPassword = String(req.body.newPassword || '');
  const user = get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  getDb().run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user.id]);
  save();
  res.json({ ok: true });
});

app.get('/api/user/profile', verifyToken, (req, res) => {
  const user = get('SELECT id, email FROM users WHERE id = ?', [req.user.id]);
  res.json(user);
});

app.put('/api/user/profile', verifyToken, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
  if (get('SELECT * FROM users WHERE email = ? AND id != ?', [email, req.user.id])) {
    return res.status(400).json({ error: 'Email already taken' });
  }
  getDb().run('UPDATE users SET email = ? WHERE id = ?', [email, req.user.id]);
  save();
  res.json({ ok: true });
});

// === Todos Routes ===
app.get('/api/todos', verifyToken, (req, res) => {
  const filter = req.query.filter || 'all';
  let sql = 'SELECT * FROM todos WHERE user_id = ?';
  const params = [req.user.id];
  
  if (filter === 'active') {
    sql += ' AND done = 0';
  } else if (filter === 'done') {
    sql += ' AND done = 1';
  }
  
  sql += ' ORDER BY id ASC';
  
  const rows = all(sql, params);
  res.json(rows.map(toApi));
});

app.post('/api/todos', verifyToken, (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'text is required' });
  getDb().run('INSERT INTO todos (text, user_id) VALUES (?, ?)', [text, req.user.id]);
  save();
  const row = get('SELECT * FROM todos WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id]);
  res.status(201).json(toApi(row));
});

app.patch('/api/todos/:id', verifyToken, (req, res) => {
  const row = get('SELECT * FROM todos WHERE id = ? AND user_id = ?', [+req.params.id, req.user.id]);
  if (!row) return res.status(404).json({ error: 'not found' });
  const text = req.body.text !== undefined ? String(req.body.text).trim() : row.text;
  const done = req.body.done !== undefined ? (req.body.done ? 1 : 0) : row.done;
  if (!text) return res.status(400).json({ error: 'text is required' });
  getDb().run('UPDATE todos SET text = ?, done = ? WHERE id = ?', [text, done, row.id]);
  save();
  res.json(toApi(get('SELECT * FROM todos WHERE id = ? AND user_id = ?', [+req.params.id, req.user.id])));
});

app.delete('/api/todos/:id', verifyToken, (req, res) => {
  const row = get('SELECT * FROM todos WHERE id = ? AND user_id = ?', [+req.params.id, req.user.id]);
  if (!row) return res.status(404).json({ error: 'not found' });
  getDb().run('DELETE FROM todos WHERE id = ?', [+req.params.id]);
  save();
  res.json({ ok: true });
});

// === Admin Routes ===
app.get('/api/admin/users', isAdmin, (req, res) => {
  const users = all('SELECT id, email, is_admin, created_at FROM users ORDER BY id ASC');
  res.json(users);
});

app.get('/api/admin/users/:id', isAdmin, (req, res) => {
  const user = get('SELECT id, email, is_admin, created_at FROM users WHERE id = ?', [+req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/api/admin/users/:id', isAdmin, async (req, res) => {
  const userId = +req.params.id;
  const user = get('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const email = req.body.email ? String(req.body.email).trim().toLowerCase() : user.email;
  const is_admin = req.body.is_admin !== undefined ? (req.body.is_admin ? 1 : 0) : user.is_admin;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  if (user.is_admin && !is_admin) {
    const adminCount = get('SELECT COUNT(*) as c FROM users WHERE is_admin = 1').c;
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'Cannot remove admin status from the last admin' });
    }
  }

  let passwordHash = user.password_hash;
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    passwordHash = await bcrypt.hash(req.body.password, 10);
  }

  getDb().run(
    'UPDATE users SET email = ?, password_hash = ?, is_admin = ? WHERE id = ?',
    [email, passwordHash, is_admin, userId]
  );
  save();
  res.json({ ok: true });
});

// === Start Server ===
init().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`Backend listening on http://0.0.0.0:${PORT}`));
}).catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});