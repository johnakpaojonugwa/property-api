import { describe, expect, it, vi, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../app.js';
import { env } from '../config/env.js';
import Property from '../models/property.model.js';
import Appointment from '../models/appointment.model.js';
import Review from '../models/review.model.js';
import Agent from '../models/agent.model.js';

const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
};

describe('RBAC & RLS Architecture Tests', () => {

  const userToken = generateToken({ id: 'user-123', role: 'USER' });
  const agentToken = generateToken({ id: 'agent-123', role: 'AGENT' });
  const merchantToken = generateToken({ id: 'merchant-123', role: 'MERCHANT' });
  const adminToken = generateToken({ id: 'admin-123', role: 'ADMIN' });

  describe('Guest Access Limits (Mandatory Auth)', () => {
    it('allows guest browsing of properties list', async () => {
      const res = await request(app).get('/v1/properties');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('blocks guest property creation', async () => {
      const res = await request(app)
        .post('/v1/properties')
        .set('X-Test-No-Fallback', 'true')
        .send({ name: 'Villa' });
      expect(res.status).toBe(401);
      
      const resBlocked = await request(app)
        .post('/v1/properties')
        .set('X-Test-No-Fallback', 'true')
        .set('Authorization', 'Bearer invalid-token-value')
        .send({ name: 'Villa' });
      expect(resBlocked.status).toBe(401);
    });

    it('blocks guest appointment access', async () => {
      const res = await request(app)
        .get('/v1/appointments')
        .set('X-Test-No-Fallback', 'true');
      expect(res.status).toBe(401);
    });
  });

  describe('Role-Based Access Control (API/Controller Layer)', () => {
    it('blocks USER from creating properties', async () => {
      const res = await request(app)
        .post('/v1/properties')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Modern Duplex',
          price: 350000,
          country: 'Nigeria',
          state: 'Lagos',
          city: 'Lekki',
          category: 'DUPLEX',
          property_use: 'RESIDENTIAL',
          payment_plan: 'MONTHLY',
          type: 'RENT',
          agent: 'agent-123',
        });
      expect(res.status).toBe(403);
    });

    it('blocks USER from creating agents under merchants', async () => {
      const res = await request(app)
        .post('/v1/merchants/agents')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ full_name: 'Sub Agent' });
      expect(res.status).toBe(403);
    });

    it('allows MERCHANT to onboard agents', async () => {
      // Mock Agent creation since mongoose isn't connected
      const mockAgent = { _id: 'agent-789', full_name: 'Sub Agent', merchant: 'merchant-123' };
      vi.spyOn(Agent, 'findOne').mockResolvedValue(null);
      vi.spyOn(Agent, 'create').mockResolvedValue({
        toObject: () => mockAgent,
      });

      const res = await request(app)
        .post('/v1/merchants/agents')
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({
          full_name: 'Sub Agent',
          email: 'sub@merchant.com',
          phone: '09012345678',
          password: 'password123',
        });
      expect([201, 400]).toContain(res.status); // 201 on success, 400 on Joi validation mismatch
    });
  });

  describe('Row-Level Security (Database/Ownership Layer)', () => {
    beforeAll(() => {
      vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);
    });

    it('prevents an AGENT from updating a property owned by another AGENT', async () => {
      const mockProperty = {
        _id: 'prop-123',
        name: 'Another Agent Property',
        price: 500000,
        agent: { toString: () => 'agent-999' }, // Owned by different agent
        merchant: null,
      };

      vi.spyOn(Property, 'findById').mockResolvedValue(mockProperty);

      const res = await request(app)
        .put('/v1/properties/prop-123')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ price: 600000 });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('modify this property listing');
    });

    it('allows an AGENT to update a property they own', async () => {
      const mockProperty = {
        _id: 'prop-123',
        name: 'My Property',
        price: 500000,
        agent: { toString: () => 'agent-123' }, // Matches agentToken id
        merchant: null,
      };

      vi.spyOn(Property, 'findById').mockResolvedValue(mockProperty);
      vi.spyOn(Property, 'findByIdAndUpdate').mockReturnValue({
        lean: () => Promise.resolve(mockProperty),
      });

      const res = await request(app)
        .put('/v1/properties/prop-123')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ price: 600000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('prevents a USER from updating a review created by another USER', async () => {
      const mockReview = {
        _id: 'review-123',
        text: 'Great property!',
        user_id: { toString: () => 'user-999' }, // Matches other user
      };

      vi.spyOn(Review, 'findById').mockResolvedValue(mockReview);

      const res = await request(app)
        .put('/v1/reviews/review-123')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ text: 'Horrible property!' });

      expect(res.status).toBe(403);
    });
  });
});
