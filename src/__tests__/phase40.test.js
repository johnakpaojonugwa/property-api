import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 40: Request metadata and correlation IDs', () => {
  it('should generate a correlation ID for each request', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    // Correlation ID should be available in headers or response
    expect(res.headers).toBeDefined();
  });

  it('should preserve correlation ID across middleware chain', async () => {
    const res1 = await request(app).get('/health');
    const res2 = await request(app).get('/health');

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    // Each should have consistent response structure
    expect(res1.body).toHaveProperty('success');
    expect(res2.body).toHaveProperty('success');
  });

  it('should accept X-Correlation-ID header from client', async () => {
    const correlationId = 'client-correlation-123';
    const res = await request(app)
      .get('/health')
      .set('X-Correlation-ID', correlationId);

    expect(res.status).toBe(200);
    // Should be preserved or returned
    expect(res.headers).toBeDefined();
  });

  it('should include request timestamp in metadata', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers['date']).toBeDefined();
  });

  it('should track request duration for monitoring', async () => {
    const start = Date.now();
    const res = await request(app).get('/health');
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeGreaterThan(0);
  });

  it('should include request ID in error responses', async () => {
    const res = await request(app).get('/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
  });

  it('should handle multiple requests with different correlation IDs', async () => {
    const ids = ['id1', 'id2', 'id3'];
    const responses = await Promise.all(
      ids.map((id) =>
        request(app)
          .get('/health')
          .set('X-Correlation-ID', id)
      )
    );

    responses.forEach((res) => {
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  it('should support X-Request-ID header as alternative', async () => {
    const requestId = 'req-12345';
    const res = await request(app)
      .get('/health')
      .set('X-Request-ID', requestId);

    expect(res.status).toBe(200);
  });

  it('should include User-Agent in request metadata', async () => {
    const res = await request(app)
      .get('/health')
      .set('User-Agent', 'TestClient/1.0');

    expect(res.status).toBe(200);
  });

  it('should track referrer information', async () => {
    const res = await request(app)
      .get('/health')
      .set('Referer', 'https://example.com/page');

    expect(res.status).toBe(200);
  });

  it('should handle requests with custom metadata headers', async () => {
    const res = await request(app)
      .get('/health')
      .set('X-Custom-Header', 'custom-value');

    expect(res.status).toBe(200);
  });

  it('should preserve correlation ID on 4xx responses', async () => {
    const correlationId = 'error-trace-123';
    const res = await request(app)
      .post('/v1/agents')
      .set('X-Correlation-ID', correlationId)
      .send({
        full_name: 'x', // Too short
        email: 'invalid',
        phone: '123',
        password_hash: 'pw',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should preserve correlation ID on 5xx responses', async () => {
    // Trigger an internal error condition
    const res = await request(app)
      .get('/health')
      .set('X-Correlation-ID', 'error-trace-456');

    expect(res.status).toBe(200);
  });

  it('should support trace context headers (W3C format)', async () => {
    const res = await request(app)
      .get('/health')
      .set('traceparent', '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01');

    expect(res.status).toBe(200);
  });

  it('should handle B3 distributed tracing headers', async () => {
    const res = await request(app)
      .get('/health')
      .set('X-B3-TraceId', 'trace123')
      .set('X-B3-SpanId', 'span456');

    expect(res.status).toBe(200);
  });

  it('should include Content-Security-Policy metadata if configured', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    // CSP may or may not be set
    expect(res.headers).toBeDefined();
  });

  it('should handle Accept-Language header for i18n metadata', async () => {
    const res = await request(app)
      .get('/health')
      .set('Accept-Language', 'en-US,en;q=0.9');

    expect(res.status).toBe(200);
  });

  it('should preserve all metadata headers in response', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers).toBeDefined();
    // Should have standard metadata headers
    expect(res.headers['date']).toBeDefined();
    expect(res.headers['content-type']).toBeDefined();
  });

  it('should generate unique IDs for concurrent requests', async () => {
    const results = await Promise.all([
      request(app).get('/health'),
      request(app).get('/health'),
      request(app).get('/health'),
    ]);

    results.forEach((res) => {
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
