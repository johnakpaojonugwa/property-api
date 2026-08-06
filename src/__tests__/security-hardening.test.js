import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import app from '../app.js';
import { env } from '../config/env.js';
import User from '../models/user.model.js';
import Agent from '../models/agent.model.js';
import Merchant from '../models/merchant.model.js';
import Property from '../models/property.model.js';
import Appointment from '../models/appointment.model.js';
import Notification from '../models/notification.model.js';
import Token from '../models/token.model.js';

describe('Security Hardening Integration Tests', () => {
  let dbConnection;
  let merchant1, merchant2;
  let agent1, agent2;
  let user1;
  let property1;
  let appointment1;

  let m1Token, m2Token, a1Token, a2Token, u1Token;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/property-platform';
    dbConnection = await mongoose.connect(mongoUri);

    // Clean up
    await User.deleteMany({ email: /sec-.*@example\.com/ });
    await Agent.deleteMany({ email: /sec-.*@example\.com/ });
    await Merchant.deleteMany({ email: /sec-.*@example\.com/ });
    await Property.deleteMany({ name: /sec-property-.*/ });
    await Appointment.deleteMany({});
    await Notification.deleteMany({});
    await Token.deleteMany({ email: /sec-.*@example\.com/ });

    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Merchants
    merchant1 = await Merchant.create({
      full_name: 'Sec Merchant 1',
      email: 'sec-m1@example.com',
      phone: '1112223333',
      password_hash: passwordHash,
      is_verified: true,
    });

    merchant2 = await Merchant.create({
      full_name: 'Sec Merchant 2',
      email: 'sec-m2@example.com',
      phone: '2223334444',
      password_hash: passwordHash,
      is_verified: true,
    });

    // Create Agents
    agent1 = await Agent.create({
      full_name: 'Sec Agent 1',
      email: 'sec-a1@example.com',
      phone: '3334445555',
      password_hash: passwordHash,
      merchant: merchant1._id,
      is_verified: true,
    });

    agent2 = await Agent.create({
      full_name: 'Sec Agent 2',
      email: 'sec-a2@example.com',
      phone: '4445556666',
      password_hash: passwordHash,
      merchant: merchant1._id,
      is_verified: true,
    });

    // Create User
    user1 = await User.create({
      first_name: 'Sec',
      last_name: 'User',
      email: 'sec-u1@example.com',
      phone: '5556667777',
      password_hash: passwordHash,
      role: 'USER',
      isActive: true,
    });

    // Create Property P1 managed by Agent 1 under Merchant 1
    property1 = await Property.create({
      name: 'sec-property-1',
      price: 150000,
      country: 'USA',
      state: 'TX',
      city: 'Austin',
      category: 'DUPLEX',
      property_use: 'RESIDENTIAL',
      payment_plan: 'PER_ANNUM',
      type: 'SALES',
      agent: agent1._id,
      merchant: merchant1._id,
      is_verified: true,
    });

    // Create Showing Appointment between User 1 and Agent 1
    appointment1 = await Appointment.create({
      property_id: property1._id,
      user_id: user1._id,
      agent_id: agent1._id,
      date: '2026-08-10',
      time: { from: '10:00', to: '11:00' },
      confirmed: true,
    });

    // Tokens
    m1Token = jwt.sign({ id: merchant1._id.toString(), role: 'MERCHANT' }, env.JWT_SECRET);
    m2Token = jwt.sign({ id: merchant2._id.toString(), role: 'MERCHANT' }, env.JWT_SECRET);
    a1Token = jwt.sign({ id: agent1._id.toString(), role: 'AGENT', merchant_id: merchant1._id.toString() }, env.JWT_SECRET);
    a2Token = jwt.sign({ id: agent2._id.toString(), role: 'AGENT', merchant_id: merchant1._id.toString() }, env.JWT_SECRET);
    u1Token = jwt.sign({ id: user1._id.toString(), role: 'USER' }, env.JWT_SECRET);
  }, 30000);

  afterAll(async () => {
    await User.deleteMany({ email: /sec-.*@example\.com/ });
    await Agent.deleteMany({ email: /sec-.*@example\.com/ });
    await Merchant.deleteMany({ email: /sec-.*@example\.com/ });
    await Property.deleteMany({ name: /sec-property-.*/ });
    await Appointment.deleteMany({});
    await Notification.deleteMany({});
    await Token.deleteMany({ email: /sec-.*@example\.com/ });
    await mongoose.disconnect();
  });

  it('SEC-02: denies Merchant 2 from accessing Merchant 1 wishlist', async () => {
    const res = await request(app)
      .get(`/v1/merchants/${merchant1._id.toString()}/wishlist`)
      .set('Authorization', `Bearer ${m2Token}`)
      .set('x-test-no-fallback', 'true');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('SEC-02: allows Merchant 1 to access their own wishlist', async () => {
    const res = await request(app)
      .get(`/v1/merchants/${merchant1._id.toString()}/wishlist`)
      .set('Authorization', `Bearer ${m1Token}`)
      .set('x-test-no-fallback', 'true');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('SEC-04: denies Agent 2 from modifying Agent 1 property under same Merchant', async () => {
    const res = await request(app)
      .put(`/v1/properties/${property1._id.toString()}`)
      .set('Authorization', `Bearer ${a2Token}`)
      .set('x-test-no-fallback', 'true')
      .send({ price: 160000 });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('SEC-04: allows Agent 1 to modify their own property listing', async () => {
    const res = await request(app)
      .put(`/v1/properties/${property1._id.toString()}`)
      .set('Authorization', `Bearer ${a1Token}`)
      .set('x-test-no-fallback', 'true')
      .send({ price: 165000 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('SEC-03: restricts Agent 1 from seeing client private system notifications', async () => {
    // Seed notifications for User 1
    const nPrivate = await Notification.create({
      recipientId: user1._id,
      recipientRole: 'user',
      actorRole: 'admin',
      sourceType: 'system',
      type: 'security_alert',
      category: 'system',
      priority: 'high',
      title: 'Private Security Notification',
      message: 'Someone logged into your account.',
      isRead: false,
    });

    const nShowing = await Notification.create({
      recipientId: user1._id,
      recipientRole: 'user',
      actorRole: 'agent',
      triggeredByUserId: agent1._id,
      sourceType: 'showing',
      sourceId: appointment1._id,
      type: 'showing_confirmed',
      category: 'engagement',
      priority: 'medium',
      title: 'Showing Confirmed',
      message: 'Your tour request is confirmed.',
      isRead: false,
    });

    // Query notifications of User 1 as Agent 1
    const res = await request(app)
      .get(`/v1/notifications?recipientId=${user1._id.toString()}`)
      .set('Authorization', `Bearer ${a1Token}`)
      .set('x-test-no-fallback', 'true');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const notifications = res.body.data.notifications;
    const notificationIds = notifications.map((n) => n._id.toString());

    // Agent should see the showing confirmed notification, but not the private security alert!
    expect(notificationIds).toContain(nShowing._id.toString());
    expect(notificationIds).not.toContain(nPrivate._id.toString());
  });

  it('SEC-05 & Hashing: hashes forgot-password tokens and handles reset successfully', async () => {
    const forgotRes = await request(app)
      .post('/v1/auth/forgot-password')
      .send({ email: 'sec-u1@example.com' });

    expect(forgotRes.status).toBe(200);
    const rawToken = forgotRes.body.data.token;
    expect(rawToken).toBeDefined();
    expect(rawToken).not.toBe('[REDACTED]');

    // Query database to ensure token is hashed with SHA-256 (not stored in plaintext)
    const tokenDocs = await Token.find({ email: 'sec-u1@example.com' });
    expect(tokenDocs.length).toBe(1);
    const storedToken = tokenDocs[0].token;
    expect(storedToken).not.toBe(rawToken);
    
    const computedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    expect(storedToken).toBe(computedHash);

    // Reset password using raw token
    const resetRes = await request(app)
      .post('/v1/auth/reset-password')
      .send({
        token: rawToken,
        password: 'newsecurepassword',
      });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);
  });

  it('Bearer: accepts standard Bearer token correctly', async () => {
    const res = await request(app)
      .get(`/v1/merchants/${merchant1._id.toString()}/wishlist`)
      .set('Authorization', `bearer ${m1Token}`)
      .set('x-test-no-fallback', 'true');
    expect(res.status).toBe(200);
  });
});
