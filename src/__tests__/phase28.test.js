import { describe, it, expect } from 'vitest';
import User from '../models/user.model.js';

describe('Phase 28: User model validation', () => {
  it('should require first_name, last_name, email, and phone', () => {
    const user = new User({ password_hash: 'hash123' });
    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.first_name).toBeDefined();
    expect(error.errors.last_name).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.phone).toBeDefined();
  });

  it('should enforce first_name minimum length of 2', () => {
    const user = new User({
      first_name: 'A',
      last_name: 'Test',
      email: 'test@example.com',
      phone: '1234567',
      password_hash: 'hash123',
    });

    const error = user.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.first_name.message).toBe(
      'first_name must be at least 2 characters',
    );
  });

  it('should enforce last_name minimum length of 2', () => {
    const user = new User({
      first_name: 'John',
      last_name: 'B',
      email: 'test@example.com',
      phone: '1234567',
      password_hash: 'hash123',
    });

    const error = user.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.last_name.message).toBe(
      'last_name must be at least 2 characters',
    );
  });

  it('should enforce email regex validation', () => {
    const user = new User({
      first_name: 'John',
      last_name: 'Doe',
      email: 'invalid-email',
      phone: '1234567',
      password_hash: 'hash123',
    });

    const error = user.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.email.message).toBe('email must be a valid email');
  });

  it('should enforce phone minimum length of 7', () => {
    const user = new User({
      first_name: 'John',
      last_name: 'Doe',
      email: 'test@example.com',
      phone: '123456',
      password_hash: 'hash123',
    });

    const error = user.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.phone.message).toBe('phone must be at least 7 characters');
  });

  it('should create a valid user with all required fields', () => {
    const user = new User({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      password_hash: 'hash123',
    });

    const error = user.validateSync();
    expect(error).toBeUndefined();
  });
});
