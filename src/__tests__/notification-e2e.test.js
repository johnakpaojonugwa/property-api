import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/user.model.js';
import Agent from '../models/agent.model.js';
import Property from '../models/property.model.js';
import Appointment from '../models/appointment.model.js';
import Notification from '../models/notification.model.js';
import AppointmentService from '../services/appointment.service.js';

describe('Notification E2E Test on Appointment Creation', () => {
  let dbConnection;
  let testUser;
  let testAgent;
  let testProperty;
  let createdAppointmentId;

  beforeAll(async () => {
    // 1. Establish database connection directly (avoiding the env.NODE_ENV === 'test' bypass)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/property-platform';
    dbConnection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    expect(dbConnection).toBeDefined();

    // 2. Clean up any stale test documents from previous runs
    await User.deleteMany({ email: /e2e-test-.*@example\.com/ });
    await Agent.deleteMany({ email: /e2e-test-.*@example\.com/ });
    await Property.deleteMany({ name: 'E2E Test Property' });
    await Appointment.deleteMany({ 'time.from': '09:00', 'time.to': '10:00' });
    await Notification.deleteMany({ type: 'showing_request', category: 'management' });

    // 3. Seed test Agent
    testAgent = await Agent.create({
      full_name: 'E2E Agent',
      email: 'e2e-test-agent@example.com',
      phone: '1234567890',
      password_hash: 'mockhash',
    });

    // 4. Seed test User
    testUser = await User.create({
      first_name: 'E2E',
      last_name: 'User',
      email: 'e2e-test-user@example.com',
      phone: '0987654321',
      password_hash: 'mockhash',
      role: 'USER',
    });

    // 5. Seed test Property
    testProperty = await Property.create({
      name: 'E2E Test Property',
      price: 150000,
      country: 'USA',
      state: 'NY',
      city: 'New York',
      category: 'APARTMENT',
      property_use: 'RESIDENTIAL',
      payment_plan: 'PER_ANNUM',
      type: 'RENT',
      agent: testAgent._id,
    });
  });

  afterAll(async () => {
    // Clean up E2E documents
    if (testUser) {
      await User.findByIdAndDelete(testUser._id);
    }
    if (testAgent) {
      await Agent.findByIdAndDelete(testAgent._id);
    }
    if (testProperty) {
      await Property.findByIdAndDelete(testProperty._id);
    }
    if (createdAppointmentId) {
      await Appointment.findByIdAndDelete(createdAppointmentId);
    }
    if (testAgent) {
      await Notification.deleteMany({
        recipientId: testAgent._id,
        type: 'showing_request',
      });
    }
    await mongoose.disconnect();
  });

  it('should successfully create an appointment and trigger a showing_request notification', async () => {
    // 1. Invoke the appointment creation service
    const actor = { id: testUser._id.toString(), role: 'USER' };
    const appointmentData = {
      property_id: testProperty._id.toString(),
      agent_id: testAgent._id.toString(),
      date: '2026-08-15',
      time: {
        from: '09:00',
        to: '10:00',
      },
    };

    const appointment = await AppointmentService.createAppointment(appointmentData, actor);
    expect(appointment).toBeDefined();
    expect(appointment._id).toBeDefined();
    createdAppointmentId = appointment._id;

    // 2. Query the notification database to verify that showing_request was triggered
    // Wait a brief moment to ensure async notification creation completes
    await new Promise((resolve) => setTimeout(resolve, 800));

    const notification = await Notification.findOne({
      recipientId: testAgent._id,
      type: 'showing_request',
      sourceId: appointment._id,
    });

    expect(notification).toBeDefined();
    expect(notification.recipientRole).toBe('agent');
    expect(notification.actorRole).toBe('user');
    expect(notification.triggeredByUserId.toString()).toBe(testUser._id.toString());
    expect(notification.title).toBe('New Showing Request');
    expect(notification.category).toBe('management');
    expect(notification.isRead).toBe(false);
    expect(notification.message).toContain('E2E User requested a tour appointment for the property "E2E Test Property".');
  }, 30000);
});
