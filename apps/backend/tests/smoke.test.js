const request = require('supertest');

const BASE_URL = 'http://localhost:3001';

describe('Smoke Tests', () => {
  it('GET /api/health should return 200', async () => {
    const response = await request(BASE_URL).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it('GET /api/health should return correct body', async () => {
    const response = await request(BASE_URL).get('/api/health');
    expect(response.body.ok).toBe(true);
    expect(Object.keys(response.body)).toHaveLength(1);
  });

  it('GET /api/unknown-route should return 404', async () => {
    const response = await request(BASE_URL).get('/api/unknown-route');
    expect(response.status).toBe(404);
  });
});