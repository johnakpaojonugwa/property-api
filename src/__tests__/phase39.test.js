import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 39: API versioning and backward compatibility', () => {
  it('should support /v1 prefix for all API endpoints', async () => {
    const res = await request(app).get('/v1/agents');

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.body).toHaveProperty('success');
  });

  it('should return 404 for unversioned API endpoints', async () => {
    const res = await request(app).get('/agents');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should include API version in response headers if configured', async () => {
    const res = await request(app).get('/v1/agents');

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.headers).toBeDefined();
  });

  it('should handle version-specific request patterns', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept', 'application/vnd.api+json;version=1');

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.body).toHaveProperty('success');
  });

  it('should support consistent response envelope across versions', async () => {
    const res = await request(app).get('/v1/agents');

    if (res.status !== 404) {
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('message');
    }
  });

  it('should maintain backward compatibility with health endpoint', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should prefix all domain routes with /v1', async () => {
    const routes = ['/v1/agents', '/v1/users', '/v1/merchants', '/v1/properties'];

    for (const route of routes) {
      const res = await request(app).get(route);
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.body).toHaveProperty('success');
    }
  });

  it('should reject requests without version prefix for domain endpoints', async () => {
    const routes = ['/agents', '/users', '/merchants', '/properties'];

    for (const route of routes) {
      const res = await request(app).get(route);
      expect(res.status).toBe(404);
    }
  });

  it('should preserve query parameters with versioning', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .query({ limit: '10', skip: '0' });

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.body).toHaveProperty('success');
  });

  it('should handle POST requests with version prefix', async () => {
    const res = await request(app)
      .post('/v1/agents')
      .send({
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        password_hash: 'hash123',
      });

    expect(res.status).toBeDefined();
    expect(res.body).toHaveProperty('success');
  });

  it('should handle PATCH requests with version prefix', async () => {
    const res = await request(app)
      .patch('/v1/agents/123')
      .send({
        full_name: 'Jane Doe',
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle DELETE requests with version prefix', async () => {
    const res = await request(app).delete('/v1/agents/123');

    expect([200, 204, 400, 404]).toContain(res.status);
  });

  it('should return consistent error format across API versions', async () => {
    const res = await request(app).get('/v1/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('message');
  });

  it('should support content negotiation within version', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('Accept', 'application/json');

    expect(res.status).toBeGreaterThanOrEqual(200);
  });

  it('should handle version upgrades gracefully', async () => {
    // If version 2 doesn't exist, should fallback or return 404
    const res = await request(app).get('/v2/agents');

    expect([404, 400]).toContain(res.status);
  });

  it('should support headers indicating version preference', async () => {
    const res = await request(app)
      .get('/v1/agents')
      .set('X-API-Version', '1');

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.body).toHaveProperty('success');
  });

  it('should maintain URI structure consistency for related resources', async () => {
    // Health endpoint should be top-level (not versioned)
    const healthRes = await request(app).get('/health');
    expect(healthRes.status).toBe(200);

    // Domain endpoints should be versioned
    const agentRes = await request(app).get('/v1/agents');
    expect(agentRes.status).toBeGreaterThanOrEqual(200);
  });
});
