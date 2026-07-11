import { describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { loginSchema } from '../validators/auth.validator.js';

describe('Phase 3 auth foundation', () => {
  it('creates a signed jwt payload for authenticated actors', () => {
    const token = jwt.sign({ id: 'actor-1', actor_type: 'USER' }, env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, env.JWT_SECRET);

    expect(decoded.actor_type).toBe('USER');
  });

  it('rejects missing auth headers', async () => {
    const req = { headers: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
  });

  it('allows only the configured actor role', async () => {
    const req = { actor: { type: 'USER' } };
    const next = vi.fn();

    authorize(['USER'])(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('validates login payloads', () => {
    const { error } = loginSchema.validate({ email: 'user@example.com', password: 'secret123' });

    expect(error).toBeUndefined();
  });
});
