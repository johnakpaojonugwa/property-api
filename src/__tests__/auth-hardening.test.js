import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../app.js';
import { env } from '../config/env.js';
import User from '../models/user.model.js';
import Token from '../models/token.model.js';

describe('Authentication Hardening', () => {
  let dbConnection;
  let activeUser;
  let bannedUser;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/property-platform';
    dbConnection = await mongoose.connect(mongoUri);
    
    // Clean up any stale data
    await User.deleteMany({ email: /hardening-.*@example\.com/ });
    await Token.deleteMany({ email: /hardening-.*@example\.com/ });

    // Seed test users
    const passwordHash = await bcrypt.hash('password123', 10);
    activeUser = await User.create({
      first_name: 'Active',
      last_name: 'User',
      email: 'hardening-active@example.com',
      phone: '1234567890',
      password_hash: passwordHash,
      role: 'USER',
      isActive: true,
    });

    bannedUser = await User.create({
      first_name: 'Banned',
      last_name: 'User',
      email: 'hardening-banned@example.com',
      phone: '1234567890',
      password_hash: passwordHash,
      role: 'USER',
      isActive: false,
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /hardening-.*@example\.com/ });
    await Token.deleteMany({ email: /hardening-.*@example\.com/ });
    await mongoose.disconnect();
  });

  it('allows active users to log in', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'hardening-active@example.com',
        password: 'password123',
        actor_type: 'USER',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('denies login to deactivated/banned users', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'hardening-banned@example.com',
        password: 'password123',
        actor_type: 'USER',
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('deactivated or banned');
  });

  it('rejects deactivated/banned users in authentication middleware', async () => {
    const token = jwt.sign(
      { id: bannedUser._id.toString(), role: 'USER', actor_type: 'USER' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const res = await request(app)
      .put('/v1/notifications/preferences')
      .set('Authorization', `Bearer ${token}`)
      .set('x-test-no-fallback', 'true');
    
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('deactivated or banned');
  });

  it('explicitly handles expired tokens with a TOKEN_EXPIRED code', async () => {
    const token = jwt.sign(
      { id: activeUser._id.toString(), role: 'USER', actor_type: 'USER' },
      env.JWT_SECRET,
      { expiresIn: '-1h' }
    );
    
    const res = await request(app)
      .put('/v1/notifications/preferences')
      .set('Authorization', `Bearer ${token}`)
      .set('x-test-no-fallback', 'true');
    
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.errors[0].code).toBe('TOKEN_EXPIRED');
  });


  it('runs the password reset flow successfully', async () => {
    // 1. Forgot password
    const forgotRes = await request(app)
      .post('/v1/auth/forgot-password')
      .send({ email: 'hardening-active@example.com' });
    
    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.success).toBe(true);
    const resetToken = forgotRes.body.data.token;
    expect(resetToken).toBeDefined();

    // 2. Reset password
    const resetRes = await request(app)
      .post('/v1/auth/reset-password')
      .send({
        token: resetToken,
        password: 'newpassword123',
      });
    
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // 3. Login with new password
    const loginRes = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'hardening-active@example.com',
        password: 'newpassword123',
        actor_type: 'USER',
      });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });

  it('enforces rate limiting on login attempts', async () => {
    const testIp = '192.168.99.99';
    
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/v1/auth/login')
        .set('X-Forwarded-For', testIp)
        .send({ email: 'hardening-active@example.com', password: 'wrongpassword' });
    }
    
    const res = await request(app)
      .post('/v1/auth/login')
      .set('X-Forwarded-For', testIp)
      .send({ email: 'hardening-active@example.com', password: 'wrongpassword' });
    
    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Too many login attempts');
  }, 20000);
});
