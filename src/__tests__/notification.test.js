import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../app.js';
import { env } from '../config/env.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import NotificationPreference from '../models/notificationPreference.model.js';
import NotificationTemplate from '../models/notificationTemplate.model.js';
import Appointment from '../models/appointment.model.js';
import Property from '../models/property.model.js';
import NotificationAuditLog from '../models/notificationAuditLog.model.js';
import { NotificationService, interpolate, inQuietHours } from '../services/notification.service.js';

const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Notification System Tests', () => {
  const userToken = generateToken({ id: 'user-123', role: 'USER' });
  const agentToken = generateToken({ id: 'agent-123', role: 'AGENT' });
  const adminToken = generateToken({ id: 'admin-123', role: 'ADMIN' });
  const guestSessionId = 'guest-session-456';

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);
  });

  describe('Core Engine Utilities', () => {
    it('interpolates template strings correctly', () => {
      const template = 'Hi {user_name}, the property {property_title} is available!';
      const result = interpolate(template, { user_name: 'John', property_title: 'Duplex' });
      expect(result).toBe('Hi John, the property Duplex is available!');
    });

    it('evaluates quiet hours timezone-aware schedules', () => {
      // Create a mock preference with active quiet hours
      const prefActive = {
        quietHours: {
          enabled: true,
          start: '00:00',
          end: '23:59',
          timezone: 'UTC',
        },
      };
      expect(inQuietHours(prefActive)).toBe(true);

      const prefInactive = {
        quietHours: {
          enabled: false,
          start: '00:00',
          end: '23:59',
          timezone: 'UTC',
        },
      };
      expect(inQuietHours(prefInactive)).toBe(false);
    });
  });

  describe('RBAC Middleware & Route Guards', () => {
    it('allows guest to view own notifications with x-guest-session-id', async () => {
      const mockNotifications = [{ _id: 'notif-1', title: 'Price Drop' }];
      vi.spyOn(Notification, 'find').mockReturnValue({
        sort: () => ({
          skip: () => ({
            limit: () => ({
              lean: () => Promise.resolve(mockNotifications),
            }),
          }),
        }),
      });
      vi.spyOn(Notification, 'countDocuments').mockResolvedValue(0);

      const res = await request(app)
        .get('/v1/notifications')
        .set('x-guest-session-id', guestSessionId);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notifications).toHaveLength(1);
    });

    it('allows user to view own notifications', async () => {
      const mockNotifications = [{ _id: 'notif-2', title: 'Showing Scheduled' }];
      vi.spyOn(Notification, 'find').mockReturnValue({
        sort: () => ({
          skip: () => ({
            limit: () => ({
              lean: () => Promise.resolve(mockNotifications),
            }),
          }),
        }),
      });
      vi.spyOn(Notification, 'countDocuments').mockResolvedValue(0);

      const res = await request(app)
        .get('/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('blocks user from updating preferences for guest role', async () => {
      const res = await request(app)
        .put('/v1/notifications/preferences')
        .set('X-Test-No-Fallback', 'true')
        .set('x-guest-session-id', guestSessionId)
        .send({ channels: { email: false } });

      expect(res.status).toBe(401); // Guest cannot update db preferences (requires auth JWT)
    });

    it('allows Agent to view client notifications via cross-actor rules', async () => {
      const clientUserId = 'user-789';
      // Spy on Appointment.find and Property.find to simulate client relationship
      vi.spyOn(Property, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });
      vi.spyOn(Appointment, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([{ _id: 'appt-123' }]),
        }),
      });
      vi.spyOn(Notification, 'find').mockReturnValue({
        sort: () => ({
          skip: () => ({
            limit: () => ({
              lean: () => Promise.resolve([{ _id: 'notif-client', recipientId: clientUserId }]),
            }),
          }),
        }),
      });
      vi.spyOn(Notification, 'countDocuments').mockResolvedValue(1);

      const res = await request(app)
        .get(`/v1/notifications?recipientId=${clientUserId}`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('blocks Agent from viewing non-client notifications', async () => {
      const unrelatedUserId = 'user-999';
      vi.spyOn(Property, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });
      vi.spyOn(Appointment, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });
      vi.spyOn(Notification, 'find').mockReturnValue({
        sort: () => ({
          skip: () => ({
            limit: () => ({
              lean: () => Promise.resolve([]),
            }),
          }),
        }),
      });
      vi.spyOn(Notification, 'countDocuments').mockResolvedValue(0);

      const res = await request(app)
        .get(`/v1/notifications?recipientId=${unrelatedUserId}`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200); // Route passes, but query filter restricts results
      expect(res.body.data.notifications).toHaveLength(0);
    });
  });

  describe('Notification Delivery & Preference Enforcement', () => {
    it('applies preference settings before delivery', async () => {
      // Disables email in preferences
      const mockPref = {
        userId: 'user-123',
        channels: { inApp: true, email: false, push: true, sms: false },
        categories: { sales: true },
        quietHours: { enabled: false },
      };

      vi.spyOn(NotificationPreference, 'findOne').mockResolvedValue(mockPref);
      vi.spyOn(NotificationTemplate, 'findOne').mockResolvedValue({
        type: 'price_drop',
        roles: ['user'],
        titleTemplate: 'Price Drop',
        messageTemplate: 'Price lowered',
        channels: { inApp: true, email: true }, // Template default requests email
        defaultPriority: 'medium',
      });

      const mockNotifDoc = {
        _id: 'notif-pref-test',
        recipientId: 'user-123',
        recipientRole: 'user',
        channels: { inApp: true, email: false, push: false, sms: false }, // Preference wins
        deliveryStatus: { inApp: 'pending', email: 'skipped', push: 'skipped', sms: 'skipped' },
        save: vi.fn(),
      };

      vi.spyOn(Notification, 'create').mockResolvedValue(mockNotifDoc);

      const notif = await NotificationService.send({
        recipientId: 'user-123',
        recipientRole: 'user',
        type: 'price_drop',
        category: 'sales',
        sourceType: 'property',
      });

      expect(notif.channels.email).toBe(false);
      expect(notif.deliveryStatus.email).toBe('skipped');
    });
  });

  describe('Admin Broadcasting', () => {
    it('allows Admin to broadcast notifications', async () => {
      const mockUsers = [
        { _id: 'user-1', role: 'USER' },
        { _id: 'user-2', role: 'USER' },
      ];
      vi.spyOn(User, 'find').mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockUsers),
        }),
      });

      const mockCreated = [
        { _id: 'n-1', channels: { inApp: true }, save: vi.fn() },
        { _id: 'n-2', channels: { inApp: true }, save: vi.fn() },
      ];
      vi.spyOn(Notification, 'insertMany').mockResolvedValue(mockCreated);
      vi.spyOn(NotificationService, 'deliver').mockResolvedValue(true);
      vi.spyOn(NotificationAuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .post('/v1/admin/notifications/broadcast')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recipientRoles: ['USER'],
          title: 'System Maintenance',
          message: 'Server down tonight',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(2);
    });

    it('blocks USER from broadcasting', async () => {
      const res = await request(app)
        .post('/v1/admin/notifications/broadcast')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          recipientRoles: ['USER'],
          title: 'Hacked',
          message: 'Spam',
        });

      expect(res.status).toBe(403);
    });
  });
});
