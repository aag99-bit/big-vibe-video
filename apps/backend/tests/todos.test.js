const request = require('supertest');
const API_URL = 'http://localhost:3001';

describe('Todos API', () => {
  let user1 = {
    email: `test-todos-1-${Date.now()}@test.com`,
    password: 'Password1'
  };
  let user2 = {
    email: `test-todos-2-${Date.now()}@test.com`,
    password: 'Password1'
  };
  let token1 = '';
  let token2 = '';

  beforeAll(async () => {
    // Register User 1
    await request(API_URL).post('/api/auth/register').send(user1);
    const login1 = await request(API_URL).post('/api/auth/login').send(user1);
    token1 = login1.body.token;

    // Register User 2
    await request(API_URL).post('/api/auth/register').send(user2);
    const login2 = await request(API_URL).post('/api/auth/login').send(user2);
    token2 = login2.body.token;
  });

  it('should create a todo with token (201)', async () => {
    const res = await request(API_URL)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ text: 'Test Todo' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should not create a todo without token (401)', async () => {
    const res = await request(API_URL)
      .post('/api/todos')
      .send({ text: 'No Token Todo' });
    expect(res.status).toBe(401);
  });

  it('should get only own todos', async () => {
    // Create another todo for user 2
    await request(API_URL)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token2}`)
      .send({ text: 'User 2 Todo' });

    const res = await request(API_URL)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token1}`);
    
    expect(res.status).toBe(200);
    const todos = res.body;
    const user2Todo = todos.find(t => t.text === 'User 2 Todo');
    expect(user2Todo).toBeUndefined();
  });

  it('should mark todo as completed (PATCH)', async () => {
    const getRes = await request(API_URL)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token1}`);
    const todoId = getRes.body[0].id;

    const res = await request(API_URL)
      .patch(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ done: true })
    
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  it('should delete a todo (DELETE)', async () => {
    const getRes = await request(API_URL)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token1}`);
    const todoId = getRes.body[0].id;

    const res = await request(API_URL)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token1}`);
    
    expect(res.status).toBe(200);
  });

  it('should not delete someone else\'s todo (404)', async () => {
    // Create todo for user 2
    const createRes = await request(API_URL)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token2}`)
      .send({ text: 'User 2 Todo' });
    const todoId = createRes.body.id;

    const res = await request(API_URL)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token1}`);
    
    expect(res.status).toBe(404);
  });
});
