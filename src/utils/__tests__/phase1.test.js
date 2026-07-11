import { describe, expect, it } from 'vitest';
import ApiError from '../ApiError.js';
import ApiResponse from '../ApiResponse.js';
import { env } from '../../config/env.js';

describe('Phase 1 backend foundation', () => {
  it('creates consistently shaped API errors', () => {
    const error = ApiError.badRequest('Invalid payload', [{ field: 'email', message: 'Required' }]);

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid payload');
    expect(error.errors).toEqual([{ field: 'email', message: 'Required' }]);
  });

  it('creates the standard success envelope', () => {
    const payload = ApiResponse.success({ id: '1' }, 'Property created');

    expect(payload).toEqual({
      success: true,
      data: { id: '1' },
      message: 'Property created',
      meta: undefined,
    });
  });

  it('loads environment values from the edge', () => {
    expect(env.NODE_ENV).toBeDefined();
    expect(env.PORT).toBeGreaterThan(0);
    expect(env.JWT_SECRET).toBeTruthy();
    expect(env.MONGODB_URI).toBeTruthy();
  });
});
