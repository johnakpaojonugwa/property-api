import { describe, it, expect } from 'vitest';
import Appointment from '../models/appointment.model.js';

describe('Phase 30: Appointment model validation', () => {
  it('should require property_id, user_id, agent_id, date, and time fields', () => {
    const appointment = new Appointment({});
    const error = appointment.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.property_id).toBeDefined();
    expect(error.errors.user_id).toBeDefined();
    expect(error.errors.agent_id).toBeDefined();
    expect(error.errors.date).toBeDefined();
    expect(error.errors['time.from']).toBeDefined();
    expect(error.errors['time.to']).toBeDefined();
  });

  it('should require time.from and time.to', () => {
    const appointment = new Appointment({
      property_id: '507f1f77bcf86cd799439011',
      user_id: '507f1f77bcf86cd799439012',
      agent_id: '507f1f77bcf86cd799439013',
      date: '2026-07-10',
      time: {},
    });

    const error = appointment.validateSync();
    expect(error).toBeDefined();
    expect(error.errors['time.from']).toBeDefined();
    expect(error.errors['time.to']).toBeDefined();
  });

  it('should enforce date minimum length of 8 chars', () => {
    const appointment = new Appointment({
      property_id: '507f1f77bcf86cd799439011',
      user_id: '507f1f77bcf86cd799439012',
      agent_id: '507f1f77bcf86cd799439013',
      date: '2026-7',
      time: {
        from: '09:00',
        to: '10:00',
      },
    });

    const error = appointment.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.date.message).toBe('date must be at least 8 characters');
  });

  it('should enforce time.from minimum length of 4 chars', () => {
    const appointment = new Appointment({
      property_id: '507f1f77bcf86cd799439011',
      user_id: '507f1f77bcf86cd799439012',
      agent_id: '507f1f77bcf86cd799439013',
      date: '2026-07-10',
      time: {
        from: '9am',
        to: '10:00',
      },
    });

    const error = appointment.validateSync();
    expect(error).toBeDefined();
    expect(error.errors['time.from'].message).toBe('from must be at least 4 characters');
  });

  it('should enforce time.to minimum length of 4 chars', () => {
    const appointment = new Appointment({
      property_id: '507f1f77bcf86cd799439011',
      user_id: '507f1f77bcf86cd799439012',
      agent_id: '507f1f77bcf86cd799439013',
      date: '2026-07-10',
      time: {
        from: '09:00',
        to: '10a',
      },
    });

    const error = appointment.validateSync();
    expect(error).toBeDefined();
    expect(error.errors['time.to'].message).toBe('to must be at least 4 characters');
  });

  it('should create a valid appointment with all required fields', () => {
    const appointment = new Appointment({
      property_id: '507f1f77bcf86cd799439011',
      user_id: '507f1f77bcf86cd799439012',
      agent_id: '507f1f77bcf86cd799439013',
      date: '2026-07-10',
      time: {
        from: '09:00',
        to: '10:00',
      },
    });

    const error = appointment.validateSync();
    expect(error).toBeUndefined();
  });
});
