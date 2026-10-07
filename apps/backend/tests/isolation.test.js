const request = require('supertest');

const BASE_URL = 'http://localhost:3001';

describe('Isolation Tests', () => {
  const userA = {
    email: `test-isolation-a-${Date.now()}@test.com`,
    password: 'Password1'
  };
  const userB = {
    email: `test-isolation-b-${Date.now()}@test.com`,
    password: 'Password1'
  };
  let tokenA = '';
  let tokenB = '';
  let todoA = 0;
  let todoB = 0;

  beforeAll(async () => {
    await request(BASE_URL).post('/api/auth/register').send(userA);
    await request(BASE_URL).post('/api/auth/register').send(userB);
    const resA = await request(BASE_URL).post('/api/auth/login').send(userA);
    tokenA = resA.body.token;
    const resB = await request(BASE_URL).post('/api/auth/login').send(userB);
    tokenB = resB.body.token;

    const resTodoA = await request(BASE_URL)
      .post('/api/todos')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ text: 'Todo A' });
    todoA = resTodoA.body.id;

    const resTodoB = await request(BASE_URL)
      .post('/api/todos')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ text: 'Todo B' });
    todoB = resTodoB.body.id;
  });

  it('A should not see B todos in GET', async () => {
    const response = await request(BASE_URL)
      .get('/api/todos')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(response.status).toBe(200);
    const ids = response.body.map(t => t.id);
    expect(ids).toContain(todoA);
    expect(ids).not.toContain(todoB);
  });

  it('B should not see A todos in GET', async () => {
    const response = await request(BASE_URL)
      .get('/api/todos')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(response.status).toBe(200);
    const ids = response.body.map(t => t.id);
    expect(ids).toContain(todoB);
    expect(ids).not.toContain(todoA);
  });

  it('A cannot PATCH B todo (404)', async () => {
    const response = await request(BASE_URL)
      .patch(`/api/todos/${todoB}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ done: true });
    expect(response.status).toBe(404);
  });

  it('A cannot DELETE B todo (404)', async () => {
    const response = await request(BASE_URL)
      .delete(`/api/todos/${todoB}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(response.status).toBe(404);
  });

  it('A filter=active does not leak to B', async () => {
    const response = await request(BASE_URL)
      .get('/api/todos?filter=active')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(response.status).toBe(200);
    const ids = response.body.map(t => t.id);
    expect(ids).not.toContain(todoA);
  });

  it('A deletion does not affect B', async () => {
    await request(BASE_URL)
      .delete(`/api/todos/${todoA}`)
      .set('Authorization', `Bearer ${tokenA}`);

    const response = await request(BASE_URL)
      .get('/api/todos')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(response.status).toBe(200);
    const ids = response.body.map(t => t.id);
    expect(ids).toContain(todoB);
  });

  it('Separate counts', async () => {
    const resA = await request(BASE_URL)
      .get('/api/todos')
      .set('Authorization', `Bearer ${tokenA}`);
    const resB = await request(BASE_URL)
      .get('/api/todos')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(resA.body.length).toBe(0);
    expect(resB.body.length).toBe(1);
  });

  it('Logout A does not affect B', async () => {
    await request(BASE_URL)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${tokenA}`);

    const response = await request(BASE_URL)
      .get('/api/todos')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(response.status).toBe(200);
  });
});