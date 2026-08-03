import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { env } from '../config/env.js';
import User from '../models/user.model.js';
import Agent from '../models/agent.model.js';
import Merchant from '../models/merchant.model.js';

const generateTestToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET || 'secret');
};

describe('Security Audit Fixes Verification', () => {
  let dbConnection;
  let bannedAgent;
  let bannedMerchant;
  let activeAgent;
  let activeMerchant;
  let activeUser;
  
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/property-platform';
    dbConnection = await mongoose.connect(mongoUri);

    // Clean up any stale test users/agents
    await User.deleteMany({ email: /audit-.*@example\.com/ });
    await Agent.deleteMany({ email: /audit-.*@example\.com/ });
    await Merchant.deleteMany({ email: /audit-.*@example\.com/ });

    // Seed deactivated agent & merchant
    bannedAgent = await Agent.create({
      full_name: 'Banned Agent',
      email: 'audit-banned-agent@example.com',
      phone: '1234567890',
      password_hash: '$2a$10$abcdefghijklmnopqrstuv',
      isActive: false,
      is_verified: true,
    });

    bannedMerchant = await Merchant.create({
      full_name: 'Banned Merchant',
      email: 'audit-banned-merchant@example.com',
      phone: '1234567890',
      password_hash: '$2a$10$abcdefghijklmnopqrstuv',
      isActive: false,
      is_verified: true,
    });

    activeAgent = await Agent.create({
      full_name: 'Active Agent',
      email: 'audit-active-agent@example.com',
      phone: '1234567890',
      password_hash: '$2a$10$abcdefghijklmnopqrstuv',
      isActive: true,
      is_verified: true,
    });

    activeMerchant = await Merchant.create({
      full_name: 'Active Merchant',
      email: 'audit-active-merchant@example.com',
      phone: '1234567890',
      password_hash: '$2a$10$abcdefghijklmnopqrstuv',
      isActive: true,
      is_verified: true,
    });

    activeUser = await User.create({
      first_name: 'Active',
      last_name: 'User',
      email: 'audit-active-user@example.com',
      phone: '1234567890',
      password_hash: '$2a$10$abcdefghijklmnopqrstuv',
      role: 'USER',
      isActive: true,
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /audit-.*@example\.com/ });
    await Agent.deleteMany({ email: /audit-.*@example\.com/ });
    await Merchant.deleteMany({ email: /audit-.*@example\.com/ });
    await mongoose.disconnect();
  });

  describe('Deactivated Agent & Merchant Enforcement', () => {
    it('should deny authenticated requests to deactivated Agents', async () => {
      const token = generateTestToken({ id: bannedAgent._id.toString(), role: 'AGENT', actor_type: 'AGENT' });
      const res = await request(app)
        .put('/v1/properties/some-prop-id')
        .set('Authorization', `Bearer ${token}`)
        .set('x-test-no-fallback', 'true')
        .send({ name: 'Valid New Name' });
      
      expect(res.status).toBe(403);
      expect(res.body.message).toContain('deactivated or banned');
    });

    it('should deny authenticated requests to deactivated Merchants', async () => {
      const token = generateTestToken({ id: bannedMerchant._id.toString(), role: 'MERCHANT', actor_type: 'MERCHANT' });
      const res = await request(app)
        .post('/v1/merchants/agents')
        .set('Authorization', `Bearer ${token}`)
        .set('x-test-no-fallback', 'true')
        .send({ full_name: 'Sub Agent' });
      
      expect(res.status).toBe(403);
      expect(res.body.message).toContain('deactivated or banned');
    });
  });

  describe('Route Input Validation Enforcements', () => {
    it('should enforce Joi validation on property update PUT /properties/:id', async () => {
      const token = generateTestToken({ id: activeAgent._id.toString(), role: 'AGENT', actor_type: 'AGENT' });
      const res = await request(app)
        .put('/v1/properties/some-prop-id')
        .set('Authorization', `Bearer ${token}`)
        .set('x-test-no-fallback', 'true')
        .send({
          invalidField: 'NotAllowed',
          price: -500, // Invalid: must be positive
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('should enforce Joi validation on merchant agent creation POST /merchants/agents', async () => {
      const token = generateTestToken({ id: activeMerchant._id.toString(), role: 'MERCHANT', actor_type: 'MERCHANT' });
      const res = await request(app)
        .post('/v1/merchants/agents')
        .set('Authorization', `Bearer ${token}`)
        .set('x-test-no-fallback', 'true')
        .send({
          email: 'notanemail', // Invalid email
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('should enforce Joi validation on preferences update PUT /notifications/preferences', async () => {
      const token = generateTestToken({ id: activeUser._id.toString(), role: 'USER', actor_type: 'USER' });
      const res = await request(app)
        .put('/v1/notifications/preferences')
        .set('Authorization', `Bearer ${token}`)
        .set('x-test-no-fallback', 'true')
        .send({
          quietHours: {
            enabled: true,
            start: 'invalid-time', // Should fail pattern matching
          },
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation failed');
    });
  });

  describe('Sensitive Data: Password Reset Token Exposure', () => {
    it('should NOT return plaintext token when not in test mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      try {
        const res = await request(app)
          .post('/v1/auth/forgot-password')
          .send({ email: activeUser.email });
        
        expect(res.status).toBe(200);
        expect(res.body.data.token).toBe('[REDACTED]');
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});
