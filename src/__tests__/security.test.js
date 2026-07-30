import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { env } from '../config/env.js';

const generateTestToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET || 'secret');
};

describe('Security & Access Control Tests (Option 2)', () => {
  const userId = '60d5ec49f1b2c811845e2111';
  const otherUserId = '60d5ec49f1b2c811845e9999';

  const userToken = generateTestToken({ id: userId, role: 'USER' });
  const adminToken = generateTestToken({ id: 'admin-123', role: 'ADMIN' });

  it('should disallow standard user from privilege escalation via PUT /v1/users/:id', async () => {
    const res = await request(app)
      .put(`/v1/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Test-No-Fallback', 'true')
      .send({
        role: 'ADMIN',
      });

    // Should return 400 Bad Request due to Joi validation disallowing role
    expect(res.status).toBe(400);
  });

  it('should disallow standard user from viewing another user profile', async () => {
    const res = await request(app)
      .get(`/v1/users/${otherUserId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Test-No-Fallback', 'true');

    expect(res.status).toBe(403);
  });

  it('should disallow standard user from viewing another user wishlist', async () => {
    const res = await request(app)
      .get(`/v1/users/${otherUserId}/wishlist`)
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Test-No-Fallback', 'true');

    expect(res.status).toBe(403);
  });

  it('should disallow standard user from viewing another user properties', async () => {
    const res = await request(app)
      .get(`/v1/users/${otherUserId}/properties`)
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Test-No-Fallback', 'true');

    expect(res.status).toBe(403);
  });

  it('should allow standard user to view their own profile', async () => {
    const res = await request(app)
      .get(`/v1/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Test-No-Fallback', 'true');

    expect([200, 404]).toContain(res.status);
  });

  it('should allow admin user to view any user profile', async () => {
    const res = await request(app)
      .get(`/v1/users/${otherUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Test-No-Fallback', 'true');

    expect([200, 404]).toContain(res.status);
  });
});
