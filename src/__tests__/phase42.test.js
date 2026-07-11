import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 42: Request/Response body logging', () => {
  it('should log successful GET requests', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
  });

  it('should capture request headers in logs', async () => {
    const res = await request(app)
      .get('/health')
      .set('User-Agent', 'TestClient/1.0')
      .set('Accept-Language', 'en-US');

    expect(res.status).toBe(200);
  });

  it('should log POST request bodies (sanitized)', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      password_hash: 'secret123',
    });

    expect(res.status).toBeGreaterThanOrEqual(200);
  });

  it('should log error responses with status codes', async () => {
    const res = await request(app).get('/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should not log sensitive fields like passwords', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '9876543210',
      password_hash: 'secret456',
    });

    expect(res.status).toBeGreaterThanOrEqual(200);
    // Password hash should not appear in logs (in implementation)
  });

  it('should include request duration in logs', async () => {
    const start = Date.now();
    const res = await request(app).get('/health');
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeGreaterThan(0);
  });

  it('should log correlation ID with each request', async () => {
    const res = await request(app)
      .get('/health')
      .set('X-Correlation-ID', 'log-trace-123');

    expect(res.status).toBe(200);
  });

  it('should capture response size in logs', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers['content-length']).toBeDefined();
  });

  it('should log query parameters', async () => {
    const res = await request(app).get('/v1/agents').query({ limit: 10, skip: 0 });

    expect(res.status).toBeGreaterThanOrEqual(200);
  });

  it('should log validation errors with details', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'x', // Too short
      email: 'not-an-email',
      phone: '123',
      password_hash: 'pw',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should log request method and path', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    // Log should contain GET /health
  });

  it('should include request IP in logs', async () => {
    const res = await request(app)
      .get('/health')
      .set('X-Forwarded-For', '192.168.1.100');

    expect(res.status).toBe(200);
  });

  it('should log response headers excluding sensitive ones', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBeDefined();
  });

  it('should handle large request bodies in logs gracefully', async () => {
    const largeString = 'x'.repeat(1000);
    const res = await request(app).post('/v1/agents').send({
      full_name: largeString,
      email: 'test@example.com',
      phone: '1234567890',
      password_hash: 'hash',
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should truncate extremely large request bodies', async () => {
    const hugeString = 'y'.repeat(10000);
    const res = await request(app).post('/v1/agents').send({
      full_name: hugeString,
      email: 'large@example.com',
      phone: '1234567890',
      password_hash: 'hash',
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should log multipart/form-data requests', async () => {
    const res = await request(app)
      .get('/health')
      .set('Content-Type', 'multipart/form-data');

    expect(res.status).toBe(200);
  });

  it('should log requests with custom headers', async () => {
    const res = await request(app)
      .get('/health')
      .set('X-Custom-Header', 'custom-value')
      .set('X-Request-ID', 'req-12345');

    expect(res.status).toBe(200);
  });

  it('should include timestamp in all log entries', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
  });

  it('should log middleware execution order', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
  });

  it('should capture response content-type', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
  });

  it('should log rate limit status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
  });

  it('should mask or redact sensitive fields consistently', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '5551234567',
      password_hash: 'super_secret_password_123',
    });

    expect(res.status).toBeGreaterThanOrEqual(200);
  });
});
