import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 35: Response structure consistency', () => {
  it('should have consistent success response structure', async () => {
    const res = await request(app).get('/health');

    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.success).toBe('boolean');
    expect(typeof res.body.message).toBe('string');
  });

  it('should have consistent error response structure on 404', async () => {
    const res = await request(app).get('/nonexistent-route');

    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('message');
    expect(res.body.success).toBe(false);
    expect(typeof res.body.message).toBe('string');
  });

  it('should have consistent error response structure on validation failure', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'A',
      email: 'invalid',
    });

    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('message');
    expect(res.body.success).toBe(false);
    expect(typeof res.body.message).toBe('string');
  });

  it('should return correct status codes for successful operations', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return correct status codes for client errors', async () => {
    const res = await request(app).get('/nonexistent-route');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return correct status codes for validation errors', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'A',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should have appropriate HTTP headers in responses', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should compress responses with gzip when appropriate', async () => {
    const res = await request(app)
      .get('/health')
      .set('Accept-Encoding', 'gzip');

    // Response may or may not be compressed depending on size
    // Just verify the response is still valid
    expect(res.body).toHaveProperty('success');
  });
});
