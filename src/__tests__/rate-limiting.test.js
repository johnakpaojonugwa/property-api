import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import redisService from '../services/redis.service.js';

describe('Token Bucket Rate Limiting Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/property-platform';
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('enforces global rate limiting of 100 requests', async () => {
    // Perform multiple fast requests to ensure it correctly returns headers
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['ratelimit-limit']).toBe('100');
    expect(res.headers['ratelimit-remaining']).toBeDefined();
    expect(Number.parseInt(res.headers['ratelimit-remaining'], 10)).toBeLessThan(100);
    expect(res.headers['ratelimit-reset']).toBeDefined();
  });

  it('enforces auth rate limiter (5 requests max) and returns 429 with correct body', async () => {
    const testIp = '192.168.88.88';

    // 1. First 5 requests should pass validation (auth checks fail with 401/400 but not 429)
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/v1/auth/login')
        .set('X-Forwarded-For', testIp)
        .send({ email: 'nonexistent-rate-limit-test@example.com', password: 'wrongpassword' });
      
      // Since credentials are invalid, it throws 401, not 429
      expect(res.status).toBe(401);
      expect(res.headers['ratelimit-limit']).toBe('5');
      expect(res.headers['ratelimit-remaining']).toBe(String(4 - i));
    }

    // 2. The 6th request must trigger the rate limit error (429)
    const blockedRes = await request(app)
      .post('/v1/auth/login')
      .set('X-Forwarded-For', testIp)
      .send({ email: 'nonexistent-rate-limit-test@example.com', password: 'wrongpassword' });

    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers['ratelimit-remaining']).toBe('0');
    expect(blockedRes.headers['ratelimit-reset']).toBeDefined();
    expect(blockedRes.body.success).toBe(false);
    expect(blockedRes.body.message).toContain('Too many login attempts');
    expect(blockedRes.body.errors).toBeDefined();
    expect(blockedRes.body.errors[0].message).toContain('Brute-force protection: Rate limit exceeded.');
    expect(blockedRes.body.errors[0].resetTime).toBeDefined();
  }, 20000);
});
