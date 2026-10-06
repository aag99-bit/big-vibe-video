const request = require('supertest');

const BASE_URL = 'http://localhost:3001';

describe('Smoke Tests', () => {
  it('GET /api/health should return 200', async () => {
    const response = await request(BASE_URL).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
