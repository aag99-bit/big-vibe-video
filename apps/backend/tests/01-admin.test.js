const request = require('supertest');

const BASE_URL = 'http://localhost:3001';

describe('Admin API', () => {
  const adminUser = {
    email: `test-admin-${Date.now()}@test.com`,
    password: 'Password1'
  };
  const regularUser = {
    email: `test-regular-${Date.now()}@test.com`,
    password: 'Password1'
  };
  let adminToken = '';
  let regularToken = '';
  let adminId = 0;

  beforeAll(async () => {
    // Регистрируем первого пользователя (должен стать админом)
    const res1 = await request(BASE_URL)
      .post('/api/auth/register')
      .send(adminUser);
    expect(res1.status).toBe(201);
    expect(res1.body.is_admin).toBe(true);

    // Логинимся как админ
    const login1 = await request(BASE_URL)
      .post('/api/auth/login')
      .send(adminUser);
    adminToken = login1.body.token;
    adminId = login1.body.user.id;

    // Регистрируем второго пользователя (обычный)
    const res2 = await request(BASE_URL)
      .post('/api/auth/register')
      .send(regularUser);
    expect(res2.status).toBe(201);
    expect(res2.body.is_admin).toBe(false);

    // Логинимся как обычный пользователь
    const login2 = await request(BASE_URL)
      .post('/api/auth/login')
      .send(regularUser);
    regularToken = login2.body.token;
  });

  describe('GET /api/admin/users', () => {
    it('should return all users for admin (200)', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should reject without token (401)', async () => {
      const response = await request(BASE_URL).get('/api/admin/users');
      expect(response.status).toBe(401);
    });

    it('should reject regular user (403)', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${regularToken}`);
      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should return user by id for admin (200)', async () => {
      const response = await request(BASE_URL)
        .get(`/api/admin/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(adminId);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(BASE_URL)
        .get('/api/admin/users/999999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update user email (200)', async () => {
      const newEmail = `test-regular-updated-${Date.now()}@test.com`;
      const response = await request(BASE_URL)
        .put(`/api/admin/users/${adminId + 1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: newEmail });
      expect(response.status).toBe(200);
    });

    it('should reject regular user (403)', async () => {
      const response = await request(BASE_URL)
        .put(`/api/admin/users/${adminId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ email: 'test@test.com' });
      expect(response.status).toBe(403);
    });

    it('should prevent removing last admin status (400)', async () => {
      const response = await request(BASE_URL)
        .put(`/api/admin/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_admin: false });
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/last admin/i);
    });
  });
});