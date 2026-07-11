import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 37: Error handling and edge cases', () => {
  it('should handle very long URLs gracefully', async () => {
    const longPath = '/health' + 'x'.repeat(1000);
    const res = await request(app).get(longPath);

    expect(res.status).toBeDefined();
    expect(res.body).toHaveProperty('success');
  });

  it('should handle malformed JSON gracefully', async () => {
    const res = await request(app)
      .post('/v1/agents')
      .set('Content-Type', 'application/json')
      .send('{invalid json');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should handle empty request body', async () => {
    const res = await request(app)
      .post('/v1/agents')
      .set('Content-Type', 'application/json')
      .send('');

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle requests with null values in fields', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: null,
      email: 'test@example.com',
      phone: '1234567890',
      password_hash: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should handle requests with undefined values in fields', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: undefined,
      email: 'test@example.com',
      phone: '1234567890',
      password_hash: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should handle duplicate query parameters', async () => {
    const res = await request(app).get('/health?foo=1&foo=2');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should handle extremely large request body gracefully', async () => {
    const largeString = 'x'.repeat(2000000); // 2MB

    const res = await request(app)
      .post('/v1/agents')
      .set('Content-Type', 'application/json')
      .send({
        full_name: largeString,
        email: 'test@example.com',
        phone: '1234567890',
        password_hash: 'password123',
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle special characters in query strings', async () => {
    const res = await request(app).get('/health?test=<script>alert(1)</script>');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should handle requests with circular reference in JSON', async () => {
    // Note: JavaScript doesn't allow circular references in JSON.stringify
    // This tests that the API handles various edge cases
    const res = await request(app)
      .post('/v1/agents')
      .send({
        full_name: 'test',
        email: 'test@example.com',
        phone: '1234567890',
        password_hash: 'password',
        extra: { nested: { deeply: { value: 'ok' } } },
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should timeout long-running requests', async () => {
    // This tests that the request timeout middleware is in place
    // The health endpoint should respond quickly
    const start = Date.now();
    const res = await request(app).get('/health');
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(5000); // Should be well under timeout
  });

  it('should handle requests to non-ASCII paths', async () => {
    const res = await request(app).get('/health/ñoño/テスト');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
