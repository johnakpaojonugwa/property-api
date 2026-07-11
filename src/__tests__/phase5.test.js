import { describe, expect, it } from 'vitest';
import { createPropertySchema } from '../validators/property.validator.js';
import Property from '../models/property.model.js';

describe('Phase 5 property foundation', () => {
  it('validates a property payload against the contract', () => {
    const { error } = createPropertySchema.validate({
      name: 'Luxury Villa',
      price: 500000,
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lekki',
      category: 'FLAT',
      property_use: 'RESIDENTIAL',
      payment_plan: 'MONTHLY',
      type: 'RENT',
      agent: '64b6f5c6f9d0c2a1b2c3d4e5',
    });

    expect(error).toBeUndefined();
  });

  it('creates a property document with default verification state', () => {
    const property = new Property({
      name: 'Luxury Villa',
      price: 500000,
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lekki',
      category: 'FLAT',
      property_use: 'RESIDENTIAL',
      payment_plan: 'MONTHLY',
      type: 'RENT',
      agent: '64b6f5c6f9d0c2a1b2c3d4e5',
    });

    expect(property.is_verified).toBe(false);
    expect(property.is_sold).toBe(false);
  });
});
