import { describe, expect, it } from 'vitest';
import { createAgentSchema } from '../validators/agent.validator.js';

describe('Phase 11 agent contract', () => {
  it('validates an agent registration payload', () => {
    const { error } = createAgentSchema.validate({
      full_name: 'John Doe',
      company: 'Prime Estates',
      email: 'john@example.com',
      phone: '08011223344',
      password_hash: 'hashed-password',
    });

    expect(error).toBeUndefined();
  });
});
