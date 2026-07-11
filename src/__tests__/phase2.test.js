import { describe, expect, it, vi } from 'vitest';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../middlewares/validate.js';
import { createUserSchema } from '../validators/user.validator.js';
import User from '../models/user.model.js';
import Property from '../models/property.model.js';

describe('Phase 2 request and model foundation', () => {
  it('rejects invalid request bodies with a validation error', async () => {
    const req = { body: { first_name: '' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    const middleware = validate(createUserSchema);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
  });

  it('forwards thrown errors through the async handler', async () => {
    const next = vi.fn();
    const handler = asyncHandler(async () => {
      throw ApiError.badRequest('invalid');
    });

    await handler({}, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
  });

  it('creates user and property documents with sensible defaults', () => {
    const user = new User({
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      phone: '0000000000',
      password_hash: 'hashed-password',
    });

    const property = new Property({
      name: 'Ocean View Flat',
      price: 250000,
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Ikeja',
      category: 'FLAT',
      property_use: 'RESIDENTIAL',
      payment_plan: 'MONTHLY',
      type: 'RENT',
      agent: '64b6f5c6f9d0c2a1b2c3d4e5',
    });

    expect(user.role).toBe('USER');
    expect(user.email).toBe('ada@example.com');
    expect(property.is_verified).toBe(false);
    expect(property.is_sold).toBe(false);
  });
});
