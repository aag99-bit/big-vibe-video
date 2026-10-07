const { init, getDb, save } = require('../db');

// Хелпер в стиле server.js (sql.js API: bind → step → getAsObject → free)
function get(sql, params = []) {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  let row = null;
  if (stmt.step()) row = stmt.getAsObject();
  stmt.free();
  return row;
}

async function clean() {
  await init();
  const db = getDb();

  const beforeUsers = get(
    'SELECT COUNT(*) as c FROM users WHERE email LIKE ?',
    ['test-%@test.com']
  ).c;
  const beforeTodos = get(
    'SELECT COUNT(*) as c FROM todos WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)',
    ['test-%@test.com']
  ).c;

  db.run('DELETE FROM todos WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', ['test-%@test.com']);
  db.run('DELETE FROM users WHERE email LIKE ?', ['test-%@test.com']);
  save();

  console.log(`✓ Cleaned: ${beforeUsers} test users, ${beforeTodos} test todos`);
  process.exit(0);
}

clean().catch(err => {
  console.error('✗ Clean failed:', err);
  process.exit(1);
});