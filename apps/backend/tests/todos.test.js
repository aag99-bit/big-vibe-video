const request = require('supertest');

const BASE_URL = 'http://localhost:3001';

describe('Todos API', () => {
  const testUser = {
    email: `test-todos-${Date.now()}@test.com`,
    password: 'Password1'
  };
  let token = '';
  let todoId = 0;

  beforeAll(async () => {
    await request(BASE_URL).post('/api/auth/register').send(testUser);
    const res = await request(BASE_URL).post('/api/auth/login').send(testUser);
    token = res.body.token;
  });

  describe('POST /api/todos', () => {
    it('should create a todo with token (201)', async () => {
      const response = await request(BASE_URL)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Test todo' });
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.text).toBe('Test todo');
      expect(response.body.done).toBe(false);
      todoId = response.body.id;
    });

    it('should reject without token (401)', async () => {
      const response = await request(BASE_URL)
        .post('/api/todos')
        .send({ text: 'Test todo' });
      expect(response.status).toBe(401);
    });

    it('should reject empty text (400)', async () => {
      const response = await request(BASE_URL)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: '' });
      expect(response.status).toBe(400);
    });

    it('should reject whitespace-only text (400)', async () => {
      const response = await request(BASE_URL)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: '   ' });
      expect(response.status).toBe(400);
    });

    it('should trim text', async () => {
      const response = await request(BASE_URL)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: '  Trim me  ' });
      expect(response.status).toBe(201);
      expect(response.body.text).toBe('Trim me');
    });

    it('should accept emoji', async () => {
      const response = await request(BASE_URL)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: '🎉 Party time!' });
      expect(response.status).toBe(201);
      expect(response.body.text).toBe('🎉 Party time!');
    });

    it('should accept long text (1000 chars)', async () => {
      const longText = 'A'.repeat(1000);
      const response = await request(BASE_URL)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: longText });
      expect(response.status).toBe(201);
      expect(response.body.text).toBe(longText);
    });
  });

  describe('GET /api/todos', () => {
    it('should return only own todos', async () => {
      const response = await request(BASE_URL)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return empty list for new user', async () => {
      const newUser = { email: `test-todos-empty-${Date.now()}@test.com`, password: 'Password1' };
      await request(BASE_URL).post('/api/auth/register').send(newUser);
      const res = await request(BASE_URL).post('/api/auth/login').send(newUser);
      const response = await request(BASE_URL)
        .get('/api/todos')
        .set('Authorization', `Bearer ${res.body.token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should filter active todos', async () => {
      const response = await request(BASE_URL)
        .get('/api/todos?filter=active')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      response.body.forEach(todo => expect(todo.done).toBe(false));
    });

    it('should filter done todos', async () => {
      const response = await request(BASE_URL)
        .get('/api/todos?filter=done')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      response.body.forEach(todo => expect(todo.done).toBe(true));
    });
  });

  describe('PATCH /api/todos/:id', () => {
    it('should mark todo as done (PATCH)', async () => {
      const response = await request(BASE_URL)
        .patch(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ done: true });
      expect(response.status).toBe(200);
      expect(response.body.done).toBe(true);
    });

    it('should unmark todo as done', async () => {
      const response = await request(BASE_URL)
        .patch(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ done: false });
      expect(response.status).toBe(200);
      expect(response.body.done).toBe(false);
    });

    it('should update text', async () => {
      const response = await request(BASE_URL)
        .patch(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Updated text' });
      expect(response.status).toBe(200);
      expect(response.body.text).toBe('Updated text');
    });

    it('should reject without token (401)', async () => {
      const response = await request(BASE_URL)
        .patch(`/api/todos/${todoId}`)
        .send({ done: true });
      expect(response.status).toBe(401);
    });

    it('should reject non-existent id (404)', async () => {
      const response = await request(BASE_URL)
        .patch('/api/todos/999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ done: true });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo (DELETE)', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });

    it('should reject without token (401)', async () => {
      const response = await request(BASE_URL)
        .delete(`/api/todos/${todoId}`);
      expect(response.status).toBe(401);
    });

    it('should reject non-existent id (404)', async () => {
      const response = await request(BASE_URL)
        .delete('/api/todos/999999')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(404);
    });
  });
});