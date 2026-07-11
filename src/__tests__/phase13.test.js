import { describe, expect, it, vi } from 'vitest';
import authorize from '../middlewares/authorize.js';

describe('Phase 13 authorization middleware', () => {
  it('allows an agent when the role is permitted', () => {
    const req = { actor: { type: 'AGENT' } };
    const next = vi.fn();

    authorize(['AGENT'])(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('blocks a user when the role is not permitted', () => {
    const req = { actor: { type: 'USER' } };
    const next = vi.fn();

    authorize(['MERCHANT'])(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
