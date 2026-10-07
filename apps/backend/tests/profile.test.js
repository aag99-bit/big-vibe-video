const request = require('supertest');

const BASE_URL = 'http://localhost:3001';

describe('Profile API', () => {
  const user1 = {
    email: `test-profile-1-${Date.now()}@test.com`,
    password: 'Password1'
  };
  const user2 = {
    email: `test-profile-2-${Date.now()}@test.com`,
    password: 'Password1'
  };
  let token1 = '';
  let token2 = '';

  beforeAll(async () => {
    await request(BASE_URL).post('/api/auth/register').send(user1);
    await request(BASE_URL).post('/api/auth/register').send(user2);
    const res1 = await request(BASE_URL).post('/api/auth/login').send(user1);
    token1 = res1.body.token;
    const res2 = await request(BASE_URL).post('/api/auth/login').send(user2);
    token2 = res2.body.token;
  });

  describe('PUT /api/user/profile', () => {
    it('should change email successfully', async () => {
      const newEmail = `test-profile-1-updated-${Date.now()}@test.com`;
      const response = await request(BASE_URL)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${token1}`)
        .send({ email: newEmail });
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      user1.email = newEmail;
    });

    it('should login with new email', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send(user1);
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    it('should reject login with old email (401)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: `test-profile-1-${Date.now()}@test.com`, password: 'Password1' });
      expect(response.status).toBe(401);
    });

    it('should reject invalid email (400)', async () => {
      const response = await request(BASE_URL)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${token1}`)
        .send({ email: 'invalid-email' });
      expect(response.status).toBe(400);
    });

    it('should reject email taken by another user (400)', async () => {
      const response = await request(BASE_URL)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${token1}`)
        .send({ email: user2.email });
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/already taken/i);
    });

    it('should reject without token (401)', async () => {
      const response = await request(BASE_URL)
        .put('/api/user/profile')
        .send({ email: 'test@test.com' });
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    const newPassword = 'NewPassword1';

    it('should reset password successfully', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/reset-password')
        .send({ email: user1.email, newPassword });
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });

    it('should login with new password', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: user1.email, password: newPassword });
      expect(response.status).toBe(200);
    });

    it('should reject login with old password (401)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: user1.email, password: 'Password1' });
      expect(response.status).toBe(401);
    });

    it('should reject weak new password (400)', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/reset-password')
        .send({ email: user1.email, newPassword: '12345' });
      expect(response.status).toBe(400);
    });
  });
});