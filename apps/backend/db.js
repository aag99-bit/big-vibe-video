const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DB_PATH = path.join(dataDir, 'todo.db');

let SQL;
let db;

async function init() {
  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // 1. Создаём таблицу users (если её ещё нет)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 2. === НОВОЕ: Добавляем колонку is_admin (безопасно, с try-catch) ===
  try {
    db.run(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0;`);
  } catch (e) {
    // Игнорируем ошибку, если колонка уже существует (sql.js пишет "duplicate column name")
    if (!e.message.includes('duplicate column')) {
      throw e; // Если ошибка другая (не про дубликат), пробрасываем её
    }
  }
  // ================================================================

  // 3. Добавляем user_id в таблицу todos (твой старый код)
  try {
    db.run(`ALTER TABLE todos ADD COLUMN user_id INTEGER;`);
  } catch (e) {
    // Column already exists
  }

  // 4. Создаём таблицу todos (если её ещё нет)
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  
  save();
  return db;
}

function save() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDb() {
  return db;
}

module.exports = { init, save, getDb };