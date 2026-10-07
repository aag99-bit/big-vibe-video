const request = require('supertest');

const BASE_URL = 'http://localhost:3001';

describe('Auth API', () => {
  const testUser = {
    email: `test-auth-${Date.now()}@test.com`,
    password: 'Password1'
  };
  let token = '';

  describe('POST /api/auth/register', () => {
    it('should register a new user (201)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send(testUser);
      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
    });

    it('should reject duplicate email (400)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send(testUser);
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/already registered/i);
    });

    it('should reject invalid email without @ (400)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send({ email: 'invalidemail', password: 'Password1' });
      expect(response.status).toBe(400);
    });

    it('should reject invalid email without dot (400)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send({ email: 'test@invalid', password: 'Password1' });
      expect(response.status).toBe(400);
    });

    it('should reject empty email (400)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send({ email: '', password: 'Password1' });
      expect(response.status).toBe(400);
    });

    it('should reject empty password (400)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send({ email: `test-${Date.now()}@test.com`, password: '' });
      expect(response.status).toBe(400);
    });

    it('should reject password shorter than 6 chars (400)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send({ email: `test-${Date.now()}@test.com`, password: '12345' });
      expect(response.status).toBe(400);
    });

    it('should accept password exactly 6 chars', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send({ email: `test-${Date.now()}@test.com`, password: '123456' });
      expect(response.status).toBe(201);
    });

    it('should trim email', async () => {
      const email = `  test-${Date.now()}@test.com  `;
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send({ email, password: 'Password1' });
      expect(response.status).toBe(201);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials and return token', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send(testUser);
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email.toLowerCase());
      token = response.body.token;
    });

    it('should reject wrong password (401)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword1' });
      expect(response.status).toBe(401);
    });

    it('should reject non-existent email (401)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: `nonexistent-${Date.now()}@test.com`, password: 'Password1' });
      expect(response.status).toBe(401);
    });

    it('should reject empty fields (401)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: '', password: '' });
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/user/profile', () => {
    it('should get profile with token (200)', async () => {
      const response = await request(BASE_URL)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(testUser.email.toLowerCase());
    });

    it('should reject without token (401)', async () => {
      const response = await request(BASE_URL).get('/api/user/profile');
      expect(response.status).toBe(401);
    });

    it('should reject with garbage token (401)', async () => {
      const response = await request(BASE_URL)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer garbage-token-123');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 200 (stateless)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
  });
});