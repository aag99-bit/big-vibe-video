const request = require('supertest');
const API_URL = 'http://localhost:3001';

describe('Auth API', () => {
  let testUser = {
    email: `test-auth-${Date.now()}@test.com`,
    password: 'Password1'
  };
  let token = '';

  it('should register a new user (201)', async () => {
    const res = await request(API_URL)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.status).toBe(201);
  });

  it('should not register with same email (400)', async () => {
    const res = await request(API_URL)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.status).toBe(400);
  });

  it('should login with correct password and get token', async () => {
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send(testUser);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should not login with incorrect password (401)', async () => {
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  it('should get profile with token (200)', async () => {
    const res = await request(API_URL)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it('should not get profile without token (401)', async () => {
    const res = await request(API_URL)
      .get('/api/user/profile');
    expect(res.status).toBe(401);
  });
});
