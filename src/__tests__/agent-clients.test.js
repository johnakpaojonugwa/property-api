import { describe, expect, it, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../app.js';
import { env } from '../config/env.js';
import User from '../models/user.model.js';
import Agent from '../models/agent.model.js';
import Merchant from '../models/merchant.model.js';
import Appointment from '../models/appointment.model.js';
import userService from '../services/user.service.js';

const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET || 'secret', { expiresIn: '1h' });
};

describe('Agent and Merchant Client isolation & RBAC Tests', () => {
  const agentId = '64b6f5c6f9d0c2a1b2c3d4e1';
  const merchantId = '64b6f5c6f9d0c2a1b2c3d4e2';
  const otherAgentId = '64b6f5c6f9d0c2a1b2c3d4e3';
  const otherMerchantId = '64b6f5c6f9d0c2a1b2c3d4e4';

  const agentToken = generateToken({ id: agentId, role: 'AGENT', actor_type: 'AGENT', merchant_id: merchantId });
  const merchantToken = generateToken({ id: merchantId, role: 'MERCHANT', actor_type: 'MERCHANT' });
  const otherAgentToken = generateToken({ id: otherAgentId, role: 'AGENT', actor_type: 'AGENT', merchant_id: otherMerchantId });
  const otherMerchantToken = generateToken({ id: otherMerchantId, role: 'MERCHANT', actor_type: 'MERCHANT' });

  beforeAll(() => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);
  });

  beforeEach(() => {
    vi.restoreAllMocks();

    // Mock readyState to 1
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);

    // Mock Appointment.exists to prevent actual database connections hanging
    vi.spyOn(Appointment, 'exists').mockResolvedValue(false);

    // Mock authenticate.js database checks to succeed
    vi.spyOn(Agent, 'findById').mockImplementation((id) => {
      const targetId = id ? id.toString() : agentId;
      return {
        select: () => ({
          lean: () => Promise.resolve({ _id: targetId, isActive: true, merchant: merchantId }),
        }),
        lean: () => Promise.resolve({ _id: targetId, isActive: true, merchant: merchantId }),
      };
    });

    vi.spyOn(Merchant, 'findById').mockImplementation((id) => {
      const targetId = id ? id.toString() : merchantId;
      return {
        select: () => ({
          lean: () => Promise.resolve({ _id: targetId, isActive: true }),
        }),
        lean: () => Promise.resolve({ _id: targetId, isActive: true }),
      };
    });
  });

  describe('User Registration & Privilege Escalation Protection', () => {
    it('allows an Agent to register a client, forcing the role to USER and setting the agent/merchant references', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue(null);
      
      const mockCreatedUser = {
        _id: 'user-789',
        first_name: 'John',
        last_name: 'Client',
        email: 'john@client.com',
        role: 'USER',
        agent: agentId,
        merchant: merchantId,
      };

      vi.spyOn(User, 'create').mockImplementation(async (payload) => {
        expect(payload.role).toBe('USER');
        expect(payload.agent).toBe(agentId);
        expect(payload.merchant).toBe(merchantId);
        return {
          toObject: () => mockCreatedUser,
        };
      });

      const res = await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${agentToken}`)
        .set('X-Test-No-Fallback', 'true')
        .send({
          first_name: 'John',
          last_name: 'Client',
          email: 'john@client.com',
          phone: '09011112222',
          password: 'password123',
          role: 'USER',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.role).toBe('USER');
      expect(res.body.data.agent).toBe(agentId);
      expect(res.body.data.merchant).toBe(merchantId);
    });

    it('rejects client registration with invalid roles (like ADMIN) at the Joi validation layer', async () => {
      const res = await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${agentToken}`)
        .set('X-Test-No-Fallback', 'true')
        .send({
          first_name: 'John',
          last_name: 'Client',
          email: 'john@client.com',
          phone: '09011112222',
          password: 'password123',
          role: 'ADMIN', // Blocked by Joi schema
        });

      expect(res.status).toBe(400);
    });

    it('service layer: forces role to USER even if custom role is bypassed/supplied to createUser directly', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue(null);
      
      const mockCreatedUser = { _id: 'user-789', role: 'USER' };
      vi.spyOn(User, 'create').mockImplementation(async (payload) => {
        expect(payload.role).toBe('USER');
        return {
          toObject: () => mockCreatedUser,
        };
      });

      const result = await userService.createUser(
        { first_name: 'John', last_name: 'Client', email: 'john@client.com', phone: '09011112222', role: 'ADMIN' },
        { id: agentId, role: 'AGENT' }
      );
      expect(result.role).toBe('USER');
    });
  });

  describe('User Listing Isolation', () => {
    it('allows an Agent to list users, returning only clients bound to them directly or via appointments', async () => {
      // Mock appointments for agentId
      vi.spyOn(Appointment, 'find').mockReturnValue({
        select: () => ({
          lean: () => Promise.resolve([{ user_id: 'user-appt-1' }]),
        }),
      });

      const mockUsers = [
        { _id: 'user-created-1', first_name: 'Created', role: 'USER', agent: agentId },
        { _id: 'user-appt-1', first_name: 'Appt', role: 'USER' },
      ];

      vi.spyOn(User, 'find').mockImplementation((filter) => {
        expect(filter.role.$nin).toContain('ADMIN');
        expect(filter.$or).toBeDefined();
        
        return {
          skip: () => ({
            limit: () => ({
              lean: () => Promise.resolve(mockUsers),
            }),
          }),
        };
      });

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${agentToken}`)
        .set('X-Test-No-Fallback', 'true');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('allows a Merchant to list users, returning only clients bound to their merchant ID', async () => {
      const mockMerchantUsers = [
        { _id: 'user-created-1', first_name: 'Created', role: 'USER', merchant: merchantId },
      ];

      vi.spyOn(User, 'find').mockImplementation((filter) => {
        expect(filter.role.$nin).toContain('ADMIN');
        expect(filter.merchant).toBe(merchantId);

        return {
          skip: () => ({
            limit: () => ({
              lean: () => Promise.resolve(mockMerchantUsers),
            }),
          }),
        };
      });

      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${merchantToken}`)
        .set('X-Test-No-Fallback', 'true');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('User Details, Updates, and Deletion Security checks', () => {
    const clientId = '64b6f5c6f9d0c2a1b2c3d4e9';
    const mockClient = {
      _id: clientId,
      first_name: 'Target',
      role: 'USER',
      agent: agentId,
      merchant: merchantId,
    };

    beforeEach(() => {
      // Mock User.findById for details and verification steps
      vi.spyOn(User, 'findById').mockImplementation((id) => {
        const targetId = id ? id.toString() : clientId;
        const mockObj = {
          _id: targetId,
          first_name: 'Target',
          role: targetId === 'admin-id' ? 'ADMIN' : 'USER',
          agent: agentId,
          merchant: merchantId,
        };
        return {
          select: () => ({
            lean: () => Promise.resolve(mockObj),
          }),
          lean: () => Promise.resolve(mockObj),
        };
      });
    });

    it('allows agent to view details of their own client', async () => {
      const res = await request(app)
        .get(`/v1/users/${clientId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .set('X-Test-No-Fallback', 'true');

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(clientId);
    });

    it('blocks agent from viewing details of another agent client', async () => {
      const res = await request(app)
        .get(`/v1/users/${clientId}`)
        .set('Authorization', `Bearer ${otherAgentToken}`)
        .set('X-Test-No-Fallback', 'true');

      expect(res.status).toBe(403);
    });

    it('blocks non-admin from viewing admin user profile details', async () => {
      const res = await request(app)
        .get('/v1/users/admin-id')
        .set('Authorization', `Bearer ${agentToken}`)
        .set('X-Test-No-Fallback', 'true');

      expect(res.status).toBe(403);
    });

    it('allows agent to update their own client and strips administrative fields', async () => {
      vi.spyOn(User, 'findByIdAndUpdate').mockImplementation((id, data) => {
        expect(data.role).toBeUndefined();
        expect(data.agent).toBeUndefined();
        expect(data.merchant).toBeUndefined();
        return {
          lean: () => Promise.resolve({ ...mockClient, ...data }),
        };
      });

      // API Test: valid fields are updated, metadata is stripped by service
      const res = await request(app)
        .put(`/v1/users/${clientId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .set('X-Test-No-Fallback', 'true')
        .send({
          first_name: 'Updated Name',
        });

      expect(res.status).toBe(200);

      // Direct service test: verify service strips metadata (retains original and does not overwrite)
      const updateData = { role: 'ADMIN', agent: 'fake-agent', merchant: 'fake-merchant', first_name: 'Name' };
      const serviceResult = await userService.updateUser(clientId, updateData, { id: agentId, role: 'AGENT' });
      expect(serviceResult.role).toBe('USER');
      expect(serviceResult.agent).toBe(agentId);
      expect(serviceResult.merchant).toBe(merchantId);
    });

    it('blocks agent from deleting another agent client', async () => {
      const res = await request(app)
        .delete(`/v1/users/${clientId}`)
        .set('Authorization', `Bearer ${otherAgentToken}`)
        .set('X-Test-No-Fallback', 'true');

      expect(res.status).toBe(403);
    });

    it('allows agent to delete their own client', async () => {
      vi.spyOn(User, 'findByIdAndDelete').mockReturnValue({
        lean: () => Promise.resolve(mockClient),
      });

      const res = await request(app)
        .delete(`/v1/users/${clientId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .set('X-Test-No-Fallback', 'true');

      expect(res.status).toBe(200);
    });
  });
});
