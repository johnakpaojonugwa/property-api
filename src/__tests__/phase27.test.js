import { describe, expect, it } from 'vitest';
import Merchant from '../models/merchant.model.js';

describe('Phase 27 merchant model validation', () => {
  it('requires a valid merchant name and email before saving', async () => {
    const merchant = new Merchant({ phone: '1234567' });
    const error = merchant.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.full_name).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });
});
