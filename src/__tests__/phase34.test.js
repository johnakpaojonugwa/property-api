import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Phase 34: Input validation and error handling', () => {
  it('should reject requests with invalid full_name (too short)', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'A',
      email: 'test@example.com',
      phone: '1234567890',
      password_hash: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeDefined();
  });

  it('should reject requests with invalid email', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'John Doe',
      email: 'invalid-email',
      phone: '1234567890',
      password_hash: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject requests with invalid phone (too short)', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'John Doe',
      email: 'test@example.com',
      phone: '123',
      password_hash: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject requests with missing required fields', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'John Doe',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject requests with unknown fields', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'John Doe',
      email: 'test@example.com',
      phone: '1234567890',
      password_hash: 'password123',
      unknownField: 'should be rejected',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should accept valid agent creation data', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'John Doe',
      email: 'test@example.com',
      phone: '1234567890',
      password_hash: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should accept optional fields in agent creation', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '9876543210',
      password_hash: 'password123',
      company: 'Real Estate Co',
      avatar: 'https://example.com/avatar.jpg',
      is_verified: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should format validation error messages consistently', async () => {
    const res = await request(app).post('/v1/agents').send({
      full_name: 'A',
      email: 'invalid',
      phone: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('message');
  });
});
