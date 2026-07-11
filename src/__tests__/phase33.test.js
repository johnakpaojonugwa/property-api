import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 33: API endpoint validation', () => {
  it('should have health endpoint accessible', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route-that-does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should have correct content-type for JSON responses', async () => {
    const res = await request(app).get('/health');

    expect(res.type).toBe('application/json');
  });

  it('should have security headers on responses', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should reject requests with duplicate query parameters', async () => {
    const res = await request(app).get('/health?foo=bar&foo=baz');

    expect(res.status).toBe(400);
  });
});
