import { describe, expect, it, vi, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../app.js';
import { env } from '../config/env.js';
import Merchant from '../models/merchant.model.js';

const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Admin-Only Merchant Verification Tests', () => {
  const userToken = generateToken({ id: 'user-123', role: 'USER' });
  const agentToken = generateToken({ id: 'agent-123', role: 'AGENT' });
  const merchantToken = generateToken({ id: 'merchant-123', role: 'MERCHANT' });
  const adminToken = generateToken({ id: 'admin-123', role: 'ADMIN' });

  beforeAll(() => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);
  });

  describe('Unauthenticated and Non-Admin Access', () => {
    it('blocks unauthenticated requests with 401', async () => {
      const patchRes = await request(app)
        .patch('/v1/admin/merchants/merchant-123/verification')
        .set('X-Test-No-Fallback', 'true')
        .send({ is_verified: true });
      expect(patchRes.status).toBe(401);

      const postRes = await request(app)
        .post('/v1/admin/merchants/merchant-123/verify')
        .set('X-Test-No-Fallback', 'true')
        .send({ is_verified: true });
      expect(postRes.status).toBe(401);
    });

    it('blocks USER role with 403', async () => {
      const res = await request(app)
        .patch('/v1/admin/merchants/merchant-123/verification')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ is_verified: true });
      expect(res.status).toBe(403);
    });

    it('blocks AGENT role with 403', async () => {
      const res = await request(app)
        .patch('/v1/admin/merchants/merchant-123/verification')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ is_verified: true });
      expect(res.status).toBe(403);
    });

    it('blocks MERCHANT role with 403', async () => {
      const res = await request(app)
        .patch('/v1/admin/merchants/merchant-123/verification')
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({ is_verified: true });
      expect(res.status).toBe(403);
    });
  });

  describe('Admin Verification Access', () => {
    it('allows ADMIN to verify a merchant (PATCH /verification)', async () => {
      const mockMerchant = {
        _id: 'merchant-123',
        full_name: 'Test Merchant',
        email: 'merchant@test.com',
        is_verified: true,
      };

      vi.spyOn(Merchant, 'findByIdAndUpdate').mockReturnValue({ lean: () => Promise.resolve(mockMerchant) });

      const res = await request(app)
        .patch('/v1/admin/merchants/merchant-123/verification')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_verified: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_verified).toBe(true);
      expect(res.body.data._id).toBe('merchant-123');
    });

    it('allows ADMIN to verify a merchant (POST /verify)', async () => {
      const mockMerchant = {
        _id: 'merchant-123',
        full_name: 'Test Merchant',
        email: 'merchant@test.com',
        is_verified: true,
      };

      vi.spyOn(Merchant, 'findByIdAndUpdate').mockReturnValue({ lean: () => Promise.resolve(mockMerchant) });

      const res = await request(app)
        .post('/v1/admin/merchants/merchant-123/verify')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_verified: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_verified).toBe(true);
    });

    it('rejects verification if is_verified is missing (400)', async () => {
      const res = await request(app)
        .patch('/v1/admin/merchants/merchant-123/verification')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}); // missing is_verified

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects verification if is_verified is not a boolean (400)', async () => {
      const res = await request(app)
        .patch('/v1/admin/merchants/merchant-123/verification')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_verified: 'yes' });

      expect(res.status).toBe(400);
    });

    it('returns 404 if merchant does not exist', async () => {
      vi.spyOn(Merchant, 'findByIdAndUpdate').mockReturnValue({ lean: () => Promise.resolve(null) });

      const res = await request(app)
        .patch('/v1/admin/merchants/nonexistent-123/verification')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_verified: true });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Merchant not found');
    });
  });
});
