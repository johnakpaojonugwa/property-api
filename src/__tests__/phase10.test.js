import { describe, expect, it } from 'vitest';
import { createUserSchema } from '../validators/user.validator.js';
import { createMerchantSchema } from '../validators/merchant.validator.js';

describe('Phase 10 user and merchant contracts', () => {
  it('validates a user registration payload', () => {
    const { error } = createUserSchema.validate({
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      phone: '08012345678',
      password_hash: 'hashed-password',
    });

    expect(error).toBeUndefined();
  });

  it('validates a merchant registration payload', () => {
    const { error } = createMerchantSchema.validate({
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '08087654321',
      password_hash: 'hashed-password',
    });

    expect(error).toBeUndefined();
  });
});
